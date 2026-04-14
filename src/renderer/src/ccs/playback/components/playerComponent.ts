import { Component, MessageWriter, Safe } from '@virid/core'
import { Responsive } from '@virid/vue'
import { NextSongMessage } from '../messages'
export class Player {
  private audio: HTMLAudioElement
  private ctx: AudioContext
  private gainNode: GainNode
  private analyser: AnalyserNode
  private retryCount: number = 0
  @Responsive() public volume: number = 1.0
  @Responsive() public isPlaying: boolean = false
  @Responsive() public currentTime: number = 0.0
  @Responsive() public duration: number = 999999.0
  // @Responsive(true) public buffered: TimeRanges | null = null
  @Responsive()
  public slider: Array<number> = Array(60).fill(0)
  @Responsive()
  public sliderMask: Array<boolean> = Array(60).fill(false)
  constructor() {
    this.audio = new Audio()
    this.audio.crossOrigin = 'anonymous'

    // 初始化 Web Audio
    this.ctx = new AudioContext()
    this.gainNode = this.ctx.createGain()
    this.analyser = this.ctx.createAnalyser()
    this.analyser.fftSize = 256
    const source = this.ctx.createMediaElementSource(this.audio)
    source.connect(this.gainNode).connect(this.analyser).connect(this.ctx.destination)
    // 初始化音量同步
    this.gainNode.gain.value = this.volume
    // 同步逻辑
    this.initInternalSync()
  }

  private initInternalSync() {
    // 使用 addEventListener 而不是直接赋值，防止冲突
    this.audio.addEventListener('play', () => {
      this.isPlaying = true
    })
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false
    })
    this.audio.addEventListener('ended', () => {
      NextSongMessage.send()
    })
    // 注入元数据,重新确认一次时长
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration = this.audio.duration
    })
    // 出错的时候重新发起请求
    const MAX_RETRIES = 3
    this.audio.addEventListener('error', () => {
      const errorCode = this.audio.error?.code
      const currentTime = this.audio.currentTime

      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++
        MessageWriter.error(
          new Error(`[Player] Retry: ${this.retryCount} times, code: ${errorCode}`)
        )

        setTimeout(() => {
          this.audio.load()
          this.audio.oncanplay = () => {
            this.audio.currentTime = currentTime
            this.audio
              .play()
              .then(() => {
                // 播放成功，重置计数器
                this.retryCount = 0
              })
              .catch(e => {
                MessageWriter.error(new Error(`[Player] Retry Failed: Error ${e}`))
              })
            this.audio.oncanplay = null
          }
        }, 500)
      } else {
        // 超过最大重试次数
        MessageWriter.error(
          new Error(`[Player] All retries have failed, skipping the current song`)
        )
        this.retryCount = 0 // 切换前重置计数器
        NextSongMessage.send()
      }
    })
    // this.audio.addEventListener('progress', () => {
    //   this.buffered = this.audio.buffered
    // })
    // 默认的内部同步：只负责更新响应式数据
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime
      // 计算当前播放进度占总长度的比例
      const progress = this.currentTime / this.duration
      const sliderIndex = Math.floor(progress * 60)
      // 边界检查
      if (sliderIndex >= 0 && sliderIndex < 60 && this.slider[sliderIndex] == 0) {
        this.slider[sliderIndex] = this.getAveragePower()
        this.sliderMask[sliderIndex] = true
      }
    })
  }
  // 唯一可直接被Controller调用的方法
  @Safe()
  public addListener<K extends keyof HTMLMediaElementEventMap>(
    eventName: K,
    listener: (ev: HTMLMediaElementEventMap[K]) => void
  ) {
    // 直接绑定
    this.audio.addEventListener(eventName, listener)
    // 返回一个闭包函数，用于销毁监听
    return () => {
      this.audio.removeEventListener(eventName, listener)
    }
  }

  /**
   * * 返回0-1
   */
  @Safe()
  public getAveragePower() {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    // 获取时域数据
    this.analyser.getByteTimeDomainData(dataArray)

    let max = 0
    for (let i = 0; i < dataArray.length; i++) {
      // 归一化并取绝对值
      const amplitude = Math.abs(dataArray[i] / 128 - 1)
      if (amplitude > max) max = amplitude
    }
    const highContrastMax = Math.pow(max, 0.6)

    return highContrastMax
  }

  public setSrc(url: string) {
    this.audio.src = url
    //清空状态
    this.slider = Array(60).fill(0)
    this.sliderMask = Array(60).fill(false)
  }

  public play() {
    if (this.ctx.state === 'suspended') this.ctx.resume()
    this.audio.play()
  }

  public pause() {
    this.audio.pause()
  }

  public seek(time: number) {
    this.audio.currentTime = time
    //清除从这往后的slider和sliderMask
    const progress = time / this.duration
    const sliderIndex = Math.floor(progress * 60) - 1
    this.slider.forEach((_item, index) => {
      if (index > sliderIndex) {
        this.slider[index] = 0
        this.sliderMask[index] = false
      }
    })
  }

  public setVolume(val: number) {
    this.volume = val
    const physicalGain = val * val
    this.gainNode.gain.setTargetAtTime(physicalGain, this.ctx.currentTime, 0.01)
  }
}

@Component()
export class PlayerComponent {
  public player: Player = new Player()
  @Responsive()
  public playMode: 'order' | 'random' | 'loop' | 'fm' | 'intelligence' = 'order'
}
