/**
 * RGB 转 HSL
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}

/**
 * HSL 转 RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100
  h /= 360
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

/**
 * 提取增强后的强调色
 */
export async function getAccentRGB(imageUrl: string): Promise<{
  accentColor: number[]
  avgColor: number[]
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const size = 64 // 50x50 采样
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return reject(new Error('Canvas error'))

      ctx.drawImage(img, 0, 0, size, size)
      const data = ctx.getImageData(0, 0, size, size).data

      let rSum = 0,
        gSum = 0,
        bSum = 0,
        count = 0

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2]

        // 过滤掉过于暗淡或过于惨白的像素（灰度过滤）
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        if (brightness > 20 && brightness < 235) {
          rSum += r
          gSum += g
          bSum += b
          count++
        }
      }

      // 如果图全是黑白，就取中间值
      const avgR = count > 0 ? rSum / count : 128
      const avgG = count > 0 ? gSum / count : 128
      const avgB = count > 0 ? bSum / count : 128

      // 获取感知亮度
      const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255

      // 转到 HSL 空间
      let [h, s, _] = rgbToHsl(avgR, avgG, avgB)

      // 强制锁定饱和度在 60% - 90% 之间
      const accentS = Math.max(s, 80)

      let accentL: number
      if (luminance > 0.5) {
        // 背景太亮 -> 强调色作为文字需要深一点（对比度）
        accentL = 35
      } else {
        // 背景太暗 -> 强调色需要亮一点
        accentL = 75
      }
      // 转回 RGB 输出
      const accentColor = hslToRgb(h, accentS, accentL)

      const maxChannelValue = Math.max(avgR, avgG, avgB)
      resolve({
        accentColor: accentColor,
        avgColor: [Math.round(avgR), Math.round(avgG), Math.round(avgB)].map(
          item => (item / maxChannelValue) * 255
        )
      })
    }
    img.onerror = () => reject(new Error('Image Load Failed'))
    img.src = imageUrl
  })
}
