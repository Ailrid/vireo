//-----------------------playlist_create---------------------------------------------------
/**
 * @description: 创建歌单
 */
export interface PlaylistCreateRequest {
  name: string
  privacy: 10 | 0 //0 为普通歌单，10 为隐私歌单
  type: 'NORMAL' | 'VIDEO' | 'SHARED'
}
//-----------------------playlist_delete---------------------------------------------------

/**
 * @description: 歌单详细
 */
export interface PlaylistDeleteRequest {
  id: number
}
//-----------------------playlist_detail---------------------------------------------------

/**
 * @description: 歌单详细
 */
export interface PlaylistDetailRequest {
  id: number
  n: number
}
//-----------------------playlist_order---------------------------------------------------

/**
 * @description: 歌单详细
 */
export interface PlaylistOrderRequest {
  pid: number
  ids: number
}
//-----------------------playlist_tracks---------------------------------------------------

/**
 * @description: 收藏单曲到歌单 从歌单删除歌曲
 */
export interface PlaylistTracksRequest {
  op: 'add' | 'del'
  pid: number
  tracks: { id: number }[]
}
//-----------------------playlist_update---------------------------------------------------

/**
 * @description: 更新歌单描述、名字等
 */
export interface PlaylistUpdateRequest {
  id: number
  desc: string
  name: string
}
