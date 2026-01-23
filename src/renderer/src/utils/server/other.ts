import { request } from './request'
import { Result } from 'ts-results'
import {
  CommentRequest,
  LyricRequest,
  MvDetailRequest,
  MvUrlRequest,
  UgcRequest,
  IntelligenceRequest
} from './types/request/other'
import {
  MvDetailResponse,
  MvUrlResponse,
  PersonalFmResponse,
  RecommendPlaylistResponse,
  RecommendSongResponse,
  VipInfoResponse,
  IntelligenceResponse
} from './types/response/other'
//-----------------------comment---------------------------------------------------
/**
 * @description: 评论
 */
export async function comment(params: CommentRequest): Promise<Result<unknown, string>> {
  return await request<unknown, CommentRequest>('/api/net_ease/comments', params)
}
//-----------------------lyric_new---------------------------------------------------
/**
 * @description: 歌词
 */
export async function lyric(params: LyricRequest): Promise<Result<any, string>> {
  return await request<any, LyricRequest>('/api/net_ease/lyric', params)
}
//-----------------------mv_detail---------------------------------------------------
/**
 * @description: MV详情
 */
export async function mv_detail(
  params: MvDetailRequest
): Promise<Result<MvDetailResponse, string>> {
  return await request<MvDetailResponse, MvDetailRequest>('/api/net_ease/mv', params)
}
//-----------------------mv_url---------------------------------------------------
/**
 * @description: MV链接
 */
export async function mv_url(params: MvUrlRequest): Promise<Result<MvUrlResponse, string>> {
  return await request<MvUrlResponse, MvUrlRequest>('/api/net_ease/mv/url', params)
}
//-----------------------personal_fm---------------------------------------------------
/**
 * @description: personal_fm模式
 */
export async function personal_fm(): Promise<Result<PersonalFmResponse, string>> {
  return await request<PersonalFmResponse, object>('/api/net_ease/fm', {})
}
//-----------------------recommend_playlist---------------------------------------------------
/**
 * @description: 推荐歌单
 */
export async function recommend_playlist(): Promise<Result<RecommendPlaylistResponse, string>> {
  return await request<RecommendPlaylistResponse, object>('/api/net_ease/recommend/playlists', {})
}
//-----------------------recommend_song---------------------------------------------------
/**
 * @description: 每日推荐
 */
export async function recommend_song(): Promise<Result<RecommendSongResponse, string>> {
  return await request<RecommendSongResponse, object>('/api/net_ease/recommend/song', {})
}
//-----------------------ugc_album_get---------------------------------------------------
/**
 * @description: 专辑百科
 */
export async function ugc_album(): Promise<Result<UgcRequest, string>> {
  return await request<UgcRequest, object>('/api/net_ease/album/wiki', {})
}
//-----------------------intelligence---------------------------------------------------
/**
 * @description: 心动模式
 */
export async function intelligence(
  params: IntelligenceRequest
): Promise<Result<IntelligenceResponse, string>> {
  return await request<IntelligenceResponse, IntelligenceRequest>(
    '/api/net_ease/playmode/intelligence/list',
    params
  )
}
//-----------------------vip_info---------------------------------------------------
/**
 * @description: vip信息
 */
export async function vip_info(): Promise<Result<VipInfoResponse, string>> {
  return await request<VipInfoResponse, object>('/api/net_ease/vip', {})
}
