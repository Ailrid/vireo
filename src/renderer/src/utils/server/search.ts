import { request } from './request'
import { Result } from 'ts-results'
import { SearchSuggestRequest, SearchRequest } from './types/request/search'
import { SearchSuggestResponse, SearchResponse } from './types/response/search'
//-----------------------search_suggets---------------------------------------------------
/**
 * @description:搜索建议
 */
export async function search_suggets(
  params: SearchSuggestRequest
): Promise<Result<SearchSuggestResponse, string>> {
  return await request<SearchSuggestResponse, SearchSuggestRequest>(
    '/api/net_ease/search/suggest',
    params
  )
}

//-----------------------search---------------------------------------------------
/**
 * @description:搜索
 * {1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频}
 */
export async function search(params: SearchRequest): Promise<Result<SearchResponse, string>> {
  return await request<SearchResponse, SearchRequest>('/api/net_ease/search', params)
}
