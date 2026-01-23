/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:54
 * @FilePath: /template/src/main/server/routes/net_ease/other/intelligence.ts
 * @Description:心动模式播放
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { createRequest } from '../../utils/request.js'
export const url = '/playmode/intelligence/list'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  const url = '/api/playmode/intelligence/list'

  const data = {
    songId: query.id,
    type: 'fromPlayOne',
    playlistId: query.pid,
    startMusicId: query.sid || query.id,
    count: query.count || 1
  }

  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const

  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
