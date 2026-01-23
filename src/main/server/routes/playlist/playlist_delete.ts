/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:27:30
 * @FilePath: /template/src/main/server/routes/net_ease/playlist/playlist_delete.ts
 * @Description: 删除歌单
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 删除歌单

import { createRequest } from '../../utils/request.js'

export const url = '/playlist/delete'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/playlist/remove'
  const query = req.body
  if (!query.id) throw new Error('Need a id')
  const data = {
    ids: '[' + query.id + ']'
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
