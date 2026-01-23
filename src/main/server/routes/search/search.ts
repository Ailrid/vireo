/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 19:02:12
 * @FilePath: /template/src/main/server/routes/search/search.ts
 * @Description: 搜索
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 搜索

import { createRequest } from '../../utils/request.js'

export const url = '/search'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  const url = '/api/search/get'
  if (!query.keywords) throw new Error('Need a keywords')
  if (!query.type)
    throw new Error(
      'Need a type {1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频}'
    )
  const data = {
    s: query.keywords,
    type: query.type, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
    limit: query.limit || 30,
    offset: query.offset || 0
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
