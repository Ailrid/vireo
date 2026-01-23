/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:18
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 17:34:08
 * @FilePath: /server/src/routes/net_ease/user/index.ts
 * @Description: 用户相关路由集合
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Router } from 'express'
import * as user_account from './user_account.js'
import * as user_detail from './user_detail.js'
import * as user_playlist from './user_playlist.js'
import * as user_record from './user_record.js'
import * as user_subcount from './user_subcount.js'

const user_router: Router = Router()

const modules = [user_account, user_detail, user_playlist, user_record, user_subcount]

// 统一注册
modules.forEach(m => {
  if (m.url && m.handler) {
    user_router.all(m.url, m.handler) // 使用 .all 支持更多谓词
  }
})

export default user_router
