/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:28:45
 * @FilePath: /template/src/main/server/routes/net_ease/user/user_record.ts
 * @Description: 听歌排行
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 听歌排行
import { createRequest } from '../../utils/request.js'

export const url = '/user/record'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/v1/play/record'
  const query = req.body
  if (!query.uid) throw new Error('Need a uid')
  const data = {
    uid: query.uid,
    type: query.type || 0 // 1: 最近一周, 0: 所有时间
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
