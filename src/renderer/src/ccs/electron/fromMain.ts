import { FromMain, ToMainMessage, FromMainMessage } from '@virid/renderer'
import { fetchCookies, type PlaylistDetail, type SongDetail } from '@/utils'
import { MessageWriter, System, ViridApp } from '@virid/core'
import { RendererPlugin } from '@virid/renderer'
import {
  PlaylistComponent,
  PlaySongMessage,
  SetPlaylistMessage,
  PlayOrPauseMessage,
  NextSongMessage,
  PreviousSongMessage,
  PlayerComponent
} from '../playback'
import { CloseWindowMessage } from './toMain'
import { match } from 'ts-pattern'
import { FetchUserAccountMessage } from '../user'

@FromMain('recover-playback')
export class RecoverPlaybackMessage extends FromMainMessage {
  constructor(
    public playlistDetail: PlaylistDetail,
    public playlistSongs: SongDetail[],
    public currentSong: SongDetail
  ) {
    super()
  }
}

@FromMain('backup-playback')
export class BackupPlaybackMessage extends FromMainMessage {}

@FromMain('play-or-pause')
export class _PlayOrPauseMessage extends FromMainMessage {}

@FromMain('next-song')
export class _NextSongMessage extends FromMainMessage {}

@FromMain('previous-song')
export class _PreviousSongMessage extends FromMainMessage {}

@FromMain('netease-login-success')
export class NeteaseLoginSuccessMessage extends FromMainMessage {}

export class _BackupPlaybackMessage extends ToMainMessage {
  __virid_message_type: string = 'backup-playback'
  __virid_target: string = 'main'
  constructor(
    public playlistDetail: PlaylistDetail,
    public playlistSongs: SongDetail[],
    public currentSong: SongDetail
  ) {
    super()
  }
}

@FromMain('enable-lyric')
export class EnableLyricMessage extends FromMainMessage {
  constructor(public enable: boolean) {
    super()
  }
}
/**
 * * 播放列表备份系统
 */
export class PlaybackRecoverAndBackupSystem {
  @System({
    priority: 1000
  })
  static async recover(message: RecoverPlaybackMessage) {
    const { playlistDetail, playlistSongs, currentSong } = message
    SetPlaylistMessage.send(playlistSongs, playlistDetail)
    PlaySongMessage.send(currentSong, false)
  }
  @System({
    messageClass: BackupPlaybackMessage,
    priority: -100
  })
  static async backup(playlistComponent: PlaylistComponent) {
    if (playlistComponent.playlistDetail && playlistComponent.currentSong)
      // 数据脱水
      // 这两条消息通过ipc到达主进程之后是顺序的，因此关闭之前一定已经备份完成了
      _BackupPlaybackMessage.send(
        JSON.parse(JSON.stringify(playlistComponent.playlistDetail)),
        JSON.parse(JSON.stringify(playlistComponent.currentList)),
        JSON.parse(JSON.stringify(playlistComponent.currentSong))
      )
    CloseWindowMessage.send()
  }
}

/**
 * * 主进程托盘播放控制转发
 */
export class SongControlSystem {
  @System({
    messageClass: _PlayOrPauseMessage
  })
  static playOrPause(playerComponent: PlayerComponent) {
    PlayOrPauseMessage.send(!playerComponent.player.isPlaying)
  }

  @System({ messageClass: _NextSongMessage })
  static next() {
    NextSongMessage.send()
  }

  @System({ messageClass: _PreviousSongMessage })
  static previous() {
    PreviousSongMessage.send()
  }
}

export class NeteaseLoginSystem {
  @System({
    messageClass: NeteaseLoginSuccessMessage
  })
  static async loginSuccess() {
    // 尝试登陆
    const res = await fetchCookies()
    match(res)
      .with({ ok: true }, () => {
        // 获取用户的账号信息
        FetchUserAccountMessage.send()
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val), '[NeteaseLoginSystem] Login Failed')
      })
      .exhaustive()
  }
}

export function registerFromMainSystems(app: ViridApp, plugin: RendererPlugin) {
  plugin.bindRoute(RecoverPlaybackMessage)
  plugin.bindRoute(BackupPlaybackMessage)
  plugin.bindRoute(_PlayOrPauseMessage)
  plugin.bindRoute(_NextSongMessage)
  plugin.bindRoute(_PreviousSongMessage)
  plugin.bindRoute(NeteaseLoginSuccessMessage)
  plugin.bindRoute(EnableLyricMessage)

  app.register(PlaybackRecoverAndBackupSystem.recover)
  app.register(PlaybackRecoverAndBackupSystem.backup)
  app.register(SongControlSystem.playOrPause)
  app.register(SongControlSystem.next)
  app.register(SongControlSystem.previous)
  app.register(NeteaseLoginSystem.loginSuccess)
}
