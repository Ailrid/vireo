/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:45
 * @FilePath: /template/src/main/server/routes/net_ease/login/logout.ts
 * @Description: 退出登录接口
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 退出登录
import { createRequest } from '../../utils/request.js'

export const url = '/logout'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/logout'
  const data = {}
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
