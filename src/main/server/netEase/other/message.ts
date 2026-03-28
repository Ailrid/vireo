import { HttpRoute, HttpRequestMessage } from '@virid/express'
@HttpRoute({
  path: '/netease/comments',
  method: 'post'
})
export class CommentRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/playmode/intelligence/list',
  method: 'post'
})
export class IntelligenceModeRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/mv/detail',
  method: 'post'
})
export class MvDetailRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/mv/url',
  method: 'post'
})
export class MvUrlRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/playmode/fm/mode',
  method: 'post'
})
export class FmModeRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/recommend/playlists',
  method: 'post'
})
export class RecommendPlaylistRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/recommend/songs',
  method: 'post'
})
export class RecommendSongRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/vip/info',
  method: 'post'
})
export class VipInfoRequestMessage extends HttpRequestMessage { }

@HttpRoute({
  path: '/netease/homepage',
  method: 'post'
})
export class HomepageRequestMessage extends HttpRequestMessage {}
