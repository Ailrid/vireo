/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 15:19:54
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 19:03:07
 * @FilePath: /template/src/main/server/index.ts
 * @Description: 服务器入口文件
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import net_ease_router from './routes/index.js'
import { join } from 'path'

const app = express()

app.use(cors({ origin: true, credentials: true })) // 允许跨域
app.use(cookieParser()) // 解析 Cookie
app.use(express.json()) // 解析 JSON body
app.use(express.urlencoded({ extended: true })) // 解析 form body

// app.use(express.static("public"));

//挂载网易云音乐路由
app.use('/api', net_ease_router)
// 挂在本地页面路由
app.use('/', express.static(join(__dirname, '../renderer')))

//错误处理
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(500).json({ error: err.message })
})

export { app }
