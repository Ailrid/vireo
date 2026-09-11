use super::pipeline::*;
use fundsp::prelude32::*;
use wasm_bindgen::prelude::*;
#[wasm_bindgen]
pub struct AudioKernel {
    in_chs: BufferArray<U2>,
    out_chs: BufferArray<U2>,
    pipeline: Pipeline,
    pipeline_params: PipelineParams,
}

#[wasm_bindgen]
impl AudioKernel {
    pub fn new(rs: f32) -> Self {
        // 预分配并固定容量
        Self {
            in_chs: BufferArray::<U2>::new(),
            out_chs: BufferArray::<U2>::new(),
            pipeline: Pipeline::new(rs),
            pipeline_params: PipelineParams::default(),
        }
    }

    ///  暴露内部地址
    pub fn in_l_ptr(&mut self) -> *const f32 {
        self.in_chs.channel_f32_mut(0).as_ptr()
    }
    pub fn in_r_ptr(&mut self) -> *const f32 {
        self.in_chs.channel_f32_mut(1).as_ptr()
    }
    pub fn out_l_ptr(&mut self) -> *const f32 {
        self.out_chs.channel_f32(0).as_ptr()
    }
    pub fn out_r_ptr(&mut self) -> *const f32 {
        self.out_chs.channel_f32(1).as_ptr()
    }
    pub fn get_params(&mut self) -> PipelineParams {
        self.pipeline_params
    }
    ///  四个重置方法
    pub fn reset_bass(&mut self) {
        self.pipeline.bass.reset(&mut self.pipeline_params);
    }
    pub fn reset_crystallization(&mut self) {
        self.pipeline
            .crystallization
            .reset(&mut self.pipeline_params);
    }
    pub fn reset_stereo(&mut self) {
        self.pipeline.stereo.reset(&mut self.pipeline_params);
    }
    pub fn reset_limiter(&mut self) {
        self.pipeline.limiter.reset(&mut self.pipeline_params);
    }

    pub fn set_params(&mut self, params: PipelineParams) {
        self.pipeline_params = params;
        self.pipeline.set_params(&self.pipeline_params);
    }

    ///  处理此次音效
    pub fn process(&mut self) {
        let out_chs = self.pipeline.process(&self.in_chs);
        self.out_chs.clone_from(out_chs);
    }
}
