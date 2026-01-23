import { request } from './request'
import { Result } from 'ts-results'
import {
  PlaylistCreateRequest,
  PlaylistDeleteRequest,
  PlaylistDetailRequest,
  PlaylistOrderRequest,
  PlaylistTracksRequest,
  PlaylistUpdateRequest
} from './types/request/playlist'
import { PlaylistCreateResponse, PlaylistDetailResponse } from './types/response/playlist' //-----------------------playlist_create---------------------------------------------------
/**
 * @description: 创建歌单
 */
export async function playlist_create(
  params: PlaylistCreateRequest
): Promise<Result<PlaylistCreateResponse, string>> {
  return await request<PlaylistCreateResponse, PlaylistCreateRequest>(
    '/api/net_ease/playlist/create',
    params
  )
}
//-----------------------playlist_delete---------------------------------------------------

/**
 * @description: 歌单详细
 */
export async function playlist_delete(
  params: PlaylistDeleteRequest
): Promise<Result<unknown, string>> {
  return await request<unknown, PlaylistDeleteRequest>('/api/net_ease/playlist/delete', params)
}
//-----------------------playlist_detail---------------------------------------------------

/**
 * @description: 歌单详细
 */
export async function playlist_detail(
  params: PlaylistDetailRequest
): Promise<Result<PlaylistDetailResponse, string>> {
  return await request<PlaylistDetailResponse, PlaylistDetailRequest>(
    '/api/net_ease/playlist/detail',
    params
  )
}
//-----------------------playlist_order---------------------------------------------------

/**
 * @description: 歌单详细
 */
export async function playlist_order(
  params: PlaylistOrderRequest
): Promise<Result<unknown, string>> {
  return await request<unknown, PlaylistOrderRequest>('/api/net_ease/playlist/order/update', params)
}
//-----------------------playlist_tracks---------------------------------------------------

/**
 * @description: 收藏单曲到歌单 从歌单删除歌曲
 */
export async function playlist_tracks(
  params: PlaylistTracksRequest
): Promise<Result<unknown, string>> {
  return await request<unknown, PlaylistTracksRequest>('/api/net_ease/playlist/tracks', params)
}
//-----------------------playlist_update---------------------------------------------------

/**
 * @description: 更新歌单描述、名字等
 */
export async function playlist_update(
  params: PlaylistUpdateRequest
): Promise<Result<unknown, string>> {
  return await request<unknown, PlaylistUpdateRequest>('/api/net_ease/playlist/update', params)
}
