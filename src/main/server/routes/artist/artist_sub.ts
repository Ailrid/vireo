/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:19
 * @FilePath: /template/src/main/server/routes/net_ease/artist/artist_sub.ts
 * @Description: 已收藏专辑列表
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 已收藏专辑列表
import { createRequest } from '../../utils/request.js'

export const url = '/artist/sub'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  const url = '/api/artist/' + query.type
  const data = {
    artistId: query.id,
    artistIds: '[' + query.id + ']'
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
