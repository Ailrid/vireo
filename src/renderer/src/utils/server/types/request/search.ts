//-----------------------search_suggets---------------------------------------------------
/**
 * @description:搜索建议
 */
export interface SearchSuggestRequest {
  keywords: string
  type: 'mobile' | null
}

//-----------------------search---------------------------------------------------
/**
 * @description:搜索
 * {1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频}
 */
export interface SearchRequest {
  keywords: string
  type: number
}

/**
 * @description:  {1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频}
 */
export enum SearchType {
  Song = 1,
  Album = 10,
  Singer = 100,
  Playlist = 1000,
  User = 1002,
  MV = 1004,
  Lyric = 1006
}
