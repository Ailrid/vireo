/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:18
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 17:32:03
 * @FilePath: /server/src/routes/net_ease/album/index.ts
 * @Description: 专辑相关路由集合
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Router } from 'express'
import * as artist_album from './artist_album.js'
import * as artist_mv from './artist_mv.js'
import * as artist_song from './artist_song.js'
import * as artist_sub from './artist_sub.js'
import * as artist_sublist from './artist_sublist.js'
import * as artists from './artists.js'

const artist_router: Router = Router()

const modules = [artist_album, artist_mv, artist_song, artist_sub, artist_sublist, artists]

// 统一注册
modules.forEach(m => {
  if (m.url && m.handler) {
    artist_router.all(m.url, m.handler) // 使用 .all 支持更多谓词
  }
})

export default artist_router
