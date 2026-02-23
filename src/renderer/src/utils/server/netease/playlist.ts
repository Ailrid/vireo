import { request } from '../request'
import { Result } from 'ts-results'
import {
  PlaylistCreateRequest,
  PlaylistDeleteRequest,
  PlaylistDetailRequest,
  PlaylistOrderRequest,
  PlaylistTracksRequest,
  PlaylistUpdateRequest
} from './types'
import { PlaylistCreateResponse, PlaylistDetailResponse } from './types' //-----------------------playlist_create---------------------------------------------------
/**
 * @description: 创建歌单
 */
export async function playlistCreate(
  params: PlaylistCreateRequest
): Promise<Result<PlaylistCreateResponse, string>> {
  return await request<PlaylistCreateResponse, PlaylistCreateRequest>(
    '/api/netease/playlist/create',
    params
  )
}
//-----------------------playlist_delete---------------------------------------------------

/**
 * @description: 歌单详细
 */
export async function playlistDelete(
  params: PlaylistDeleteRequest
): Promise<Result<unknown, string>> {
  return await request<unknown, PlaylistDeleteRequest>('/api/netease/playlist/delete', params)
}
//-----------------------playlist_detail---------------------------------------------------

/**
 * @description: 歌单详细
 */
export async function playlistDetail(
  params: PlaylistDetailRequest
): Promise<Result<PlaylistDetailResponse, string>> {
  return await request<PlaylistDetailResponse, PlaylistDetailRequest>(
    '/api/netease/playlist/detail',
    params
  )
}
//-----------------------playlist_order---------------------------------------------------

/**
 * @description: 歌单详细
 */
export async function playlistOrder(
  params: PlaylistOrderRequest
): Promise<Result<unknown, string>> {
  return await request<unknown, PlaylistOrderRequest>('/api/netease/playlist/order/update', params)
}
//-----------------------playlist_tracks---------------------------------------------------

/**
 * @description: 收藏单曲到歌单 从歌单删除歌曲
 */
export async function playlistTracks(
  params: PlaylistTracksRequest
): Promise<Result<unknown, string>> {
  return await request<unknown, PlaylistTracksRequest>('/api/netease/playlist/tracks', params)
}
//-----------------------playlist_update---------------------------------------------------

/**
 * @description: 更新歌单描述、名字等
 */
export async function playlistUpdate(
  params: PlaylistUpdateRequest
): Promise<Result<unknown, string>> {
  return await request<unknown, PlaylistUpdateRequest>('/api/netease/playlist/update', params)
}
