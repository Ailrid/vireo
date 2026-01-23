/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 16:24:03
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:26:49
 * @FilePath: /template/src/main/server/routes/net_ease/other/comment.ts
 * @Description:添加删除回复评论
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { createRequest } from '../../utils/request.js'
export const url = '/comments'
export async function handler(req: any, res: any): Promise<any> {
  const query = req.body
  const url = `/api/resource/comments/${query.t}`

  const data: CommentData = {
    threadId: 'R_SO_4_' + query.id
  }

  if (query.t == 'add') data.content = query.content
  else if (query.t == 'delete') data.commentId = query.commentId
  else if (query.t == 'reply') {
    data.commentId = query.commentId
    data.content = query.content
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const
  const answer = await createRequest(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}

interface CommentData {
  threadId: string
  content?: string
  commentId?: string
}
