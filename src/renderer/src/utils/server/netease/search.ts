import { request } from '../request'
import { Result } from 'ts-results'
import { SearchSuggestRequest, SearchType, SearchRequest } from './types'
import { SearchSuggestResponse, SearchResultMap } from './types'
//-----------------------search_suggets---------------------------------------------------
/**
 * @description:搜索建议
 */
export async function searchSuggets(
  params: SearchSuggestRequest
): Promise<Result<SearchSuggestResponse, string>> {
  return await request<SearchSuggestResponse, SearchSuggestRequest>(
    '/api/netease/search/suggest',
    params
  )
}

//-----------------------search---------------------------------------------------
/**
 * @description: 增强版搜索函数
 */
export async function search<T extends SearchType>(
  params: SearchRequest<T>
): Promise<Result<SearchResultMap[T], string>> {
  // 这里的 SearchResultMap[T] 会根据你传入的 T 自动变成对应的 Response 类型
  return await request<SearchResultMap[T], SearchRequest<T>>('/api/netease/search', params)
}
