/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:27:32
 * @FilePath: /template/src/main/server/routes/net_ease/playlist/playlist_detail.ts
 * @Description: 歌单详情
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 歌单详情

import { createRequest } from '../../utils/request.js'

export const url = '/playlist/detail'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/v6/playlist/detail'
  const query = req.body
  if (!query.id) throw new Error('Need a id')
  const data = {
    id: query.id,
    n: query.limit,
    s: query.s || 8
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  } as const

  const answer = await createRequest(url, data, options)
  // const offset = query.offset || 0;
  // const limit = query.limit || answer.data.playlist.trackIds.length;
  // const trackIds = answer.data.playlist.trackIds;
  // let idsData = {
  //   c: JSON.stringify(
  //     trackIds.slice(offset, offset + limit).map((item) => {
  //       return { id: item.id };
  //     })
  //   ),
  // };
  // const optionsTracks = {
  //   crypto: "weapi",
  //   cookie: req.cookies,
  //   headers: {},
  // };
  // const answerTracks = await createRequest(
  //   "/api/v3/song/detail",
  //   idsData,
  //   optionsTracks
  // );
  // answer.data.playlist.tracks = answerTracks.data.songs;

  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
