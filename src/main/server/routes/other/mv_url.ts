/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:27:02
 * @FilePath: /template/src/main/server/routes/net_ease/other/mv_url.ts
 * @Description: MV链接
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// MV链接

import { createRequest } from '../../utils/request.js'

export const url = '/mv/url'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/song/enhance/play/mv/url'
  const query = req.body
  if (!query.id) throw new Error('Need a id')
  const data = {
    id: query.id,
    r: query.r || 1080
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
