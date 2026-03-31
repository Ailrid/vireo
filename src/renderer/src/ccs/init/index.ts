import { SingleMessage, System } from '@virid/core'
import {
  PlayerComponent,
  LyricComponent,
  PlayOrPauseMessage,
  PreviousSongMessage,
  NextSongMessage,
  PlaylistComponent
} from '../playback'
import { LoadSettingsMessage } from '../settings'
import { FetchUserAccountMessage } from '../user'
export class InitializationMessage extends SingleMessage {}

export class InitSystem {
  @System({
    priority: 1000,
    messageClass: InitializationMessage
  })
  static initSetting() {
    //启动的时候自动加载一次设置
    LoadSettingsMessage.send()
    FetchUserAccountMessage.send()
  }
  @System({
    priority: 999,
    messageClass: InitializationMessage
  })
  static initPlayer(playerComponent: PlayerComponent, lyricComponent: LyricComponent) {
    // 绑定回调,在时间更新时自动更新歌词
    playerComponent.player.addListener('timeupdate', () => {
      const time = playerComponent.player.currentTime
      const data = lyricComponent.lyric
      if (!data || data.lyrics.length === 0) return

      // 寻找当前时间对应的索引
      let low = 0
      let high = data.lyrics.length - 1
      let index = -1

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        if (data.lyrics[mid].time <= time) {
          index = mid
          low = mid + 1
        } else {
          high = mid - 1
        }
      }
      // 时间超出时候默认取最后一句
      if (time >= data.lyrics[data.lyrics.length - 1].time) {
        index = data.lyrics.length - 1
      }
      if (index !== -1 && index !== lyricComponent.currentIndex) {
        lyricComponent.currentIndex = index
        navigator.mediaSession.metadata!.title = data.lyrics[index].text
      }
    })
  }
  @System({
    priority: 998,
    messageClass: InitializationMessage
  })
  static initMediaSession(playerComponent: PlayerComponent, playlistComponent: PlaylistComponent) {
    const actionHandlers: [MediaSessionAction, (params?: any) => void][] = [
      ['play', () => PlayOrPauseMessage.send(true)],
      ['pause', () => PlayOrPauseMessage.send(false)],
      ['previoustrack', () => PreviousSongMessage.send()],
      ['nexttrack', () => NextSongMessage.send()],
      [
        'seekbackward',
        () => {
          playerComponent.player.seek(playerComponent.player.currentTime - 10)
        }
      ],
      [
        'seekforward',
        () => {
          playerComponent.player.seek(playerComponent.player.currentTime + 10)
        }
      ],
      [
        'seekto',
        (details: MediaSessionActionDetails) => {
          if (details.seekTime !== undefined) {
            playerComponent.player.seek(details.seekTime)
            navigator.mediaSession.setPositionState({
              duration: playlistComponent.currentSong?.duration,
              playbackRate: 1,
              position: details.seekTime
            })
          }
        }
      ]
    ]

    for (const [action, handler] of actionHandlers) {
      navigator.mediaSession.setActionHandler(action, handler)
    }
  }
}
