import { request } from '../request'
import { Result } from 'ts-results'
import { AlbumSublistRequest, AlbumDetailRequest, AlbumSubRequest } from './types'
import { AlbumSublistResponse, AlbumDetailResponse } from './types'

//-----------------------alibum_detail---------------------------------------------------
/**
 * @description: 专辑详情
 */
export async function alibumDetail(
  params: AlbumDetailRequest
): Promise<Result<AlbumDetailResponse, string>> {
  return await request<AlbumDetailResponse, AlbumDetailRequest>('/api/netease/album/detail', params)
}

//-----------------------alibum_sub---------------------------------------------------
/**
 * @description: 收藏/取消收藏专辑
 */
export async function alibumSub(params: AlbumSubRequest): Promise<Result<unknown, string>> {
  return await request<unknown, AlbumSubRequest>('/api/netease/album/sub', params)
}

//-----------------------alibum_sublist---------------------------------------------------
/**
 * @description: 用户收藏的专辑列表
 */
export async function alibumSublist(
  params: AlbumSublistRequest
): Promise<Result<AlbumSublistResponse, string>> {
  return await request<AlbumSublistResponse, AlbumSublistRequest>(
    '/api/netease/album/sublist',
    params
  )
}
