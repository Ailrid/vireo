/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 19:22:46
 * @FilePath: /template/src/main/server/routes/album/album_detail.ts
 * @Description: 专辑内容
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 专辑内容

import { createRequest } from '../../utils/request.js'

export const url = '/album/detail'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  if (!query.id) throw new Error('Need a album id')
  const url = `/api/v1/album/${query.id}`
  const data = {
    id: query.id
  }
  const options = {
    crypto: 'weapi',
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
