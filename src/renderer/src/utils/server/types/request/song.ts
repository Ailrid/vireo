//-----------------------song_comment---------------------------------------------------
/**
 * @description: 音乐评论
 */
export interface SongCommentRequest {
  id: number
  limit: number
  offset: number
  before: number
}
//-----------------------song_detail---------------------------------------------------
/**
 * @description: 音乐详情
 */
export interface SongDetailRequest {
  ids: { id: number }[]
}
//-----------------------song_lick_check---------------------------------------------------
/**
 * @description: 歌曲喜欢检查
 */
export interface SongLikeChechRequest {
  ids: { id: number }[]
}
//-----------------------song_lick--------------------------------------------------
/**
 * @description: 歌曲喜欢/取消喜欢
 */
export interface SongLikeRequest {
  id: number
  like: boolean
}
//-----------------------song_url---------------------------------------------------
/**
 * @description: 歌曲url
 * standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带)
 */
export interface SongUrlRequest {
  ids: { id: number }[]
  level: 'standard' | 'exhigh' | 'lossless' | 'hires' | 'jyeffect' | 'sky' | 'jymaster'
}
