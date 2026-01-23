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
import * as album_sub from './album_sub.js'
import * as album_sublist from './album_sublist.js'
import * as album from './album_detail.js'

const album_router: Router = Router()

const modules = [album_sub, album_sublist, album]

// 统一注册
modules.forEach(m => {
  if (m.url && m.handler) {
    album_router.all(m.url, m.handler) // 使用 .all 支持更多谓词
  }
})

export default album_router
