import { request } from './request'
import { Result } from 'ts-results'
import {
  ArtistAlbumRequest,
  ArtistMVRequest,
  ArtistSongRequest,
  ArtistSubRequest,
  ArtistSublistRequest,
  ArtistDetailtRequest
} from './types/request/artist'
import {
  ArtistAlbumResponse,
  ArtistMVResponse,
  ArtistSongResponse,
  ArtistSublistResponse,
  ArtistDetailtResponse
} from './types/response/artist'

//-----------------------artist_album---------------------------------------------------

/**
 * @description: 歌手专辑列表
 */
export async function artist_album(
  params: ArtistAlbumRequest
): Promise<Result<ArtistAlbumResponse, string>> {
  return await request<ArtistAlbumResponse, ArtistAlbumRequest>(
    '/api/net_ease/artist/album',
    params
  )
}
//-----------------------artist_mv---------------------------------------------------

/**
 * @description: 歌手MV列表
 */
export async function artist_mv(
  params: ArtistMVRequest
): Promise<Result<ArtistMVResponse, string>> {
  return await request<ArtistMVResponse, ArtistMVRequest>('/api/net_ease/artist/mv', params)
}
//-----------------------artist_song---------------------------------------------------
/**
 * @description: 歌手MV列表
 */
export async function artist_song(
  params: ArtistSongRequest
): Promise<Result<ArtistSongResponse, string>> {
  return await request<ArtistSongResponse, ArtistSongRequest>('/api/net_ease/artist/songs', params)
}
//-----------------------artist_sub---------------------------------------------------

/**
 * @description: 收藏/取消收藏歌手
 */
export async function artist_sub(params: ArtistSubRequest): Promise<Result<unknown, string>> {
  return await request<unknown, ArtistSubRequest>('/api/net_ease/artist/sub', params)
}
//-----------------------artist_sublist---------------------------------------------------

/**
 * @description: 已收藏的歌手列表
 */
export async function artist_sublist(
  params: ArtistSublistRequest
): Promise<Result<ArtistSublistResponse, string>> {
  return await request<ArtistSublistResponse, ArtistSublistRequest>(
    '/api/net_ease/artist/sublist',
    params
  )
}
//-----------------------artist_detail---------------------------------------------------

/**
 * @description: 歌手信息
 */
export async function artist_detail(
  params: ArtistDetailtRequest
): Promise<Result<ArtistDetailtResponse, string>> {
  return await request<ArtistDetailtResponse, ArtistDetailtRequest>(
    '/api/net_ease/artist/detail',
    params
  )
}
