import { request } from '../request'
import { Result } from 'ts-results'
import {
  CommentRequest,
  MvDetailRequest,
  MvUrlRequest,
  UgcRequest,
  IntelligenceRequest
} from './types'
import {
  MvDetailResponse,
  MvUrlResponse,
  PersonalFmResponse,
  RecommendPlaylistResponse,
  RecommendSongResponse,
  VipInfoResponse,
  IntelligenceResponse
} from './types'
//-----------------------comment---------------------------------------------------
/**
 * @description: 评论
 */
export async function comment(params: CommentRequest): Promise<Result<unknown, string>> {
  return await request<unknown, CommentRequest>('/api/netease/comments', params)
}

//-----------------------mv_detail---------------------------------------------------
/**
 * @description: MV详情
 */
export async function mvDetail(params: MvDetailRequest): Promise<Result<MvDetailResponse, string>> {
  return await request<MvDetailResponse, MvDetailRequest>('/api/netease/mv', params)
}
//-----------------------mv_url---------------------------------------------------
/**
 * @description: MV链接
 */
export async function mvUrl(params: MvUrlRequest): Promise<Result<MvUrlResponse, string>> {
  return await request<MvUrlResponse, MvUrlRequest>('/api/netease/mv/url', params)
}
//-----------------------personal_fm---------------------------------------------------
/**
 * @description: personal_fm模式
 */
export async function personalFm(): Promise<Result<PersonalFmResponse, string>> {
  return await request<PersonalFmResponse, object>('/api/netease/fm', {})
}
//-----------------------recommend_playlist---------------------------------------------------
/**
 * @description: 推荐歌单
 */
export async function recommendPlaylist(): Promise<Result<RecommendPlaylistResponse, string>> {
  return await request<RecommendPlaylistResponse, object>('/api/netease/recommend/playlists', {})
}
//-----------------------recommend_song---------------------------------------------------
/**
 * @description: 每日推荐
 */
export async function recommendSong(): Promise<Result<RecommendSongResponse, string>> {
  return await request<RecommendSongResponse, object>('/api/netease/recommend/song', {})
}
//-----------------------ugc_album_get---------------------------------------------------
/**
 * @description: 专辑百科
 */
export async function ugcAlbum(): Promise<Result<UgcRequest, string>> {
  return await request<UgcRequest, object>('/api/netease/album/wiki', {})
}
//-----------------------intelligence---------------------------------------------------
/**
 * @description: 心动模式
 */
export async function intelligence(
  params: IntelligenceRequest
): Promise<Result<IntelligenceResponse, string>> {
  return await request<IntelligenceResponse, IntelligenceRequest>(
    '/api/netease/playmode/intelligence/list',
    params
  )
}
//-----------------------vip_info---------------------------------------------------
/**
 * @description: vip信息
 */
export async function vipInfo(): Promise<Result<VipInfoResponse, string>> {
  return await request<VipInfoResponse, object>('/api/netease/vip', {})
}
