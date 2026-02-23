import { Router } from 'express'
import * as songComment from './songComment.js'
import * as songLikeCheck from './songLikeCheck.js'
import * as songLike from './songLike.js'
import * as songUrl from './songUrl.js'
import * as songDetail from './songDetail.js'
const songRouter: Router = Router()

const modules = [songComment, songDetail, songLikeCheck, songLike, songUrl]

// 统一注册
modules.forEach((m) => {
  if (m.apiUrl && m.handler) {
    songRouter.all(m.apiUrl, m.handler)
  }
})

export default songRouter
