import { initSync, AudioKernel, PipelineParams } from './pkg/audio.js'

class RustEffectProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)
    this.kernel = null
    this.wasmMemory = null
    const wasmModule = options.processorOptions.wasmModule
    const rs = options.processorOptions.rs
    if (wasmModule) {
      const exports = initSync(wasmModule)
      this.wasmMemory = exports.memory
      this.kernel = AudioKernel.new(rs)
      this.port.onmessage = event => {
        if (event.data.type == 'set_params') {
          const newParams = PipelineParams.new(
            event.data.params.bass_switch,
            event.data.params.crystallization_switch,
            event.data.params.stereo_switch,
            event.data.params.limiter_switch,
            event.data.params.bass_gain,
            event.data.params.crystallization_amount
          )
          this.kernel.set_params(newParams)
        } else {
          console.error('[AudioWorkletProcessor] Unknown Message Type', event.data.type)
        }
      }
      const heap = this.wasmMemory.buffer
      this.inL = new Float32Array(heap, this.kernel.in_l_ptr(), 128)
      this.inR = new Float32Array(heap, this.kernel.in_r_ptr(), 128)
      this.outL = new Float32Array(heap, this.kernel.out_l_ptr(), 128)
      this.outR = new Float32Array(heap, this.kernel.out_r_ptr(), 128)
    } else {
      console.error('[AudioWorkletProcessor] No Wasm Module Found')
    }
  }

  process(inputs, outputs) {
    const input = inputs[0] // 128 points
    const output = outputs[0] // 128 points
    // 暂时先禁用音效
    for (let ch = 0; ch < output.length; ch++) output[ch].set(input[ch]) return true


    if (!this.kernel || !input[0]) {
      for (let ch = 0; ch < output.length; ch++) output[ch].set(input[ch])
      return true
    }

    // 将 128 点拆分为两个 64 点的块
    for (let i = 0; i < 2; i++) {
      const offset = i * 64
      this.inL.set(input[0].subarray(offset, offset + 64))
      this.inR.set(input[1].subarray(offset, offset + 64))
      this.kernel.process()
      output[0].subarray(offset, offset + 64).set(this.outL)
      if (output[1]) output[1].subarray(offset, offset + 64).set(this.outR)
    }
    return true
  }
}
registerProcessor('rust-effect-processor', RustEffectProcessor)
