/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:37
 * @FilePath: /template/src/main/server/routes/net_ease/login/login_qr_create.ts
 * @Description: 登录二维码创建接口
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { renderSVG } from 'uqr'
export const url = '/login/qr/create'

export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  if (!query.unikey) throw new Error('Need a unikey')
  const url = `https://music.163.com/login?codekey=${query.unikey}`

  // 使用 uqr 生成结果
  const answer = {
    qrurl: url,
    // 方案 A: 返回 SVG 字符串 (更现代，体积小，无限放大不模糊)
    qrsvg: renderSVG(url)
  }

  return res.status(200).json(answer)
}
