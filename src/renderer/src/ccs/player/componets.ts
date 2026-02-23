import { Component, Safe } from '@virid/core'
import { Responsive } from '@virid/vue'
import { type LyricDetail, type PlaylistDetail, type SongDetail } from './interface'
import { NextSongMessage } from './messages'
export class Player {
  private audio: HTMLAudioElement
  private ctx: AudioContext
  private gainNode: GainNode
  private analyser: AnalyserNode
  public volume: number = 0.5

  @Responsive() public isPlaying: boolean = false

  @Responsive()
  public currentSong: SongDetail = null!

  @Responsive()
  public currentTime: number = 0.0

  constructor() {
    this.audio = new Audio()
    this.audio.crossOrigin = 'anonymous'

    // 初始化 Web Audio
    this.ctx = new AudioContext()
    this.gainNode = this.ctx.createGain()
    this.analyser = this.ctx.createAnalyser()
    const source = this.ctx.createMediaElementSource(this.audio)
    source.connect(this.gainNode).connect(this.analyser).connect(this.ctx.destination)

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

    // 默认的内部同步：只负责更新响应式数据
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime
    })
    // 初始化音量同步
    this.gainNode.gain.value = this.volume
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

  public setSrc(url: string) {
    this.audio.src = url
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
  }

  public setVolume(val: number) {
    this.volume = val
    this.gainNode.gain.setValueAtTime(val, this.ctx.currentTime)
  }
}

@Component()
export class PlayerComponent {
  public player: Player = new Player()
  public playMode: 'order' | 'random' | 'loop' | 'fm' | 'intellgence' = 'order'
}
@Component()
export class PlaylistComponent {
  @Responsive()
  public playlistDetail: PlaylistDetail = null!
  @Responsive(true)
  public currentSongs: SongDetail[] = []
  @Responsive()
  public currentIndex: number = 0
  // 当前列表的id
  public playlistId: number = 0
  // 暂存列表
  public stagingList: SongDetail[] = []
  // fm和心动模式的缓冲列表
  public fmList: SongDetail[] = []
  public intellgenceList: SongDetail[] = []
}
@Component()
export class LyricComponent {
  @Responsive()
  public lyric: LyricDetail = null!
  @Responsive(true)
  public currentIndex: number = 0
}
