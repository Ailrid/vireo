/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:18
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 22:17:20
 * @FilePath: /server/src/routes/net_ease/song/index.ts
 * @Description: 用户相关路由集合
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Router } from 'express'
import * as song_comment from './song_comment.js'
import * as song_detail from './song_detail.js'
import * as song_like_check from './song_like_check.js'
import * as song_like from './song_like.js'
import * as song_url from './song_url.js'

const song_router: Router = Router()

const modules = [song_comment, song_detail, song_like_check, song_like, song_url]

// 统一注册
modules.forEach(m => {
  if (m.url && m.handler) {
    song_router.all(m.url, m.handler) // 使用 .all 支持更多谓词
  }
})

export default song_router
