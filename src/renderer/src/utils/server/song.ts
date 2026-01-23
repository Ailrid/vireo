import { request } from './request'
import { Result } from 'ts-results'
import {
  SongCommentRequest,
  SongDetailRequest,
  SongLikeChechRequest,
  SongLikeRequest,
  SongUrlRequest
} from './types/request/song'
import {
  SongCommentResponse,
  SongDetailResponse,
  SongLikeCheckResponse,
  SongUrlResponse
} from './types/response/song'
//-----------------------song_comment---------------------------------------------------
/**
 * @description: 音乐评论
 */
export async function song_comment(
  params: SongCommentRequest
): Promise<Result<SongCommentResponse, string>> {
  return await request<SongCommentResponse, SongCommentRequest>(
    '/api/net_ease/song/comments',
    params
  )
}
//-----------------------song_detail---------------------------------------------------
/**
 * @description: 音乐详情
 */
export async function song_detail(
  params: SongDetailRequest
): Promise<Result<SongDetailResponse, string>> {
  return await request<SongDetailResponse, SongDetailRequest>('/api/net_ease/song/detail', params)
}
//-----------------------song_lick_check---------------------------------------------------
/**
 * @description: 歌曲喜欢检查
 */
export async function song_lick_check(
  params: SongLikeChechRequest
): Promise<Result<SongLikeCheckResponse, string>> {
  return await request<SongLikeCheckResponse, SongLikeChechRequest>(
    '/api/net_ease/song/like/check',
    params
  )
}
//-----------------------song_lick--------------------------------------------------
/**
 * @description: 歌曲喜欢/取消喜欢
 */
export async function song_lick(params: SongLikeRequest): Promise<Result<unknown, string>> {
  return await request<unknown, SongLikeRequest>('/api/net_ease/song/like', params)
}
//-----------------------song_url---------------------------------------------------
/**
 * @description: 歌曲url
 * standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带)
 */
export async function song_url(params: SongUrlRequest): Promise<Result<SongUrlResponse, string>> {
  return await request<SongUrlResponse, SongUrlRequest>('/api/net_ease/song/url', params)
}
