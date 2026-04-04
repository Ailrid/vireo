import { Component, Observer } from '@virid/core'
import { Responsive } from '@virid/vue'
import { SetVolumeMessage } from '../playback'

// 定义背景模式
export type BackgroundMode = 'light' | 'dark' | 'image'

export class PlayerConfig {
  public coverBackground: boolean = true
  public opacity: number = 0.3
  public blur: number = 8
  public autoColor: boolean = true
  public mask: boolean = true
  public center: boolean = false
  public lyricBlur: boolean = false
  public volume: number = 1
}

export class ThemeConfig {
  public mode: BackgroundMode = 'light'
  public url: string = ''
  public fileUrl: string = ''
  public opacity: number = 0.15 // 稍微降一点，配合背景色会有通透感
  public blur: number = 0 // 默认给点模糊更高级
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
export class SettingComponent {
  @Responsive()
  public theme: ThemeConfig = new ThemeConfig()
  @Responsive()
  // 纯副作用，一次性的，在第一次加载设置的时候自动发出一个设置音量消息恢复上次的音量
  @Observer((_old: PlayerConfig, newValue: PlayerConfig) => {
    return SetVolumeMessage.send(newValue.volume)
  })
  public player: PlayerConfig = new PlayerConfig()
}
