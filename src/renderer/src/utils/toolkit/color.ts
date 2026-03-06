/**
 * 兼容本地自定义协议与远程 HTTP 协议的颜色提取函数
 */
export async function getAverageRGB(imageUrl: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    // 关键：允许跨域请求。
    // 对于 http 资源，这会触发 CORS 检查；
    // 对于 local-file 资源，需要主进程协议注册时支持 CORS。
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const SAMPLE_SIZE = 64
      const canvas = document.createElement('canvas')
      canvas.width = SAMPLE_SIZE
      canvas.height = SAMPLE_SIZE

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // 绘制图片到缩放后的 Canvas
      ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

      try {
        const imageData = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
        const data = imageData.data
        let r = 0,
          g = 0,
          b = 0
        const pixelCount = data.length / 4

        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }

        resolve([
          Math.round(r / pixelCount),
          Math.round(g / pixelCount),
          Math.round(b / pixelCount)
        ])
      } catch (_err) {
        // 如果 crossOrigin 没起作用，这里会抛出 SecurityError
        reject(new Error('Canvas tainted: Cannot read pixel data from cross-origin image.'))
      }
    }

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`))
    }

    img.src = imageUrl
  })
}
