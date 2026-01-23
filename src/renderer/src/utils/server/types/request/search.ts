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
