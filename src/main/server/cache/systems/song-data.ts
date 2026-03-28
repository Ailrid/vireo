import { DatabaseComponent } from '../../components'
import { CacheSongDataRequestMessage } from '../message'
import { CacheSongUrlSystem } from './song-url'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { MessageWriter, Message } from '@virid/core'
import {
  Headers,
  HttpSystem,
  InternalServerError,
  HttpRequestMessage,
  type RequestId,
  Query,
  StreamFile,
  Stream
} from '@virid/express'

class DataFromLocalMessage extends HttpRequestMessage {
  constructor(
    requestId: RequestId,
    public songId: number
  ) {
    super(requestId)
  }
}
class DataFromCacheMessage extends HttpRequestMessage {
  constructor(
    requestId: RequestId,
    public cachePath: string
  ) {
    super(requestId)
  }
}

export class CacheSongDataSystem {
  //用于暂存url的map
  static urlMap: Map<number, string> = new Map()
  @HttpSystem()
  public static async songData(
    @Message(CacheSongDataRequestMessage)
    message: CacheSongDataRequestMessage,
    @Query('id') id: number,
    @Query('md5') md5: string,
    @Query('source') source: 'netease' | 'local',
    @Headers() headers: Record<string, string>,
    dbComponent: DatabaseComponent
  ) {
    // 如果是本地歌曲的url，转发http请求
    const requestId = message.requestId
    if (source == 'local') return new DataFromLocalMessage(requestId, id)
    // 没有缓存，开始边传输边下载
    const realUrl = CacheSongUrlSystem.urlMap.get(id)
    if (!realUrl) return InternalServerError('URL Expired')
    if (CacheSongUrlSystem.urlMap.size > 100) {
      CacheSongUrlSystem.urlMap.clear()
    }
    // 否则是网易云的，开始处理
    // 查数据库记录
    const stmt = dbComponent.db.prepare(
      'SELECT local_path FROM song_cache WHERE id = ? AND md5 = ?'
    )
    const cacheRecord = stmt.get(id, md5) as { local_path: string } | undefined
    const localPath = cacheRecord?.local_path

    //  走缓存
    if (localPath) return new DataFromCacheMessage(requestId, localPath)

    const proxyHeaders: Record<string, string> = {
      Range: headers.range || 'bytes=0-',
      Cookie: headers.cookie || '',
      Referer: 'https://music.163.com/',
      'Accept-Encoding': 'identity',
      'User-Agent': headers['user-agent'] || 'Mozilla/5.0'
    }

    // 否则是网易云的，开始处理
    const fetchResponse = await fetch(realUrl, {
      method: 'GET',
      headers: proxyHeaders
    })

    if (!fetchResponse.ok) return InternalServerError('Remote Fetch Failed')

    // 准备透传的 Headers
    const responseHeaders: Record<string, string> = {
      'Content-Range': fetchResponse.headers.get('content-range') || '',
      'Accept-Ranges': 'bytes',
      'Content-Length': fetchResponse.headers.get('content-length') || '',
      'Content-Type': fetchResponse.headers.get('content-type') || 'audio/mpeg',
      Etag: fetchResponse.headers.get('etag') || '',
      'Last-Modified': fetchResponse.headers.get('last-modified') || ''
    }
    // 将 Web Stream 转为 Node Readable Stream
    const webStream = Readable.fromWeb(fetchResponse.body as any)
    const isFullStart = headers.range == 'bytes=0-'
    // 是第一次，才下载
    if (isFullStart) {
      // 定义后台下载函数（不要 await 它，让它在后台跑）
      const startBackgroundCache = async () => {
        try {
          const savePath = path.join(dbComponent.cachePath, `${id}-${md5}`)
          // 检查是否已经在下载或已存在，避免竞态
          if (fs.existsSync(savePath)) return
          const downloadRes = await fetch(realUrl, { headers: proxyHeaders })
          if (!downloadRes.ok) return
          const writer = fs.createWriteStream(savePath)
          const downloadStream = Readable.fromWeb(downloadRes.body as any)
          downloadStream.pipe(writer)
          writer.on('finish', () => {
            const size = fs.statSync(savePath).size
            dbComponent.db
              .prepare(
                'INSERT OR REPLACE INTO song_cache (id, md5, local_path, size, last_accessed_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
              )
              .run(id, md5, savePath, size)
            cleanupCache(dbComponent.db, 2 * 1024 * 1024 * 1024)
          })
          writer.on('error', err => {
            MessageWriter.error(
              err,
              '[Express CacheSongDataSystem] Error when saving song to cache'
            )
            fs.unlink(savePath, () => {})
          })
        } catch (e) {
          MessageWriter.error(
            e as Error,
            '[Express CacheSongDataSystem] Error when downloading song'
          )
        }
      }
      // 启动下载，但不阻塞当前响应
      startBackgroundCache()
    }

    // 返回流对象
    return Stream(webStream, {
      status: fetchResponse.status,
      headers: responseHeaders
    })
  }

  @HttpSystem()
  public static async songDataFromLocal(
    @Message(DataFromLocalMessage) _message: DataFromLocalMessage,
    _dbComponent: DatabaseComponent
  ) {
    // const _id = message.songId
    //在这里应该查找然后播放
    //TODO
    return InternalServerError('Not implemented')
  }

  @HttpSystem()
  public static async songDataFromCache(
    @Message(DataFromCacheMessage) message: DataFromCacheMessage,
    @Query('id') id: number,
    @Query('md5') md5: string,
    dbComponent: DatabaseComponent
  ) {
    const requestId = message.requestId
    const cachePath = message.cachePath
    if (!fs.existsSync(cachePath)) {
      //缓存有问题，删除数据库记录，然后重新发回CacheSongsDataRequestMessage
      dbComponent.db.prepare('DELETE FROM song_cache WHERE id = ? AND md5 = ?').run(id, md5)
      return new CacheSongDataRequestMessage(requestId)
    }
    // 更新缓存数据
    dbComponent.db
      .prepare('UPDATE song_cache SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(id)
    const absolutePath = path.isAbsolute(cachePath) ? cachePath : path.join('/', cachePath)
    return StreamFile(absolutePath, {
      dotfiles: 'allow',
      headers: {
        'From-Cache': 'true'
      }
    })
  }
}

function cleanupCache(db: any, maxSizeBytes: number) {
  // 先查一下目前总大小
  const row = db.prepare('SELECT SUM(size) as totalSize FROM song_cache').get()
  let currentSize = row?.totalSize || 0

  // 如果超标了（2GB）
  if (currentSize > maxSizeBytes) {
    // 每次清理出 20% 的空间
    const targetSize = maxSizeBytes * 0.8
    const oldestSongs = db.prepare('SELECT * FROM song_cache ORDER BY last_accessed_at ASC').all()

    for (const song of oldestSongs) {
      if (currentSize <= targetSize) break
      try {
        if (fs.existsSync(song.local_path)) fs.unlinkSync(song.local_path)
        db.prepare('DELETE FROM song_cache WHERE id = ?').run(song.id)
        currentSize -= song.size
      } catch (e) {
        MessageWriter.error(e as Error, `[Song Cache] Cannot delete cache file ${song.local_path}`)
      }
    }
  }
}
