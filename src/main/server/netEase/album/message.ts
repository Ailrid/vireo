import { HttpRoute, HttpRequestMessage } from '@virid/express'

@HttpRoute({
  path: '/netease/albums/detail',
  method: 'post'
})
export class AlbumDetailRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/albums/sub',
  method: 'post'
})
export class AlbumSubRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/albums/sublist',
  method: 'post'
})
export class AlbumSublistRequestMessage extends HttpRequestMessage {}

@HttpRoute({
  path: '/netease/albums/wiki',
  method: 'post'
})
export class AlbumWikiRequestMessage extends HttpRequestMessage {}
