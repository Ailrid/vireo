import { request } from '../request'
import { Result } from 'ts-results'
import {
  ArtistAlbumRequest,
  ArtistMVRequest,
  ArtistSongRequest,
  ArtistSubRequest,
  ArtistSublistRequest,
  ArtistDetailtRequest
} from './types'
import {
  ArtistAlbumResponse,
  ArtistMVResponse,
  ArtistSongResponse,
  ArtistSublistResponse,
  ArtistDetailtResponse
} from './types'

//-----------------------artist_album---------------------------------------------------

/**
 * @description: 歌手专辑列表
 */
export async function artistAlbum(
  params: ArtistAlbumRequest
): Promise<Result<ArtistAlbumResponse, string>> {
  return await request<ArtistAlbumResponse, ArtistAlbumRequest>('/api/netease/artist/album', params)
}
//-----------------------artist_mv---------------------------------------------------

/**
 * @description: 歌手MV列表
 */
export async function artistMv(params: ArtistMVRequest): Promise<Result<ArtistMVResponse, string>> {
  return await request<ArtistMVResponse, ArtistMVRequest>('/api/netease/artist/mv', params)
}
//-----------------------artist_song---------------------------------------------------
/**
 * @description: 歌手MV列表
 */
export async function artistSong(
  params: ArtistSongRequest
): Promise<Result<ArtistSongResponse, string>> {
  return await request<ArtistSongResponse, ArtistSongRequest>('/api/netease/artist/songs', params)
}
//-----------------------artist_sub---------------------------------------------------

/**
 * @description: 收藏/取消收藏歌手
 */
export async function artistSub(params: ArtistSubRequest): Promise<Result<unknown, string>> {
  return await request<unknown, ArtistSubRequest>('/api/netease/artist/sub', params)
}
//-----------------------artist_sublist---------------------------------------------------

/**
 * @description: 已收藏的歌手列表
 */
export async function artistSublist(
  params: ArtistSublistRequest
): Promise<Result<ArtistSublistResponse, string>> {
  return await request<ArtistSublistResponse, ArtistSublistRequest>(
    '/api/netease/artist/sublist',
    params
  )
}
//-----------------------artist_detail---------------------------------------------------

/**
 * @description: 歌手信息
 */
export async function artistDetail(
  params: ArtistDetailtRequest
): Promise<Result<ArtistDetailtResponse, string>> {
  return await request<ArtistDetailtResponse, ArtistDetailtRequest>(
    '/api/netease/artist/detail',
    params
  )
}
