/* tslint:disable */
/* eslint-disable */

export class AudioKernel {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    get_params(): PipelineParams;
    /**
     *  暴露内部地址
     */
    in_l_ptr(): number;
    in_r_ptr(): number;
    static new(rs: number): AudioKernel;
    out_l_ptr(): number;
    out_r_ptr(): number;
    /**
     *  处理此次音效
     */
    process(): void;
    /**
     *  四个重置方法
     */
    reset_bass(): void;
    reset_crystallization(): void;
    reset_limiter(): void;
    reset_stereo(): void;
    set_params(params: PipelineParams): void;
}

export class PipelineParams {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(bass_switch: boolean, crystallization_switch: boolean, stereo_switch: boolean, limiter_switch: boolean, bass_gain: number, crystallization_gain: number, stereo_gain: number, limiter_gain: number): PipelineParams;
    bass_gain: number;
    bass_switch: boolean;
    crystallization_gain: number;
    crystallization_switch: boolean;
    limiter_gain: number;
    limiter_switch: boolean;
    stereo_gain: number;
    stereo_switch: boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_get_pipelineparams_bass_gain: (a: number) => number;
    readonly __wbg_get_pipelineparams_bass_switch: (a: number) => number;
    readonly __wbg_get_pipelineparams_crystallization_gain: (a: number) => number;
    readonly __wbg_get_pipelineparams_crystallization_switch: (a: number) => number;
    readonly __wbg_get_pipelineparams_limiter_gain: (a: number) => number;
    readonly __wbg_get_pipelineparams_limiter_switch: (a: number) => number;
    readonly __wbg_get_pipelineparams_stereo_gain: (a: number) => number;
    readonly __wbg_get_pipelineparams_stereo_switch: (a: number) => number;
    readonly __wbg_pipelineparams_free: (a: number, b: number) => void;
    readonly __wbg_set_pipelineparams_bass_gain: (a: number, b: number) => void;
    readonly __wbg_set_pipelineparams_bass_switch: (a: number, b: number) => void;
    readonly __wbg_set_pipelineparams_crystallization_gain: (a: number, b: number) => void;
    readonly __wbg_set_pipelineparams_crystallization_switch: (a: number, b: number) => void;
    readonly __wbg_set_pipelineparams_limiter_gain: (a: number, b: number) => void;
    readonly __wbg_set_pipelineparams_limiter_switch: (a: number, b: number) => void;
    readonly __wbg_set_pipelineparams_stereo_gain: (a: number, b: number) => void;
    readonly __wbg_set_pipelineparams_stereo_switch: (a: number, b: number) => void;
    readonly pipelineparams_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
    readonly __wbg_audiokernel_free: (a: number, b: number) => void;
    readonly audiokernel_get_params: (a: number) => number;
    readonly audiokernel_in_l_ptr: (a: number) => number;
    readonly audiokernel_in_r_ptr: (a: number) => number;
    readonly audiokernel_new: (a: number) => number;
    readonly audiokernel_out_l_ptr: (a: number) => number;
    readonly audiokernel_out_r_ptr: (a: number) => number;
    readonly audiokernel_process: (a: number) => void;
    readonly audiokernel_reset_bass: (a: number) => void;
    readonly audiokernel_reset_crystallization: (a: number) => void;
    readonly audiokernel_reset_limiter: (a: number) => void;
    readonly audiokernel_reset_stereo: (a: number) => void;
    readonly audiokernel_set_params: (a: number, b: number) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
