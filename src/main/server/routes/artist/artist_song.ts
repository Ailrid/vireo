/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:17
 * @FilePath: /template/src/main/server/routes/net_ease/artist/artist_song.ts
 * @Description: 歌手专辑列表
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 歌手专辑列表

import { createRequest } from '../../utils/request.js'

export const url = '/artist/songs'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  if (!query.id) throw new Error('Need a artist id')
  const url = '/api/v1/artist/songs'
  const data = {
    id: query.id,
    private_cloud: 'true',
    work_type: 1,
    order: query.order || 'hot', //hot,time
    offset: query.offset || 0,
    limit: query.limit || 100
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)

  const tracksID = answer.data.songs.map((item: any) => {
    return { id: item.id }
  })

  const idsData = {
    c: JSON.stringify(tracksID)
  }
  const optionsTracks = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answerTracks = await createRequest('/api/v3/song/detail', idsData, optionsTracks)
  answer.data.songs = answerTracks.data.songs

  return res.set('Set-Cookie', answerTracks.cookie).status(answerTracks.status).json(answer.data)
}
