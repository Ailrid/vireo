import { System } from '@virid/core'
import { MediaSessionMessage } from '../message'
import { LyricComponent, PlaylistComponent } from '../components'

export class MediaSessionSystem {
  @System({
    messageClass: MediaSessionMessage
  })
  static async changeSongMetadata(
    lyricComponent: LyricComponent,
    playlistComponent: PlaylistComponent
  ) {
    const currentSong = playlistComponent.currentSong

    if (!currentSong) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: lyricComponent.lyric?.lyrics[0].text,
      // artist: currentSong.artists.map((a) => a.name).join('/'),
      // album: currentSong.album.name,
      artwork: [
        { src: `${currentSong.album.cover}?param=512y512`, sizes: '512x512', type: 'image/png' }
      ]
      // artwork: [{ src: currentSong.album.cover }]
    })
    // 播放状态是每次消息过来都要更新的
    navigator.mediaSession.setPositionState({
      // 总时长
      duration: currentSong.duration,
      // 播放速率
      playbackRate: 1,
      // 当前播放到的时间
      position: 0
    })
  }
}

import { type ViridApp } from '@virid/core'
export function registerMediaSessionSystems(app: ViridApp) {
  app.register(MediaSessionSystem.changeSongMetadata)
}
