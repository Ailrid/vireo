/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:28:20
 * @FilePath: /template/src/main/server/routes/net_ease/song/song_comment.ts
 * @Description: 歌曲评论
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 歌曲评论

import { createRequest } from '../../utils/request.js'

export const url = '/song/comments'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  const url = `/api/v1/resource/comments/R_SO_4_${query.id}`
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
