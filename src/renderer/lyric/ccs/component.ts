import { Component, type ViridApp } from '@virid/core'
import { Responsive } from '@virid/vue'

export type BackgroundMode = 'light' | 'dark' | 'image'
export interface Lyric {
  time: number
  text: string
  trans: string
}
export class ThemeConfig {
  public mode: BackgroundMode = 'light'
  public url: string = ''
  public fileUrl: string = ''
  public opacity: number = 0.2 // 稍微降一点，配合背景色会有通透感
  public blur: number = 12 // 默认给点模糊更高级
  public imgAccentColor: Array<number> | null = null
  public imgAvgColor: Array<number> | null = null
  public primaryColor: Array<number> | null = null // 默认一个蓝色的 accent
  public fontSizeScale: number = 1 // 100% 缩放
  public fontFamily: string = 'Inter system-ui sans-serif'
  public textColor: 'white' | 'black' | null = null // 为空时使用 Controller 逻辑自动计算
  public borderRadius: number = 12 // 适中的圆角
  public enableSliderAutoColor: boolean = true
  public immersiveMode: boolean = false
}

@Component()
export class DestLyricComponent {
  @Responsive()
  public lyric: Lyric | null = null
  @Responsive()
  public theme: ThemeConfig | null = null
  @Responsive()
  public isPlaying: boolean = false
}

export function bindDestLyricComponent(app: ViridApp) {
  app.bind(DestLyricComponent)
}
