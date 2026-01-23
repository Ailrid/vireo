/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:27:44
 * @FilePath: /template/src/main/server/routes/net_ease/playlist/playlist_update.ts
 * @Description: 编辑歌单
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 编辑歌单

import { createRequest } from '../../utils/request.js'

export const url = '/playlist/update'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/batch'
  const query = req.body
  if (!query.id) throw new Error('Need a id')
  if (!query.desc) throw new Error('Need a desc')
  // if (!query.tags) throw new Error("Need a tags");
  if (!query.name) throw new Error('Need a name')

  const data = {
    '/api/playlist/desc/update': `{"id":${query.id},"desc":"${query.desc}"}`,
    '/api/playlist/tags/update': `{"id":${query.id},"tags":"${query.tags}"}`,
    '/api/playlist/update/name': `{"id":${query.id},"name":"${query.name}"}`
  }

  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
