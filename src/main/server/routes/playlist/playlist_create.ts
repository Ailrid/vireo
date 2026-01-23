/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:27:27
 * @FilePath: /template/src/main/server/routes/net_ease/playlist/playlist_create.ts
 * @Description: 创建歌单
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 创建歌单

import { createRequest } from '../../utils/request.js'

export const url = '/playlist/create'
export async function handler(req: any, res: any): Promise<any> {
  const url = '`/api/playlist/create'
  const query = req.body
  if (!query.name) throw new Error('Need a name')
  const data = {
    name: query.name,
    privacy: query.privacy || 0, //0 为普通歌单，10 为隐私歌单
    type: query.type || 'NORMAL' // NORMAL|VIDEO|SHARED
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
