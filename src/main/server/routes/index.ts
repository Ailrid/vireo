/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:23:28
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-23 11:01:57
 * @FilePath: /starry/src/main/server/routes/index.ts
 * @Description: 网易云音乐路由集合
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Router } from 'express'
import login_router from './login/index.js'
import playlist_router from './playlist/index.js'
import othor_router from './other/index.js'
import album_router from './album/index.js'
import artist_router from './artist/index.js'
import user_router from './user/index.js'
import song_router from './song/index.js'
import search_router from './search/index.js'
const net_ease_router: Router = Router()

const routers = [
  login_router,
  playlist_router,
  othor_router,
  album_router,
  artist_router,
  user_router,
  song_router,
  search_router
]
// 统一注册
routers.forEach((r) => {
  net_ease_router.use('/net_ease', r)
})

export default net_ease_router
