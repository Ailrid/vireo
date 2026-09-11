mod bass;
mod crystallization;
mod limiter;
mod pipeline;
mod stereo;
pub mod kernel;

// copy those lines to /pkg/audio.js
// if (typeof TextDecoder === "undefined") {
//   class TextDecoder {
//     constructor(label, options) {
//       this.label = label;
//       this.options = options;
//     }
//     decode(buffer) {
//       // 简易实现：将 Uint8Array 转为字符串 (仅支持 ASCII/UTF-8 基础部分)
//       let bytes = new Uint8Array(buffer);
//       let str = "";
//       for (let i = 0; i < bytes.length; i++) {
//         str += String.fromCharCode(bytes[i]);
//       }
//       return str;
//     }
//   }
//   globalThis.TextDecoder = TextDecoder;
// }
