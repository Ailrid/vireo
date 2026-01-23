//-----------------------comment---------------------------------------------------
/**
 * @description: MV详情
 */
export interface CommentRequest {
  id: number
  t: 'add' | 'delete' | 'reply'
  content: string
  commentId: number | null
}
//-----------------------lyric_new---------------------------------------------------
/**
 * @description: MV详情
 */
export interface LyricRequest {
  id: number
}
//-----------------------mv_detail---------------------------------------------------
/**
 * @description: MV详情
 */
export interface MvDetailRequest {
  id: number
}
//-----------------------mv_detail---------------------------------------------------
/**
 * @description: MV链接
 */
export interface MvUrlRequest {
  id: number
}
//-----------------------ugc_album---------------------------------------------------
/**
 * @description: MV链接
 */
export interface UgcRequest {
  id: number
}
//-----------------------intelligence---------------------------------------------------
/**
 * @description: 心动模式
 */
export interface IntelligenceRequest {
  id: number
  pid: number
  sid: number
}
