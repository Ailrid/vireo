/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:01
 * @FilePath: /template/src/main/server/routes/net_ease/album/album_sublist.ts
 * @Description: 已收藏专辑列表
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 已收藏专辑列表

import { createRequest } from '../../utils/request.js'

export const url = '/album/sublist'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  const url = '/api/album/sublist'
  const data = {
    limit: query.limit || 25,
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
