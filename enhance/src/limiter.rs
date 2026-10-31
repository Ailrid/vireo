use crate::pipeline::Node;
use fundsp::prelude32::*;

pub trait LimiterConfig {
    fn get_switch(&self) -> bool;
    fn get_gain(&self) -> f32;
}

pub struct Limiter {
    switch: bool,
    threshold: f32,
    attack_coeff: f32,
    release_coeff: f32,
    envelope: f32,
    out_chs: BufferArray<U2>,
}

impl Limiter {
    pub fn new(sr: f32) -> Self {
        let attack_time = 0.001; // 1 ms  —— 抓瞬态
        let release_time = 0.100; // 100 ms —— 自然恢复
        let attack_coeff = (-1.0 / (sr * attack_time)).exp();
        let release_coeff = (-1.0 / (sr * release_time)).exp();

        Self {
            switch: true,
            threshold: 0.95,
            attack_coeff,
            release_coeff,
            envelope: 1.0,
            out_chs: BufferArray::<U2>::new(),
        }
    }

    #[inline(always)]
    pub fn process<'a>(&'a mut self, in_chs: &'a BufferArray<U2>) -> &'a BufferArray<U2> {
        if !self.switch {
            return in_chs;
        }

        let in_buf = in_chs.buffer_ref();
        let in_l = in_buf.channel_f32(0);
        let in_r = in_buf.channel_f32(1);

        let mut out_buf = self.out_chs.buffer_mut();

        let threshold = self.threshold;
        let attack_coeff = self.attack_coeff;
        let release_coeff = self.release_coeff;
        let mut env = self.envelope;

        for i in 0..MAX_BUFFER_SIZE {
            let l = in_l[i];
            let r = in_r[i];

            // linked stereo 峰值检测：L/R 共用同一个增益，声像不被扯偏
            let peak = l.abs().max(r.abs());

            // 目标增益：超过阈值则压到恰好 = threshold，否则 1.0
            let target = if peak > threshold {
                threshold / peak
            } else {
                1.0
            };

            // attack（增益要下压）用快系数；release（增益恢复）用慢系数
            let alpha = if target < env {
                attack_coeff
            } else {
                release_coeff
            };
            env = alpha * env + (1.0 - alpha) * target;

            // 平滑增益 + 绝对值兜底（防止攻击起始的极少数采样越过 ±1.0）
            out_buf.set_f32(0, i, (l * env).clamp(-1.0, 1.0));
            out_buf.set_f32(1, i, (r * env).clamp(-1.0, 1.0));
        }

        self.envelope = env;
        &self.out_chs
    }
}

impl<T: LimiterConfig> Node<T> for Limiter {
    fn reset(&mut self, _params: &mut T) {
        // 重置时让增益从 1.0 起步，避免启动瞬间错误压低信号
        self.envelope = 1.0;
        for channel in 0..2 {
            self.out_chs.buffer_mut().channel_f32_mut(channel).fill(0.0);
        }
    }

    fn set_params(&mut self, params: &T) {
        self.switch = params.get_switch();
        // get_gain ∈ [0, 1] 作为阈值：越小限得越狠；默认 1.0 ≈ 只在爆音时介入
        self.threshold = params.get_gain().clamp(0.1, 1.0);
    }
}
