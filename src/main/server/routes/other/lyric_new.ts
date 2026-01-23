/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:56
 * @FilePath: /template/src/main/server/routes/net_ease/other/lyric_new.ts
 * @Description:新版歌词 - 包含逐字歌词
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */

import { createRequest } from '../../utils/request.js'

export const url = '/lyric'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/song/lyric/v1'
  const query = req.body
  if (!query.id) throw new Error('Need a id')
  const data = {
    id: query.id,
    cp: false,
    tv: 0,
    lv: 0,
    rv: 0,
    kv: 0,
    yv: 0,
    ytv: 0,
    yrv: 0
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
