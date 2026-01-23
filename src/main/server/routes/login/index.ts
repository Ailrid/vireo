/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:18
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 17:11:27
 * @FilePath: /server/src/routes/net_ease/login/index.ts
 * @Description: 登录相关路由集合
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Router } from 'express'
import * as login_qr_check from './login_qr_check.js'
import * as login_qr_create from './login_qr_create.js'
import * as login_qr_key from './login_qr_key.js'
import * as login_status from './login_status.js'
import * as logout from './logout.js'

const login_router: Router = Router()

const modules = [login_qr_check, login_qr_create, login_qr_key, login_status, logout]

// 统一注册
modules.forEach(m => {
  if (m.url && m.handler) {
    login_router.all(m.url, m.handler) // 使用 .all 支持更多谓词
  }
})

export default login_router
