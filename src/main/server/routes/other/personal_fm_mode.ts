/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:27:05
 * @FilePath: /template/src/main/server/routes/net_ease/other/personal_fm_mode.ts
 * @Description:私人FM - 模式选择
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// 私人FM - 模式选择

// aidj, DEFAULT, FAMILIAR, EXPLORE, SCENE_RCMD ( EXERCISE, FOCUS, NIGHT_EMO  )
// 来不及解释这几个了

import { createRequest } from '../../utils/request.js'

export const url = '/fm/mode'
export async function handler(req: any, res: any): Promise<any> {
  const url = '/api/v1/radio/get'
  const query = req.body
  if (!query.mode) throw new Error('Need a mode')
  if (!query.submode) throw new Error('Need a submode')
  const data = {
    mode: query.mode,
    subMode: query.submode,
    limit: query.limit || 3
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
