import { request } from './request'
import { Result } from 'ts-results'
import { SearchSuggestRequest, SearchType } from './types/request/search'
import { SearchSuggestResponse, SearchResultMap } from './types/response/search'
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
// export async function search(params: SearchRequest): Promise<Result<SearchResponse, string>> {
//   return await request<SearchResponse, SearchRequest>('/api/net_ease/search', params)
// }
/**
 * @description: 增强版搜索函数
 */
export async function search<T extends SearchType>(params: {
  keywords: string
  type: T
}): Promise<Result<SearchResultMap[T], string>> {
  // 这里的 SearchResultMap[T] 会根据你传入的 T 自动变成对应的 Response 类型
  return await request<SearchResultMap[T], any>('/api/net_ease/search', params)
}
