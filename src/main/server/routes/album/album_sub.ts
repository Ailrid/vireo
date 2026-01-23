/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 17:44:12
 * @FilePath: /server/src/routes/net_ease/album/album_sub.ts
 * @Description: 收藏/取消收藏专辑
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 收藏/取消收藏专辑
// 用法：
// POST /api/album/sub?id=&type=sub
// 参数：
// id: 专辑id
// type: sub 或 unsub

import { createRequest } from '../../utils/request.js'

export const url = '/album/sub'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  if (!query.id) throw new Error('Need a album id')
  if (!query.type) throw new Error('Need a type{sub unsub}')
  const url = `/api/album/${query.type}`
  const data = {
    id: query.id
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
