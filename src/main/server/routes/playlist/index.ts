/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:18
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 17:37:19
 * @FilePath: /server/src/routes/net_ease/playlist/index.ts
 * @Description: 歌单相关路由集合
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Router } from 'express'
import * as playlist_create from './playlist_create.js'
import * as playlist_delete from './playlist_delete.js'
import * as playlist_detail from './playlist_detail.js'
import * as playlist_order_update from './playlist_order_update.js'
import * as playlist_tracks from './playlist_tracks.js'
import * as playlist_update from './playlist_update.js'
import * as playlist_song_order_update from './playlist_song_order_update.js'

const playlist_router: Router = Router()

const modules = [
  playlist_create,
  playlist_delete,
  playlist_detail,
  playlist_order_update,
  playlist_tracks,
  playlist_update,
  playlist_song_order_update
]

// 统一注册
modules.forEach(m => {
  if (m.url && m.handler) {
    playlist_router.all(m.url, m.handler) // 使用 .all 支持更多谓词
  }
})

export default playlist_router
