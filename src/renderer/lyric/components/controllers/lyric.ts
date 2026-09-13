import { Controller } from '@virid/core'
import { Responsive, Project, Listener, OnHook } from '@virid/vue'
import {
  UnlockLyricMessage,
  EnableLyricMessage,
  CloseWindowMessage,
  LockLyricWindowMessage,
  DestLyricComponent,
  type Lyric,
  type ThemeConfig
} from '../../ccs'

@Controller()
export class LyricController {
  @Project(DestLyricComponent, i => i.lyric)
  public destLyric: Lyric | null = null

  @Project(DestLyricComponent, i => i.theme)
  public theme: ThemeConfig | null = null

  @Project(DestLyricComponent, i => i.isPlaying)
  public isPlaying: boolean = false

  @Responsive()
  public isLocked: boolean = false

  // 独立的缩放偏移量，避开 theme 的只读限制
  @Responsive()
  public scaleOffset: number = 1

  // 综合计算缩放比例
  @Project()
  get computedFontScale(): number {
    const baseScale = this.theme?.fontSizeScale || 1
    return baseScale * this.scaleOffset
  }

  // 动态计算文本颜色，无硬编码
  @Project()
  get dynamicTextColor(): string {
    const avg = this.theme?.imgAvgColor
    if (avg && Array.isArray(avg) && avg.length >= 3) {
      return `rgb(${avg[0]}, ${avg[1]}, ${avg[2]})`
    }

    const primary = this.theme?.primaryColor
    if (primary && Array.isArray(primary) && primary.length >= 3) {
      return `rgb(${primary[0]}, ${primary[1]}, ${primary[2]})`
    }

    return 'currentColor'
  }

  @Listener({
    messageClass: UnlockLyricMessage
  })
  unlockLyric() {
    this.isLocked = false
  }

  toggleLock() {
    this.isLocked = !this.isLocked
    if (this.isLocked) {
      LockLyricWindowMessage.send()
    }
  }

  zoomInFont() {
    this.scaleOffset = Math.min(2.0, Number((this.scaleOffset + 0.15).toFixed(2)))
  }

  zoomOutFont() {
    this.scaleOffset = Math.max(0.6, Number((this.scaleOffset - 0.15).toFixed(2)))
  }

  closeLyricWindow() {
    EnableLyricMessage.send(false)
    CloseWindowMessage.send()
  }

  @OnHook('onMounted')
  onMounted() {
    EnableLyricMessage.send(true)
  }
}
