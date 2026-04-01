import { Controller, SingleMessage } from '@virid/core'
import { type Player, PlayerComponent, SeekTimeMessage } from '@/ccs/playback'
import { Listener, OnHook, Project, Responsive, Use, Watch } from '@virid/vue'
import { nextTick, useTemplateRef, type ShallowRef } from 'vue'
import { formatTime } from '@/utils'
import { SettingComponent, type ThemeConfig } from '@/ccs/settings'
export class SliderControllerMessage extends SingleMessage {
  constructor(public event: MouseEvent) {
    super()
  }
}
@Controller()
export class SliderController {
  @Responsive()
  public progress: number = 0

  /**
   * * 自动更新时间
   */
  @Watch(PlayerComponent, i => i.player.currentTime)
  onTimeChange() {
    const newProgress = Math.floor((this.player.currentTime / this.player.duration) * 100)
    if (newProgress == this.progress) return
    else this.progress = newProgress
  }

  //响应式切换进度条
  @Responsive()
  public changeSlider: boolean = false

  public maxWidth: number = 1000000

  @Project(SettingComponent, i => i.theme)
  public theme!: ThemeConfig

  //播放器
  @Project(PlayerComponent, i => i.player)
  public player!: Player

  //当前歌曲的滑动条
  @Project(PlayerComponent, i => i.player.slider)
  public slider!: Array<number>

  //当前歌曲的滑动条
  @Project(PlayerComponent, i => i.player.sliderMask)
  public sliderMask!: Array<boolean>

  //当前歌曲的滑动条
  @Use(() => useTemplateRef<HTMLElement>('sliderContainer'))
  public container!: ShallowRef<HTMLElement>

  //当前歌曲的滑动条
  @Use(() => useTemplateRef<HTMLElement>('sliderRoot'))
  public sliderRoot!: ShallowRef<HTMLElement>

  @Project()
  get currentTime() {
    return formatTime(this.player.currentTime)
  }

  /**
   * * 音频条的样式
   */
  waveBarStyle(active: boolean) {
    if (!this.theme.enableSliderAutoColor) {
      return active
        ? 'bg-primary scale-y-100 opacity-90 shadow-[0_0_15px_rgba(var(--primary),0.6)]'
        : 'bg-primary scale-y-75 opacity-50'
    }
    return active
      ? 'bg-cover-color scale-y-100 opacity-90 shadow-[0_0_15px_rgba(var(--cover-color),0.6)]'
      : 'bg-cover-color scale-y-75 opacity-50'
  }
  /**
   * * 进度条样式
   */
  progressBarStyle() {
    if (!this.theme.enableSliderAutoColor) {
      return 'bg-primary'
    }
    return 'bg-cover-color'
  }

  /**
   * * 计算seek的时间位置
   */
  @Listener({
    messageClass: SliderControllerMessage
  })
  public onSliderChange(message: SliderControllerMessage) {
    if (!this.container.value || !this.player.duration) return

    const rect = this.container.value.getBoundingClientRect()
    const clickX = message.event.clientX - rect.left
    const width = rect.width

    // 计算百分比并限制在 0-1 之间
    const percentage = Math.max(0, Math.min(1, clickX / width))
    const seekTime = percentage * this.player.duration
    this.progress = Math.floor(percentage * 100)
    SeekTimeMessage.send(seekTime)
  }
  /**
   * * 最大的可用宽度
   */
  getMaxWidth() {
    // 获取 1rem 对应的像素值
    const remBase = parseFloat(getComputedStyle(document.documentElement).fontSize)
    //获取当前视口宽度 (100vw)
    const vh = window.innerWidth
    // 100vw - 23.25rem
    const reservedPx = 23.25 * remBase
    const availablePx = vh - reservedPx
    return availablePx
  }
  /**
   * * 进度条的总宽度
   */
  getSliderWidth() {
    const remBase = parseFloat(getComputedStyle(document.documentElement).fontSize)
    return 46.25 * remBase
  }

  private observer: ResizeObserver | null = null
  @OnHook('onMounted')
  async mounted() {
    if (this.sliderRoot.value) {
      await nextTick()
      this.observer = new ResizeObserver(_entities => {
        this.maxWidth = this.getMaxWidth()
        this.maxWidthChange()
      })
      this.maxWidth = this.getMaxWidth()
      this.maxWidthChange()
      this.observer.observe(window.document.body)
    }
  }

  @OnHook('onUnmounted')
  unmounted() {
    this.observer?.disconnect()
    this.observer = null
  }

  /**
   * * 监听窗口大小变化或者UI缩放
   */
  @Watch(SettingComponent, i => i.theme.fontSizeScale)
  public maxWidthChange() {
    // 计算是否还装得下
    if (this.getSliderWidth() > this.maxWidth) this.changeSlider = true
    else this.changeSlider = false
  }
}
