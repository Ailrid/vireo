import {
  type Player,
  PlayerComponent,
  PlaylistComponent,
  SeekTimeMessage,
  SetPlayModeMessage,
  SetVolumeMessage
} from '@/ccs/playback'
import { Controller } from '@virid/core'
import { Project, Responsive, Use, Watch } from '@virid/vue'
import { type PlaylistInfo, type PlaylistDetail, type SongDetail } from '@/utils'
import { type ShallowRef, useTemplateRef } from 'vue'
import { type PlayerConfig, SettingComponent } from '@/ccs/settings'
import { UserComponent } from '@/ccs/user'

@Controller()
export class PlayerInfoController {
  @Responsive()
  public progress: number = 0

  @Project(PlaylistComponent, i => i.currentSong)
  public currentSong: SongDetail | null = null

  @Project(PlayerComponent, i => i.player)
  public player!: Player

  @Project(PlaylistComponent, i => i.playlistDetail)
  public playListDetail: PlaylistDetail | null = null

  @Project(SettingComponent, i => i.player)
  public setting!: PlayerConfig

  //当前的音量
  @Project(PlayerComponent, i => i.player.volume)
  public volume: number = 0

  //当前的播放模式
  @Project(PlayerComponent, i => i.playMode)
  public playMode!: string

  //用户当前喜欢歌曲的列表
  @Project(UserComponent, i => i.userPlaylists)
  public userPlaylists: PlaylistInfo[] = []

  @Use(() => useTemplateRef('volumeBar'))
  public volumeBar!: ShallowRef<HTMLDivElement>

  @Use(() => useTemplateRef('progressBar'))
  public progressBar!: ShallowRef<HTMLDivElement>
  /**
   * * 点击更改音量
   */
  onVolumeMouseDown(event: MouseEvent) {
    const bar = this.volumeBar.value
    if (!bar) return

    const rect = bar.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const width = rect.width
    let percentage = offsetX / width
    const newVolume = Math.max(0, Math.min(1, percentage))
    SetVolumeMessage.send(newVolume)
  }
  /**
   * * 滑轮更改音量
   */
  onVolumeWheel(e: WheelEvent) {
    //根据方向判断增加还是减少音量
    const delta = e.deltaY > 0 ? -0.01 : 0.01
    const newVolume = Math.max(0, Math.min(1, this.volume + delta))
    SetVolumeMessage.send(newVolume)
  }
  /**
   * * 点击更改进度
   */
  onProgressMouseDown(event: MouseEvent) {
    const bar = this.progressBar.value
    if (!bar) return

    const rect = bar.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const width = rect.width
    let percentage = offsetX / width
    const newProgress = Math.max(0, Math.min(1, percentage))
    this.progress = Math.floor(newProgress * 100)
    SeekTimeMessage.send(newProgress * this.player.duration)
  }
  /**
   * * 自动更新时间
   */
  @Watch(PlayerComponent, i => i.player.currentTime)
  onTimeChange() {
    const newProgress = Math.floor((this.player.currentTime / this.player.duration) * 100)
    if (newProgress == this.progress) return
    else this.progress = newProgress
  }

  /**
   * * 改变播放模式
   */
  public modeList: string[] = ['order', 'random', 'loop']
  changeMode(mode: string = '') {
    if (!this.currentSong) return
    //左键点击
    if (!mode) {
      const index = this.modeList.findIndex(i => i == this.playMode)
      const nextIndex = (index + 1) % this.modeList.length
      const nextMode = this.modeList[nextIndex] as 'order' | 'random' | 'loop'
      SetPlayModeMessage.send(nextMode)
    }
    //右键点击
    else {
      if (!this.playListDetail || this.playListDetail.id !== this.userPlaylists.at(0)?.id) return
      if (this.playMode === 'intelligence') SetPlayModeMessage.send('order')
      else SetPlayModeMessage.send('intelligence')
    }
  }
  /**
   * * 获取当前歌曲的文字颜色
   */
  @Project()
  get textColor() {
    if (this.setting.autoColor) return 'var(--cover-color)'
    else return 'var(--foreground)'
  }
}
