/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:28:42
 * @FilePath: /template/src/main/server/routes/net_ease/user/user_playlist.ts
 * @Description: 用户歌单
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 用户歌单

import { createRequest } from '../../utils/request.js'
export const url = '/user/playlist'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/user/playlist'
  const query = req.body
  if (!query.uid) throw new Error('Need a uid')
  const data = {
    uid: query.uid,
    limit: query.limit || 30,
    offset: query.offset || 0,
    includeVideo: true
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
