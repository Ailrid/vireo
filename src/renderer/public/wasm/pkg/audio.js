if (typeof TextDecoder === "undefined") {
  class TextDecoder {
    constructor(label, options) {
      this.label = label;
      this.options = options;
    }
    decode(buffer) {
      // 简易实现：将 Uint8Array 转为字符串 (仅支持 ASCII/UTF-8 基础部分)
      let bytes = new Uint8Array(buffer);
      let str = "";
      for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return str;
    }
  }
  globalThis.TextDecoder = TextDecoder;
}
export class AudioKernel {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(AudioKernel.prototype);
    obj.__wbg_ptr = ptr;
    AudioKernelFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AudioKernelFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_audiokernel_free(ptr, 0);
  }
  /**
   * @returns {PipelineParams}
   */
  get_params() {
    const ret = wasm.audiokernel_get_params(this.__wbg_ptr);
    return PipelineParams.__wrap(ret);
  }
  /**
   *  暴露内部地址
   * @returns {number}
   */
  in_l_ptr() {
    const ret = wasm.audiokernel_in_l_ptr(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @returns {number}
   */
  in_r_ptr() {
    const ret = wasm.audiokernel_in_r_ptr(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @param {number} rs
   * @returns {AudioKernel}
   */
  static new(rs) {
    const ret = wasm.audiokernel_new(rs);
    return AudioKernel.__wrap(ret);
  }
  /**
   * @returns {number}
   */
  out_l_ptr() {
    const ret = wasm.audiokernel_out_l_ptr(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @returns {number}
   */
  out_r_ptr() {
    const ret = wasm.audiokernel_out_r_ptr(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   *  处理此次音效
   */
  process() {
    wasm.audiokernel_process(this.__wbg_ptr);
  }
  /**
   *  四个重置方法
   */
  reset_bass() {
    wasm.audiokernel_reset_bass(this.__wbg_ptr);
  }
  reset_crystallization() {
    wasm.audiokernel_reset_crystallization(this.__wbg_ptr);
  }
  reset_limiter() {
    wasm.audiokernel_reset_limiter(this.__wbg_ptr);
  }
  reset_stereo() {
    wasm.audiokernel_reset_stereo(this.__wbg_ptr);
  }
  /**
   * @param {PipelineParams} params
   */
  set_params(params) {
    _assertClass(params, PipelineParams);
    var ptr0 = params.__destroy_into_raw();
    wasm.audiokernel_set_params(this.__wbg_ptr, ptr0);
  }
}
if (Symbol.dispose)
  AudioKernel.prototype[Symbol.dispose] = AudioKernel.prototype.free;

export class PipelineParams {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PipelineParams.prototype);
    obj.__wbg_ptr = ptr;
    PipelineParamsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PipelineParamsFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_pipelineparams_free(ptr, 0);
  }
  /**
   * @returns {number}
   */
  get bass_gain() {
    const ret = wasm.__wbg_get_pipelineparams_bass_gain(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {boolean}
   */
  get bass_switch() {
    const ret = wasm.__wbg_get_pipelineparams_bass_switch(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * @returns {number}
   */
  get crystallization_gain() {
    const ret = wasm.__wbg_get_pipelineparams_crystallization_gain(
      this.__wbg_ptr,
    );
    return ret;
  }
  /**
   * @returns {boolean}
   */
  get crystallization_switch() {
    const ret = wasm.__wbg_get_pipelineparams_crystallization_switch(
      this.__wbg_ptr,
    );
    return ret !== 0;
  }
  /**
   * @returns {number}
   */
  get limiter_gain() {
    const ret = wasm.__wbg_get_pipelineparams_limiter_gain(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {boolean}
   */
  get limiter_switch() {
    const ret = wasm.__wbg_get_pipelineparams_limiter_switch(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * @returns {number}
   */
  get stereo_gain() {
    const ret = wasm.__wbg_get_pipelineparams_stereo_gain(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {boolean}
   */
  get stereo_switch() {
    const ret = wasm.__wbg_get_pipelineparams_stereo_switch(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * @param {boolean} bass_switch
   * @param {boolean} crystallization_switch
   * @param {boolean} stereo_switch
   * @param {boolean} limiter_switch
   * @param {number} bass_gain
   * @param {number} crystallization_gain
   * @param {number} stereo_gain
   * @param {number} limiter_gain
   * @returns {PipelineParams}
   */
  static new(
    bass_switch,
    crystallization_switch,
    stereo_switch,
    limiter_switch,
    bass_gain,
    crystallization_gain,
    stereo_gain,
    limiter_gain,
  ) {
    const ret = wasm.pipelineparams_new(
      bass_switch,
      crystallization_switch,
      stereo_switch,
      limiter_switch,
      bass_gain,
      crystallization_gain,
      stereo_gain,
      limiter_gain,
    );
    return PipelineParams.__wrap(ret);
  }
  /**
   * @param {number} arg0
   */
  set bass_gain(arg0) {
    wasm.__wbg_set_pipelineparams_bass_gain(this.__wbg_ptr, arg0);
  }
  /**
   * @param {boolean} arg0
   */
  set bass_switch(arg0) {
    wasm.__wbg_set_pipelineparams_bass_switch(this.__wbg_ptr, arg0);
  }
  /**
   * @param {number} arg0
   */
  set crystallization_gain(arg0) {
    wasm.__wbg_set_pipelineparams_crystallization_gain(this.__wbg_ptr, arg0);
  }
  /**
   * @param {boolean} arg0
   */
  set crystallization_switch(arg0) {
    wasm.__wbg_set_pipelineparams_crystallization_switch(this.__wbg_ptr, arg0);
  }
  /**
   * @param {number} arg0
   */
  set limiter_gain(arg0) {
    wasm.__wbg_set_pipelineparams_limiter_gain(this.__wbg_ptr, arg0);
  }
  /**
   * @param {boolean} arg0
   */
  set limiter_switch(arg0) {
    wasm.__wbg_set_pipelineparams_limiter_switch(this.__wbg_ptr, arg0);
  }
  /**
   * @param {number} arg0
   */
  set stereo_gain(arg0) {
    wasm.__wbg_set_pipelineparams_stereo_gain(this.__wbg_ptr, arg0);
  }
  /**
   * @param {boolean} arg0
   */
  set stereo_switch(arg0) {
    wasm.__wbg_set_pipelineparams_stereo_switch(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose)
  PipelineParams.prototype[Symbol.dispose] = PipelineParams.prototype.free;
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg___wbindgen_throw_6b64449b9b9ed33c: function (arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbindgen_init_externref_table: function () {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, undefined);
      table.set(offset + 0, undefined);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    },
  };
  return {
    __proto__: null,
    "./audio_bg.js": import0,
  };
}

const AudioKernelFinalization =
  typeof FinalizationRegistry === "undefined"
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_audiokernel_free(ptr >>> 0, 1),
      );
const PipelineParamsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_pipelineparams_free(ptr >>> 0, 1),
      );

function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (
    cachedUint8ArrayMemory0 === null ||
    cachedUint8ArrayMemory0.byteLength === 0
  ) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", {
      ignoreBOM: true,
      fatal: true,
    });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(
    getUint8ArrayMemory0().subarray(ptr, ptr + len),
  );
}

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  wasmModule = module;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}

async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && expectedResponseType(module.type);

        if (
          validResponse &&
          module.headers.get("Content-Type") !== "application/wasm"
        ) {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e,
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }

  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}

function initSync(module) {
  if (wasm !== undefined) return wasm;

  if (module !== undefined) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn(
        "using deprecated parameters for `initSync()`; pass a single object instead",
      );
    }
  }

  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
  if (wasm !== undefined) return wasm;

  if (module_or_path !== undefined) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn(
        "using deprecated parameters for the initialization function; pass a single object instead",
      );
    }
  }

  if (module_or_path === undefined) {
    module_or_path = new URL("audio_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();

  if (
    typeof module_or_path === "string" ||
    (typeof Request === "function" && module_or_path instanceof Request) ||
    (typeof URL === "function" && module_or_path instanceof URL)
  ) {
    module_or_path = fetch(module_or_path);
  }

  const { instance, module } = await __wbg_load(await module_or_path, imports);

  return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
