import { FromMain, ToMainMessage, FromMainMessage } from '@virid/renderer'
import { fetchCookies, type PlaylistDetail, type SongDetail } from '@/utils'
import { Message, MessageWriter, System } from '@virid/core'
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
/**
 * * 主进程发起，恢复上次的歌单和歌曲
 */
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

/**
 * * 主进程发起或者自身发起，备份播放列表并关闭窗口
 */
@FromMain('backup-playback')
export class BackupPlaybackMessage extends FromMainMessage {}

export class _BackupPlaybackMessage extends ToMainMessage {
  __virid_messageType: string = 'backup-playback'
  __virid_target: string = 'main'
  constructor(
    public playlistDetail: PlaylistDetail,
    public playlistSongs: SongDetail[],
    public currentSong: SongDetail
  ) {
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
  static async recover(@Message(RecoverPlaybackMessage) message: RecoverPlaybackMessage) {
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
 * * 上一首
 */
@FromMain('play-or-pause')
export class _PlayOrPauseMessage extends FromMainMessage {}

/**
 * * 下一首
 */
@FromMain('next-song')
export class _NextSongMessage extends FromMainMessage {}

/**
 * * 暂停与播放
 */
@FromMain('previous-song')
export class _PreviousSongMessage extends FromMainMessage {}
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

/**
 * * 登陆成功，刷新账户信息
 */
@FromMain('netease-login-success')
export class NeteaseLoginSuccessMessage extends FromMainMessage {}
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
