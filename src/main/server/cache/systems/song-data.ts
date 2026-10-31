import { DatabaseComponent, SongCacheRecord } from '@main/database'
import { CacheSongDataRequestMessage } from '../message'
import { CacheSongUrlSystem } from './song-url'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { pipeline } from 'node:stream/promises'
import { MessageWriter, System, SingleMessage } from '@virid/core'
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

class DownloadCacheMessage extends SingleMessage {
  constructor(
    public url: string,
    public id: number,
    public md5: string
  ) {
    super()
  }
}

class ClearCacheMessage extends SingleMessage {}

const CATCH_CACHE_SIZE = 2 * 1024 * 1024 * 1024

export class CacheSongDataSystem {
  @HttpSystem()
  static async songData(
    message: CacheSongDataRequestMessage,
    @Query('id') id: number,
    @Query('md5') md5: string,
    @Query('source') source: string,
    @Headers() headers: Record<string, string>,
    dbComponent: DatabaseComponent
  ) {
    // 如果是本地歌曲的url，转发http请求
    const requestId = message.requestId
    if (source == 'local') return new DataFromLocalMessage(requestId, id)
    // 没有缓存，开始边传输边下载
    const realUrl = CacheSongUrlSystem.urlMap.get(id.toString())?.url

    if (!realUrl) return InternalServerError('Cannot get song url')
    // if (CacheSongUrlSystem.urlMap.size > 100) {
    //   CacheSongUrlSystem.urlMap.clear()
    // }
    // 否则是网易云的，开始处理
    // 查数据库记录
    const record = dbComponent.db.getSongCache(id, md5)
    const localPath = record?.local_path
    //  缓存
    if (localPath) return new DataFromCacheMessage(requestId, localPath)
    else DownloadCacheMessage.send(realUrl, id, md5)

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
    // const isFullStart = headers.range == 'bytes=0-'
    // // 第一次，才下载
    // if (isFullStart) DownloadCacheMessage.send(realUrl, id, md5)

    // 返回流对象
    return Stream(webStream, {
      status: fetchResponse.status,
      headers: responseHeaders
    })
  }

  @HttpSystem()
  static async songDataFromLocal(_message: DataFromLocalMessage, _dbComponent: DatabaseComponent) {
    // const _id = message.songId
    //在这里应该查找然后播放
    //TODO
    return InternalServerError('Not implemented')
  }

  @HttpSystem()
  static async songDataFromCache(
    message: DataFromCacheMessage,
    @Query('id') id: number,
    @Query('md5') md5: string,
    dbComponent: DatabaseComponent
  ) {
    const requestId = message.requestId
    const cachePath = message.cachePath
    if (!fs.existsSync(cachePath)) {
      //缓存有问题，删除数据库记录，然后重新发回CacheSongsDataRequestMessage
      dbComponent.db.deleteSongCache(id, md5)
      return new CacheSongDataRequestMessage(requestId)
    }
    // 更新缓存数据
    dbComponent.db.updateSongCache(id)

    const absolutePath = path.isAbsolute(cachePath) ? cachePath : path.join('/', cachePath)
    return StreamFile(absolutePath, {
      dotfiles: 'allow',
      headers: {
        'From-Cache': 'true'
      }
    })
  }

  static fileLock = new Set()
  @System()
  static async downloadCache(message: DownloadCacheMessage, dbComponent: DatabaseComponent) {
    const { url, id, md5 } = message
    const finalPath = path.join(dbComponent.cachePath, `${id}-${md5}`)
    const tempPath = `${finalPath}.downloading`

    if (
      fs.existsSync(finalPath) ||
      fs.existsSync(tempPath) ||
      CacheSongDataSystem.fileLock.has(finalPath)
    )
      return
    // 在这里上锁
    CacheSongDataSystem.fileLock.add(finalPath)
    try {
      const downloadRes = await fetch(url)
      if (!downloadRes?.ok || !downloadRes.body) return
      const writer = fs.createWriteStream(tempPath)
      await pipeline(Readable.fromWeb(downloadRes.body as any), writer)

      // 重命名
      if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath)
      fs.renameSync(tempPath, finalPath)

      const size = fs.statSync(finalPath).size
      dbComponent.db.addSongCache({
        id: id,
        md5,
        local_path: finalPath,
        size,
        created_at: '',
        last_accessed_at: ''
      })

      // 解锁
      CacheSongDataSystem.fileLock.delete(finalPath)
      ClearCacheMessage.send()
    } catch (e) {
      MessageWriter.error(e as Error, '[CacheSongDataSystem] Download failed')
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath)
          // 解锁
          CacheSongDataSystem.fileLock.delete(finalPath)
        } catch {}
      }
    }
  }

  @System({
    messageClass: ClearCacheMessage
  })
  static async clearCache(dbComponent: DatabaseComponent) {
    // 先查一下目前总大小
    const row = dbComponent.db.db
      .prepare('SELECT SUM(size) as totalSize FROM song_cache')
      .get() as any
    let currentSize = row?.totalSize || 0

    // 如果超标了（2GB）
    if (currentSize > CATCH_CACHE_SIZE) {
      // 每次清理出 50% 的空间
      const targetSize = CATCH_CACHE_SIZE * 0.5
      const oldestSongs = dbComponent.db.db
        .prepare('SELECT * FROM song_cache ORDER BY last_accessed_at ASC')
        .all() as SongCacheRecord[]

      for (const song of oldestSongs) {
        if (currentSize <= targetSize) break
        try {
          if (fs.existsSync(song.local_path)) fs.unlinkSync(song.local_path)
          dbComponent.db.deleteSongCache(song.id, song.md5)
          currentSize -= song.size
        } catch (e) {
          MessageWriter.error(
            e as Error,
            `[CacheSongDataSystem] Cannot delete cache file ${song.local_path}`
          )
        }
      }
    }
  }
}
