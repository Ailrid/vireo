use crate::pipeline::Node;
use fundsp::prelude32::*;
pub trait StereoConfig {
    fn get_switch(&self) -> bool;
    fn get_gain(&self) -> f32;
}
pub struct Stereo {}
impl Stereo {
    pub fn new(sr: f32) -> Self {
        Self {
        //TODO
        }
    }

    #[inline(always)]
    pub fn process<'a>(&'a mut self, in_chs: &'a BufferArray<U2>) -> &'a BufferArray<U2> {
        //TODO
        return in_chs;
    }
}

impl<T: StereoConfig> Node<T> for Stereo {
    fn reset(&mut self, params: &mut T) {
        //TODO
    }
    fn set_params(&mut self, params: &T) {
        //TODO
    }
}
