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
//-----------------------song_detail---------------------------------------------------
/**
 * @description: 音乐详情
 */
export interface SongDetailRequest {
  ids: { id: number }[]
}
