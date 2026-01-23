/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:27:40
 * @FilePath: /template/src/main/server/routes/net_ease/playlist/playlist_tracks.ts
 * @Description: 收藏单曲到歌单 从歌单删除歌曲
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 收藏单曲到歌单 从歌单删除歌曲

import { createRequest } from '../../utils/request.js'

export const url = '/playlist/tracks'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/playlist/manipulate/tracks'
  const query = req.body
  if (!query.op) throw new Error('Need a op {del or add}')
  if (!query.pid) throw new Error('Need a pid')
  if (!query.tracks) throw new Error('Need a tracks')
  const data = {
    op: query.op, // del,add
    pid: query.pid, // 歌单id
    trackIds: JSON.stringify(query.tracks), // 歌曲id
    tracks: '[object Object]'
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
