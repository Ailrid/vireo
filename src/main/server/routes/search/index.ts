/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:18
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 17:36:37
 * @FilePath: /server/src/routes/net_ease/search/index.ts
 * @Description: 搜索相关路由集合
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Router } from 'express'
import * as search_suggest from './search_suggest.js'
import * as search from './search.js'

const search_router: Router = Router()

const modules = [search_suggest, search]

// 统一注册
modules.forEach(m => {
  if (m.url && m.handler) {
    search_router.all(m.url, m.handler) // 使用 .all 支持更多谓词
  }
})

export default search_router
