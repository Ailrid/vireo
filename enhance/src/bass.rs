use crate::pipeline::Node;
use fundsp::prelude32::*;

pub trait BassConfig {
    fn get_switch(&self) -> bool;
    fn get_gain(&self) -> f32;
}

pub struct Bass {
    unit: Box<dyn AudioUnit>,
    gain: Shared,
    switch: bool,
    out_chs: BufferArray<U2>,
}
impl Bass {
    pub fn new(sr: f32) -> Self {
        let gain_shared = shared(1.0);
        let cutoff = 100.0;
        let q = 0.707;

        let bass_path = lowpass_hz(cutoff, q)
            >> lowpass_hz(cutoff, q)
            >> (pass() * var(&gain_shared))
            >> map(|x: &Frame<f32, U1>| {
                let raw = x[0];
                (raw * 1.5).tanh()
            })
            >> lowpass_hz(cutoff * 2.0, 1.0);
        let high_path = highpass_hz(cutoff, q) >> highpass_hz(cutoff, q);

        let mono_chain = (bass_path.clone() & high_path.clone()) | (bass_path & high_path);

        let mut unit = Box::new(mono_chain);
        unit.set_sample_rate(sr as f64);

        Self {
            unit,
            gain: gain_shared,
            switch: true,
            out_chs: BufferArray::<U2>::new(),
        }
    }

    #[inline(always)]
    pub fn process<'a>(&'a mut self, in_chs: &'a BufferArray<U2>) -> &'a BufferArray<U2> {
        if !self.switch {
            return in_chs;
        } else {
            self.unit
                .process(64, &in_chs.buffer_ref(), &mut self.out_chs.buffer_mut());

            return &self.out_chs;
        }
    }
}

impl<T: BassConfig> Node<T> for Bass {
    fn reset(&mut self, _params: &mut T) {
        self.unit.reset();
    }

    fn set_params(&mut self, params: &T) {
        let db = params.get_gain();
        self.gain.set(db_amp(db));
        self.switch = params.get_switch();
    }
}
