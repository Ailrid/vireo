/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:39
 * @FilePath: /template/src/main/server/routes/net_ease/login/login_qr_key.ts
 * @Description: 登录二维码 key 获取接口
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { createRequest } from '../../utils/request.js'

export const url = '/login/qr/key'

export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/login/qrcode/unikey'
  const data = {
    type: 3
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)

  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
