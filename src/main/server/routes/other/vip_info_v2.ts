/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:27:18
 * @FilePath: /template/src/main/server/routes/net_ease/other/vip_info_v2.ts
 * @Description: 获取 VIP 信息
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 获取 VIP 信息

import { createRequest } from '../../utils/request.js'

export const url = '/vip'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/music-vip-membership/client/vip/info'
  const query = req.body
  if (!query.uid) throw new Error('Need a uid')
  const data = {
    userId: query.uid || ''
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
