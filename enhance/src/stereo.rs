use crate::pipeline::Node;
use fundsp::prelude32::*;

pub trait StereoConfig {
    fn get_switch(&self) -> bool;
    fn get_gain(&self) -> f32;
}

pub struct Stereo {
    switch: bool,
    width: f32,
    out_chs: BufferArray<U2>,
}

impl Stereo {
    pub fn new(_sr: f32) -> Self {
        Self {
            switch: true,
            width: 1.0,
            out_chs: BufferArray::<U2>::new(),
        }
    }

    #[inline(always)]
    pub fn process<'a>(&'a mut self, in_chs: &'a BufferArray<U2>) -> &'a BufferArray<U2> {
        // 关闭或无需处理时，直接返回输入（零拷贝）
        if !self.switch || (self.width - 1.0).abs() < f32::EPSILON {
            return in_chs;
        }

        let in_buf = in_chs.buffer_ref();
        let in_l = in_buf.channel_f32(0);
        let in_r = in_buf.channel_f32(1);

        let mut out_buf = self.out_chs.buffer_mut();
        let width = self.width;

        //   M = (L + R) / 2
        //   S = (L - R) / 2 * w
        //   L' = M + S
        //   R' = M - S
        for i in 0..MAX_BUFFER_SIZE {
            let l = in_l[i];
            let r = in_r[i];

            let mid = 0.5 * (l + r);
            let side = 0.5 * (l - r) * width;

            out_buf.set_f32(0, i, mid + side);
            out_buf.set_f32(1, i, mid - side);
        }

        &self.out_chs
    }
}

impl<T: StereoConfig> Node<T> for Stereo {
    fn reset(&mut self, _params: &mut T) {
        for channel in 0..2 {
            self.out_chs.buffer_mut().channel_f32_mut(channel).fill(0.0);
        }
    }

    fn set_params(&mut self, params: &T) {
        self.switch = params.get_switch();

        // gain ∈ [0, 1] → width ∈ [1, 2]
        // gain = 0 → 宽度不变（L' + R' = L + R，单声道完全还原）
        // gain = 1 → 侧信号加倍，最大宽度
        let gain = params.get_gain().clamp(0.0, 1.0);
        self.width = 1.0 + gain;
    }
}
