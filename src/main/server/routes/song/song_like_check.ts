/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:28:25
 * @FilePath: /template/src/main/server/routes/net_ease/song/song_like_check.ts
 * @Description: 歌曲是否喜爱
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 歌曲是否喜爱
import { createRequest } from '../../utils/request.js'

export const url = '/song/like/check'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  const url = '/api/song/like/check'
  if (!query.ids) throw new Error('Need ids')
  const data = {
    trackIds: query.ids
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
