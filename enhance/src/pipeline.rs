use crate::{bass::*, crystallization::*, limiter::*, stereo::*};
use fundsp::prelude32::{BufferArray, U2};
use wasm_bindgen::prelude::*;
pub struct Pipeline {
    pub bass: Bass,
    pub crystallization: Crystallization,
    pub limiter: Limiter,
    pub stereo: Stereo,
}
impl Pipeline {
    pub fn new(sr: f32) -> Self {
        Self {
            bass: Bass::new(sr),
            crystallization: Crystallization::new(sr),
            stereo: Stereo::new(sr),
            limiter: Limiter::new(sr),
        }
    }

    #[inline(always)]
    pub fn process<'a>(&'a mut self, in_chs: &'a BufferArray<U2>) -> &'a BufferArray<U2> {
        let in_chs = self.bass.process(in_chs);
        let in_chs = self.crystallization.process(in_chs);
        let in_chs = self.limiter.process(in_chs);
        let out_chs = self.stereo.process(in_chs);
        out_chs
    }
    pub fn set_params(&mut self, params: &PipelineParams) {
        self.bass.set_params(params);
        self.crystallization.set_params(params);
        self.stereo.set_params(params);
        self.limiter.set_params(params);
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct PipelineParams {
    //四个总开关
    pub bass_switch: bool,
    pub crystallization_switch: bool,
    pub stereo_switch: bool,
    pub limiter_switch: bool,
    // 低音参数
    pub bass_gain: f32,
    // 晶化参数
    pub crystallization_gain: f32,
    // 立体声参数
    pub stereo_gain: f32,
    // Limiter参数
    pub limiter_gain: f32,
}

#[wasm_bindgen]
impl PipelineParams {
    pub fn new(
        bass_switch: bool,
        crystallization_switch: bool,
        stereo_switch: bool,
        limiter_switch: bool,
        bass_gain: f32,
        crystallization_gain: f32,
        stereo_gain: f32,
        limiter_gain: f32,
    ) -> Self {
        Self {
            bass_switch,
            crystallization_switch,
            stereo_switch,
            limiter_switch,
            bass_gain,
            crystallization_gain,
            stereo_gain,
            limiter_gain,
        }
    }
}
impl Default for PipelineParams {
    fn default() -> Self {
        Self::new(true, true, true, true, 1.0, 1.0, 1.0, 1.0)
    }
}

impl BassConfig for PipelineParams {
    fn get_switch(&self) -> bool {
        return self.bass_switch;
    }
    fn get_gain(&self) -> f32 {
        return self.bass_gain;
    }
}
impl CrystallizationConfig for PipelineParams {
    fn get_switch(&self) -> bool {
        return self.crystallization_switch;
    }
    fn get_gain(&self) -> f32 {
        return self.crystallization_gain;
    }
}
impl StereoConfig for PipelineParams {
    fn get_switch(&self) -> bool {
        return self.stereo_switch;
    }
    fn get_gain(&self) -> f32 {
        return self.stereo_gain;
    }
}
impl LimiterConfig for PipelineParams {
    fn get_switch(&self) -> bool {
        return self.limiter_switch;
    }
    fn get_gain(&self) -> f32 {
        return self.limiter_gain;
    }
}

pub trait Node<T> {
    fn reset(&mut self, params: &mut T);
    fn set_params(&mut self, params: &T);
}
