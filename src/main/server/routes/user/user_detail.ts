/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:28:39
 * @FilePath: /template/src/main/server/routes/net_ease/user/user_detail.ts
 * @Description: 用户详情
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 用户详情

import { createRequest } from '../../utils/request.js'

export const url = '/user/detail'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/v1/user/detail'
  const query = req.body
  const data = {}
  if (!query.uid) throw new Error('Need a uid')
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url + '/' + query.uid, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
