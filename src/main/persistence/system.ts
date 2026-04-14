import {
  _RecoverPlaybackMessage,
  BackupPlaybackMessage,
  InitDatabaseMessage,
  RecoverPlaybackMessage
} from './message'
import { DatabaseComponent, DB } from './component'
import fs from 'fs'
import { System, MessageWriter, Message } from '@virid/core'
import path from 'node:path'

export class DatabaseSystem {
  /*
   * 创建数据库
   */
  @System()
  static initDatabase(
    @Message(InitDatabaseMessage) message: InitDatabaseMessage,
    dbComp: DatabaseComponent
  ) {
    const dbFilePath = message.path
    const dbDir = path.dirname(dbFilePath)

    // 确保目录存在
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    if (!fs.existsSync(message.cachePath)) {
      fs.mkdirSync(message.cachePath, { recursive: true })
    }
    // 绑定数据库
    dbComp.db = new DB(dbFilePath)
    dbComp.cachePath = message.cachePath
    MessageWriter.info(
      '[DatabaseSystem] Database Initialization Completed: Database and Cache path bound successfully.'
    )
  }
}

/**
 * * 播放列表备份系统
 */
export class PlaybackSystem {
  @System({
    priority: 999
  })
  static async backup(
    @Message(BackupPlaybackMessage) message: BackupPlaybackMessage,
    dbComp: DatabaseComponent
  ) {
    const { playlistDetail, playlistSongs, currentSong } = message

    dbComp.db.backupPlaybackSnap({
      playlist_detail: playlistDetail,
      songs_list: playlistSongs,
      current_song: currentSong
    })
  }
  @System({
    messageClass: RecoverPlaybackMessage
  })
  static async recover(dbComp: DatabaseComponent) {
    try {
      const row = dbComp.db.recoverPlaybackSnap()
      if (row) {
        _RecoverPlaybackMessage.send(row.playlist_detail, row.songs_list, row.current_song)
      }
    } catch (err) {
      MessageWriter.error(err as Error, '[PlaybackSystem] Cannot read snapshot from database')
    }
  }
}