use crate::pipeline::Node;
use fundsp::prelude32::*;
use std::f32::consts::PI;

struct Statistics {
    attack_coeff: f32,
    release_coeff: f32,
    prev_kurtosis: [f32; 2],
    prev_crest: [f32; 2],
    prev_flux: [f32; 2],
    prev_chs: BufferArray<U2>,
}

impl Statistics {
    pub fn new(sr: f32) -> Self {
        let attack_time = 0.4;
        let release_time = 3.0;
        let block_time = (MAX_BUFFER_SIZE as f32) / sr;
        let attack_coeff = (-block_time / attack_time).exp();
        let release_coeff = (-block_time / release_time).exp();

        Self {
            attack_coeff,
            release_coeff,
            prev_kurtosis: [3.0, 3.0],
            prev_crest: [1.0, 1.0],
            prev_flux: [1.0, 1.0],
            prev_chs: BufferArray::<U2>::new(),
        }
    }

    pub fn new_global(sr: f32) -> Self {
        let mut statistics = Self::new(sr);
        statistics.prev_kurtosis = [1.0, 1.0];
        statistics
    }

    pub fn reset(&mut self, global: bool) {
        self.prev_kurtosis = if global { [1.0, 1.0] } else { [3.0, 3.0] };
        self.prev_crest = [1.0, 1.0];
        self.prev_flux = [1.0, 1.0];

        for channel in 0..2 {
            self.prev_chs
                .buffer_mut()
                .channel_f32_mut(channel)
                .fill(0.0);
        }
    }

    pub fn kurtosis(&mut self, in_chs: &BufferArray<U2>) -> [f32; 2] {
        let mut k = [0.0, 0.0];

        for channel in 0..in_chs.channels() {
            let data = in_chs.buffer_ref().channel_f32(channel);
            let n = data.len() as f32;

            if n == 0.0 {
                continue;
            }

            let mean = data.iter().sum::<f32>() / n;

            let (m2_sum, m4_sum) = data.iter().fold((0.0, 0.0), |(s2, s4), &x| {
                let diff = x - mean;
                let diff2 = diff * diff;

                (s2 + diff2, s4 + diff2 * diff2)
            });

            let m2 = m2_sum / n;
            let m4 = m4_sum / n;

            let current_k = if m2 > 1e-6 {
                m4 / (m2 * m2)
            } else {
                3.0
            };

            let prev_k = self.prev_kurtosis[channel];

            let alpha = if current_k > prev_k {
                self.attack_coeff
            } else {
                self.release_coeff
            };

            k[channel] = (alpha * prev_k) + ((1.0 - alpha) * current_k);
        }

        self.prev_kurtosis = k;
        k
    }

    pub fn crest(&mut self, in_chs: &BufferArray<U2>) -> [f32; 2] {
        let mut c = [0.0, 0.0];

        for channel in 0..in_chs.channels() {
            let data = in_chs.buffer_ref().channel_f32(channel);
            let n = data.len() as f32;

            if n == 0.0 {
                continue;
            }

            let (sum_sq, abs_max) = data
                .iter()
                .fold((0.0_f32, 0.0_f32), |(s, m), &x| {
                    (s + x * x, m.max(x.abs()))
                });

            let rms = (sum_sq / n).sqrt();

            let current_c = if rms > 1e-6 {
                abs_max / rms
            } else {
                1.0
            };

            let prev_c = self.prev_crest[channel];

            let alpha = if current_c > prev_c {
                self.attack_coeff
            } else {
                self.release_coeff
            };

            c[channel] = (alpha * prev_c) + ((1.0 - alpha) * current_c);
        }

        self.prev_crest = c;
        c
    }

    pub fn flux(&mut self, in_chs: &BufferArray<U2>) -> [f32; 2] {
        let mut f = [0.0, 0.0];

        for channel in 0..in_chs.channels() {
            let prev_data = self.prev_chs.buffer_ref().channel_f32(channel);
            let data = in_chs.buffer_ref().channel_f32(channel);
            let n = data.len() as f32;

            if n == 0.0 {
                continue;
            }

            let fl = data
                .iter()
                .zip(prev_data.iter())
                .fold(0.0, |acc, (&x, &px)| acc + (x - px).abs())
                / n;

            self.prev_chs
                .buffer_mut()
                .channel_f32_mut(channel)
                .copy_from_slice(data);

            let current_f = if fl > 1e-6 { fl } else { 1.0 };
            let prev_f = self.prev_flux[channel];

            let alpha = if current_f > prev_f {
                self.attack_coeff
            } else {
                self.release_coeff
            };

            f[channel] = (alpha * prev_f) + ((1.0 - alpha) * current_f);
        }

        self.prev_flux = f;
        f
    }
}

/// 二阶导数 (D2x)
#[derive(Clone, Default)]
struct D2x<N: Size<f32>> {
    previous: Frame<f32, N>,
    is_first: bool,
    sample_rate: f64,
}

impl<N: Size<f32>> D2x<N> {
    pub fn new(sr: f32) -> Self {
        Self {
            previous: Frame::default(),
            is_first: true,
            sample_rate: sr as f64,
        }
    }
}

impl<N: Size<f32>> AudioNode for D2x<N> {
    const ID: u64 = 264;
    type Inputs = N;
    type Outputs = N;

    fn reset(&mut self) {
        self.previous = Frame::default();
        self.is_first = true;
    }

    fn set_sample_rate(&mut self, sample_rate: f64) {
        self.sample_rate = sample_rate;
    }

    #[inline]
    fn tick(
        &mut self,
        input: &Frame<f32, Self::Inputs>,
    ) -> Frame<f32, Self::Outputs> {
        input.clone()
    }

    fn process(
        &mut self,
        size: usize,
        input: &BufferRef,
        output: &mut BufferMut,
    ) {
        if size == 0 {
            return;
        }

        if self.is_first {
            for ch in 0..self.inputs() {
                self.previous[ch] = input.at_f32(ch, 0);
            }

            self.is_first = false;
        }

        if size == 1 {
            for ch in 0..self.inputs() {
                output.set_f32(ch, 0, 0.0);
                self.previous[ch] = input.at_f32(ch, 0);
            }

            return;
        }

        for ch in 0..self.inputs() {
            let in_ch = input.channel_f32(ch);
            let out_ch = output.channel_f32_mut(ch);

            out_ch[0] =
                in_ch[1] - (2.0 * in_ch[0]) + self.previous[ch];

            for i in 1..size - 1 {
                out_ch[i] =
                    in_ch[i + 1] - (2.0 * in_ch[i]) + in_ch[i - 1];
            }

            let x_m = in_ch[size - 1];
            let x_m1 = in_ch[size - 2];
            let next_extrapolated = (2.0 * x_m) - x_m1;

            out_ch[size - 1] =
                next_extrapolated - (2.0 * x_m) + x_m1;

            self.previous[ch] = x_m;
        }
    }
}

fn dx2<N: Size<f32>>(sr: f32) -> An<D2x<N>> {
    An(D2x::new(sr))
}

pub fn make_bandpass_weights<N: Size<f32>>(
    sr: f32,
    f_low: f32,
    f_high: f32,
) -> Frame<f32, N> {
    let mut weights = Frame::<f32, N>::default();
    let num_taps = N::USIZE;
    let m = (num_taps - 1) as f32;

    let f_low_norm = (f_low / sr).clamp(0.0, 0.49);
    let f_high_norm = (f_high / sr).clamp(0.0, 0.49);

    for i in 0..num_taps {
        let n = i as f32 - m / 2.0;

        let sinc_high = if n == 0.0 {
            2.0 * f_high_norm
        } else {
            (2.0 * PI * f_high_norm * n).sin() / (PI * n)
        };

        let sinc_low = if n == 0.0 {
            2.0 * f_low_norm
        } else {
            (2.0 * PI * f_low_norm * n).sin() / (PI * n)
        };

        let window =
            0.54 - 0.46 * (2.0 * PI * i as f32 / m).cos();

        weights[i] = (sinc_high - sinc_low) * window;
    }

    weights
}

/// 带通 + 二阶导数滤波器
struct Filter {
    bandpass: Box<dyn AudioUnit>,
    d2x: Box<dyn AudioUnit>,
    intensities: [f32; 2],
    pub out_chs: BufferArray<U2>,
    out_dx2: BufferArray<U2>,
    statistic: Statistics,
}

impl Filter {
    pub fn new(
        sr: f32,
        f_low: f32,
        f_high: f32,
        base_intensity: f32,
    ) -> Self {
        let weights = make_bandpass_weights::<U64>(
            sr,
            f_low,
            f_high,
        );

        let mono_fir = fir(weights);
        let stereo_fir = mono_fir.clone() | mono_fir;
        let bandpass = Box::new(stereo_fir);

        let d2x = Box::new(dx2::<U2>(sr));

        Self {
            bandpass,
            d2x,
            intensities: [base_intensity, base_intensity],
            out_chs: BufferArray::<U2>::new(),
            out_dx2: BufferArray::<U2>::new(),
            statistic: Statistics::new(sr),
        }
    }

    pub fn filter_group(
        sr: f32,
        f_min: f32,
        f_max: f32,
        num_bands: usize,
    ) -> Vec<Self> {
        let mut group = Vec::with_capacity(num_bands);
        let gamma = 0.413_f32;
        let r = f_max / f_min;

        let mut edges = vec![0.0_f32; num_bands + 1];

        for i in 0..=num_bands {
            let t = i as f32 / num_bands as f32;
            edges[i] = f_min * r.powf(t.powf(gamma));
        }

        for i in 0..num_bands {
            let f_low = edges[i];
            let f_high = edges[i + 1];

            group.push(Filter::new(
                sr,
                f_low,
                f_high,
                1.0,
            ));
        }

        group
    }

    pub fn intensity(
        &mut self,
        global_kurtosis: &[f32; 2],
        global_crest: &[f32; 2],
        global_flux: &[f32; 2],
    ) -> [f32; 2] {
        let mut i_out = [0.0, 0.0];

        for channel in 0..2 {
            let k_band = self.statistic.prev_kurtosis[channel];
            let c_band = self.statistic.prev_crest[channel];
            let f_band = self.statistic.prev_flux[channel];

            let kurtosis_ratio =
                global_kurtosis[channel] / k_band;
            let crest_ratio =
                global_crest[channel] / c_band;
            let flux_ratio =
                global_flux[channel] / f_band;

            i_out[channel] = self.intensities[channel]
                * (kurtosis_ratio
                    * crest_ratio
                    * flux_ratio)
                    .cbrt();
        }

        i_out
    }

    #[inline(always)]
    pub fn enhance<'a>(
        &'a mut self,
        in_chs: &'a BufferArray<U2>,
        global_kurtosis: &'a [f32; 2],
        global_crest: &'a [f32; 2],
        global_flux: &'a [f32; 2],
    ) {
        // 1. 提取带通信号
        self.bandpass.process(
            MAX_BUFFER_SIZE,
            &in_chs.buffer_ref(),
            &mut self.out_chs.buffer_mut(),
        );

        // 2. 计算带通信号的二阶导数
        self.d2x.process(
            MAX_BUFFER_SIZE,
            &self.out_chs.buffer_ref(),
            &mut self.out_dx2.buffer_mut(),
        );

        // 3. 对齐 C++：频段统计基于二阶导数
        self.statistic.kurtosis(&self.out_dx2);
        self.statistic.crest(&self.out_dx2);
        self.statistic.flux(&self.out_dx2);

        // 4. 计算自适应增强系数
        let intensity = self.intensity(
            global_kurtosis,
            global_crest,
            global_flux,
        );

        // 5. 波形峰值锐化：x_new = x - intensity * d2x
        for ch in 0..2 {
            let out =
                self.out_chs.buffer_mut().channel_f32_mut(ch);

            let d2x =
                self.out_dx2.buffer_ref().channel_f32(ch);

            let factor = intensity[ch];

            for i in 0..out.len() {
                out[i] -= factor * d2x[i];
            }
        }
    }
}

pub trait CrystallizationConfig {
    fn get_switch(&self) -> bool;
    fn get_gain(&self) -> f32;
}

pub struct Crystallization {
    switch: bool,
    filters: Vec<Filter>,
    out_chs: BufferArray<U2>,
    global_d2x: Box<dyn AudioUnit>,
    global_out_dx2: BufferArray<U2>,
    statistic: Statistics,
}

impl Crystallization {
    pub fn new(sr: f32) -> Self {
        let filters =
            Filter::filter_group(sr, 20.0, 20000.0, 13);

        Self {
            switch: true,
            filters,
            out_chs: BufferArray::<U2>::new(),
            global_d2x: Box::new(dx2::<U2>(sr)),
            global_out_dx2: BufferArray::<U2>::new(),
            statistic: Statistics::new_global(sr),
        }
    }

    #[inline(always)]
    pub fn process<'a>(
        &'a mut self,
        in_chs: &'a BufferArray<U2>,
    ) -> &'a BufferArray<U2> {
        if !self.switch {
            return in_chs;
        }

        // 对齐 C++：先计算原始输入的二阶导数
        self.global_d2x.process(
            MAX_BUFFER_SIZE,
            &in_chs.buffer_ref(),
            &mut self.global_out_dx2.buffer_mut(),
        );

        // 全局统计基于原始输入的二阶导数
        self.statistic.kurtosis(&self.global_out_dx2);
        self.statistic.crest(&self.global_out_dx2);
        self.statistic.flux(&self.global_out_dx2);

        let global_kurtosis = self.statistic.prev_kurtosis;
        let global_crest = self.statistic.prev_crest;
        let global_flux = self.statistic.prev_flux;

        // 每个频段独立滤波、计算二阶导并锐化
        self.filters.iter_mut().for_each(|filter| {
            filter.enhance(
                in_chs,
                &global_kurtosis,
                &global_crest,
                &global_flux,
            );
        });

        // 清空输出
        for channel in 0..2 {
            self.out_chs
                .buffer_mut()
                .channel_f32_mut(channel)
                .fill(0.0);
        }

        // 将 13 个频段累加
        self.filters.iter().for_each(|filter| {
            for channel in 0..2 {
                let dst = self
                    .out_chs
                    .buffer_mut()
                    .channel_f32_mut(channel);

                let src = filter
                    .out_chs
                    .buffer_ref()
                    .channel_f32(channel);

                for i in 0..MAX_BUFFER_SIZE {
                    dst[i] += src[i];
                }
            }
        });

        &self.out_chs
    }
}

impl<T: CrystallizationConfig> Node<T> for Crystallization {
    fn set_params(&mut self, params: &T) {
        self.switch = params.get_switch();

        let intensity = params.get_gain();

        for filter in &mut self.filters {
            filter.intensities = [intensity, intensity];
        }
    }

    fn reset(&mut self, _params: &mut T) {
        self.global_d2x.reset();
        self.statistic.reset(true);

        for f in &mut self.filters {
            f.bandpass.reset();
            f.d2x.reset();
            f.statistic.reset(false);
        }
    }
}