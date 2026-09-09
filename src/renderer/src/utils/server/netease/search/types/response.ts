import {
  type AlbumInfo,
  type ArtistInfo,
  type SongDetail,
  type PlaylistInfo
} from '../../../interfaces'
import { SearchType } from './request'
/**
 * *搜索建议
 */
export interface SearchSuggestResponse {
  result: {
    albums: AlbumInfo[]
    artists: ArtistInfo[]
    songs: SongDetail[]
    playlists: PlaylistInfo[]
    order: string[]
  }
  code: number
}

export interface SearchSongItem extends SongDetail {
  // 搜索歌词时特有，展示匹配片段
  lyricSnippet?: string
}

export interface UserInfo {
  id: number
  name: string
  avatar: string
  signature: string
  gender: number // 0: 保密, 1: 男, 2: 女
  isVip: boolean
}
export interface MvInfo {
  id: number
  name: string
  cover: string
  artistName: string
  artistId: number
  duration: number
  playCount: number
}
/**
 * 统一的搜索响应结构
 */
export interface SearchResponse<T> {
  code: number
  items: T[]
  total: number
  hasMore: boolean
}

export interface SearchResultMap {
  [SearchType.Song]: SearchResponse<SongDetail>
  [SearchType.Album]: SearchResponse<AlbumInfo>
  [SearchType.Artist]: SearchResponse<ArtistInfo>
  [SearchType.Playlist]: SearchResponse<PlaylistInfo>
  [SearchType.User]: SearchResponse<UserInfo>
  [SearchType.Mv]: SearchResponse<MvInfo>
  [SearchType.Lyric]: SearchResponse<SongDetail>
}
