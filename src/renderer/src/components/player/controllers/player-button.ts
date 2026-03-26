import { Controller } from '@virid/core'
import { Project, Use } from '@virid/vue'
import { type SongDetail, type PlaylistInfo } from '@/utils'
import {
  PlayerComponent,
  PlaylistComponent,
  SetVolumeMessage,
  SetPlayModeMessage
} from '@/ccs/playback'
import { UserComponent } from '@/ccs/user'
import { useTemplateRef, type ShallowRef } from 'vue'

@Controller()
export class PlayerButtonController {
  //当前正在播放的歌曲
  @Project(PlaylistComponent, i => i.currentSong)
  public currentSong: SongDetail | null = null

  //用户当前喜欢歌曲的列表
  @Project(UserComponent, i => i.userPlaylists)
  public userPlaylists: PlaylistInfo[] = []

  //当前的音量
  @Project(PlayerComponent, i => i.player.volume)
  public volume: number = 0

  //当前的播放模式
  @Project(PlayerComponent, i => i.playMode)
  public playMode!: string

  @Use(() => useTemplateRef('volumeBar'))
  public volumeBar!: ShallowRef<HTMLDivElement>
  onVolumeMouseDown(event: MouseEvent) {
    const bar = this.volumeBar.value
    if (!bar) return

    const rect = bar.getBoundingClientRect()
    const offsetY = rect.bottom - event.clientY
    const height = rect.height

    let percentage = offsetY / height
    const newVolume = Math.max(0, Math.min(1, percentage))
    SetVolumeMessage.send(newVolume)
  }
  onWheel(e: WheelEvent) {
    //根据方向判断增加还是减少音量
    const delta = e.deltaY > 0 ? -0.01 : 0.01
    const newVolume = Math.max(0, Math.min(1, this.volume + delta))
    SetVolumeMessage.send(newVolume)
  }
  public _volume: number = 0
  mute() {
    SetVolumeMessage.send(this.volume === 0 ? this._volume : 0)
    this._volume = this.volume
  }
  public modeList: string[] = ['order', 'random', 'loop', 'intelligence']
  changeMode() {
    const index = this.modeList.findIndex(i => i == this.playMode)
    const nextIndex = (index + 1) % this.modeList.length
    const nextMode = this.modeList[nextIndex] as 'order' | 'random' | 'loop' | 'intelligence'
    SetPlayModeMessage.send(nextMode)
  }
}
