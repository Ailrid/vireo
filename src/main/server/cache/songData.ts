import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { PassThrough } from 'stream'
import { dbComponent } from '@main/server/db'
import { type Request, type Response } from 'express'
import { MessageWriter } from '@virid/core'
export const apiUrl = '/song/data'
export const urlMap = new Map<number, string>()

export async function handler(req: Request, res: Response): Promise<any> {
  const { id, md5, source } = req.query
  if (source == 'local') {
    //TODO
  } else {
    const songId = Number(id)

    // 查数据库记录
    const stmt = dbComponent.db.prepare(
      'SELECT local_path FROM song_cache WHERE id = ? AND md5 = ?'
    )
    const cacheRecord = stmt.get(songId, md5) as { local_path: string } | undefined
    const localPath = cacheRecord?.local_path

    //  本地有缓存
    if (localPath && fs.existsSync(localPath)) {
      dbComponent.db
        .prepare('UPDATE song_cache SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(songId)
      const absolutePath = path.isAbsolute(localPath) ? localPath : path.join('/', localPath)
      return res.sendFile(absolutePath, { dotfiles: 'allow' }, (err: any) => {
        MessageWriter.error(err)
      })
    }

    // 本地没缓存，走在线代理
    const realUrl = urlMap.get(songId)
    if (!realUrl) return res.status(404).send('URL Expired')

    try {
      console.log('req.headers.range :>> ', req.headers.range)
      const proxyHeaders: Record<string, string> = {
        Range: req.headers.range || 'bytes=0-',
        Cookie: req.headers.cookie || '',
        Referer: 'https://music.163.com/',
        //强制不进行压缩
        'Accept-Encoding': 'identity',
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      }

      const response = await axios.get(realUrl, {
        responseType: 'stream',
        headers: proxyHeaders,
        // 不要让 axios 自动处理 302 重定向
        maxRedirects: 5,
        timeout: 10000
      })

      // 加入 Etag，这样浏览器下次可能会发 If-None-Match
      res.status(response.status).set({
        'Content-Range': response.headers['content-range'],
        'Accept-Ranges': 'bytes',
        'Content-Length': response.headers['content-length'],
        'Content-Type': response.headers['content-type'],
        Etag: response.headers['etag'], // 增加 Etag 透传
        'Last-Modified': response.headers['last-modified'] // 增加修改时间透传
      })

      // 只有在从头播放（无 Range 或 bytes=0-）时才启动“边听边存”
      const isFullStart = !req.headers.range || req.headers.range.startsWith('bytes=0-')

      if (isFullStart) {
        cleanupCache(dbComponent.db, 2 * 1024 * 1024 * 1024)
        const savePath = path.join(dbComponent.cachePath, `${id}-${md5}`)
        const writer = fs.createWriteStream(savePath)
        const passThrough = new PassThrough()
        response.data.pipe(passThrough)
        response.data.pipe(writer)

        writer.on('finish', () => {
          // 从 axios 响应头或 writer 的流中获取大小
          const size = parseInt(response.headers['content-length'] || '0')
          const insertStmt = dbComponent.db.prepare(
            'INSERT OR REPLACE INTO song_cache (id, md5, local_path, size, last_accessed_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
          )
          insertStmt.run(songId, md5, savePath, size)
        })
        // 报错处理：防止写入失败导致响应中断
        writer.on('error', (err) => console.error('Cache Write Error:', err))

        return passThrough.pipe(res)
      }

      // 如果是跳进度条的 Range 请求，直接转发不保存
      return response.data.pipe(res)
    } catch (err: any) {
      MessageWriter.error(err)
      return res.status(500).send('Proxy Error')
    }
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
        console.error('Delete old cache failed:', e)
      }
    }
  }
}
