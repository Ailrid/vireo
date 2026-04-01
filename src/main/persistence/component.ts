import { Component } from '@virid/core'
import Database from 'better-sqlite3'
import { type PlaylistDetail, type SongDetail } from '@main/server/netEase'

export interface SongCacheRecord {
  id: number
  md5: string
  local_path: string
  size: number
  created_at: string
  last_accessed_at: string
}
export interface LyricCacheRecord {
  id: number
  lyrics_json: string
  is_pure: number
  updated_at: string
}
export interface PlaybackSnapRecord {
  playlist_detail: PlaylistDetail
  songs_list: SongDetail[]
  current_song: SongDetail
}

export class DB {
  public db: ReturnType<typeof Database>
  constructor(cachePath: string) {
    // 绑定数据库
    this.db = new Database(cachePath)

    // 初始化歌曲缓存表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS song_cache (
        id INTEGER PRIMARY KEY,
        md5 TEXT,
        local_path TEXT,
        size INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    //初始化歌词缓存表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS lyric_cache (
        id INTEGER PRIMARY KEY,
        lyrics_json TEXT,       
        is_pure INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 初始化播放记录快照表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS playback_snap (
        id INTEGER PRIMARY KEY DEFAULT 1,
        playlist_detail TEXT,   -- PlaylistDetail JSON
        songs_list TEXT,       -- SongDetail[]  JSON
        current_song TEXT,      -- SongDetail  JSON
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }
  addSongCache(record: SongCacheRecord) {
    const { id, md5, local_path, size } = record
    this.db
      .prepare(
        'INSERT OR REPLACE INTO song_cache (id, md5, local_path, size, last_accessed_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .run(id, md5, local_path, size)
  }
  updateSongCache(id: number) {
    this.db
      .prepare('UPDATE song_cache SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(id)
  }

  getSongCache(id: number, md5: string): SongCacheRecord | undefined {
    return this.db
      .prepare('SELECT local_path FROM song_cache WHERE id = ? AND md5 = ?')
      .get(id, md5) as SongCacheRecord | undefined
  }
  deleteSongCache(id: number, md5: string) {
    this.db.prepare('DELETE FROM song_cache WHERE id = ? AND md5 = ?').run(id, md5)
  }

  addLyricCache(record: LyricCacheRecord) {
    const { id, lyrics_json, is_pure } = record
    this.db
      .prepare(
        `
      INSERT OR REPLACE INTO lyric_cache (id, lyrics_json, is_pure, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `
      )
      .run(id, lyrics_json, is_pure ? 1 : 0)
  }
  getLyricCache(id: number): LyricCacheRecord | undefined {
    return this.db.prepare('SELECT lyrics_json FROM lyric_cache WHERE id = ?').get(id) as
      | LyricCacheRecord
      | undefined
  }
  backupPlaybackSnap(record: PlaybackSnapRecord) {
    const { playlist_detail, songs_list, current_song } = record
    const sql = `
    REPLACE INTO playback_snap (id, playlist_detail, songs_list, current_song, updated_at)
    VALUES (1, ?, ?, ?, datetime('now'))
  `
    this.db
      .prepare(sql)
      .run(
        JSON.stringify(playlist_detail),
        JSON.stringify(songs_list),
        JSON.stringify(current_song)
      )
  }
  recoverPlaybackSnap(): PlaybackSnapRecord | undefined {
    const row = this.db.prepare('SELECT * FROM playback_snap WHERE id = 1').get() as any
    if (!row) return undefined
    return {
      playlist_detail: JSON.parse(row.playlist_detail),
      songs_list: JSON.parse(row.songs_list),
      current_song: JSON.parse(row.current_song)
    } as PlaybackSnapRecord
  }
}

@Component()
export class DatabaseComponent {
  public db!: DB
  public cachePath: string = ''
}
