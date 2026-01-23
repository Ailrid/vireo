/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 17:24:47
 * @FilePath: /server/src/routes/net_ease/other/ugc_album_get.ts
 * @Description:专辑简要百科信息
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 专辑简要百科信息

import { createRequest } from '../../utils/request.js'

export const url = '/album/wiki'
export async function handler(req: any, res: any) {
  const url = '/api/rep/ugc/album/get'
  const query = req.body
  if (!query.id) throw new Error('Need a id')
  const data = {
    albumId: query.id
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
