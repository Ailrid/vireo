/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:11
 * @FilePath: /template/src/main/server/routes/net_ease/artist/artist_album.ts
 * @Description: 歌手专辑列表
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 歌手专辑列表

import { createRequest } from '../../utils/request.js'

export const url = '/artist/albums'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  if (!query.id) throw new Error('Need a artist id')
  const url = `/api/artist/albums/${query.id}`
  const data = {
    limit: query.limit || 50,
    offset: query.offset || 0,
    total: true
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
