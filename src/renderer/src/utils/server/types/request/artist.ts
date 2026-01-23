//-----------------------artist_album---------------------------------------------------

/**
 * @description: 歌手专辑列表
 */
export interface ArtistAlbumRequest {
  id: number
  limit: number
  offset: number
}
//-----------------------artist_mv---------------------------------------------------
/**
 * @description: 歌手MV列表
 */
export interface ArtistMVRequest {
  id: number
  limit: number
  offset: number
}
//-----------------------artist_song---------------------------------------------------
/**
 * @description: 歌手MV列表
 */
export interface ArtistSongRequest {
  id: number
  limit: number
  order: 'hot' | 'time'
  offset: number
}
//-----------------------artist_sublist---------------------------------------------------

/**
 * @description: 已收藏的歌手列表
 */
export interface ArtistSublistRequest {
  limit: number
  offset: number
}
//-----------------------artist_detail---------------------------------------------------

/**
 * @description: 歌手信息
 */
export interface ArtistDetailtRequest {
  id: number
}
//-----------------------artist_sub---------------------------------------------------

/**
 * @description: 收藏/取消收藏歌手
 */
export interface ArtistSubRequest {
  id: number
  type: 'sub' | 'unsub'
}
