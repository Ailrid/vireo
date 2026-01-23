/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:18
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 22:39:55
 * @FilePath: /server/src/routes/net_ease/other/index.ts
 * @Description: 其他相关路由集合
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Router } from 'express'
import * as comment from './comment.js'
import * as lyric_new from './lyric_new.js'
import * as mv_detail from './mv_detail.js'
import * as mv_url from './mv_url.js'
import * as personal_fm_mode from './personal_fm_mode.js'
import * as personal_fm from './personal_fm.js'
import * as recommend_resource from './recommend_playlist.js'
import * as recommend_songs from './recommend_song.js'
import * as ugc_album_get from './ugc_album_get.js'
import * as vip_info_v2 from './vip_info_v2.js'
import * as intelligence from './intelligence.js'

const othor_router: Router = Router()

const modules = [
  comment,
  lyric_new,
  mv_detail,
  mv_url,
  personal_fm_mode,
  personal_fm,
  recommend_resource,
  recommend_songs,
  ugc_album_get,
  vip_info_v2,
  intelligence
]

// 统一注册
modules.forEach(m => {
  if (m.url && m.handler) {
    othor_router.all(m.url, m.handler) // 使用 .all 支持更多谓词
  }
})

export default othor_router
