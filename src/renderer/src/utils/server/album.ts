import { request } from './request'
import { Result } from 'ts-results'
import { AlbumSublistRequest, AlbumDetailRequest, AlbumSubRequest } from './types/request/album'
import { AlbumSublistResponse, AlbumDetailResponse } from './types/response/album'

//-----------------------alibum_detail---------------------------------------------------
/**
 * @description: 专辑详情
 */
export async function alibum_detail(
  params: AlbumDetailRequest
): Promise<Result<AlbumDetailResponse, string>> {
  return await request<AlbumDetailResponse, AlbumDetailRequest>(
    '/api/net_ease/album/detail',
    params
  )
}

//-----------------------alibum_sub---------------------------------------------------
/**
 * @description: 收藏/取消收藏专辑
 */
export async function alibum_sub(params: AlbumSubRequest): Promise<Result<unknown, string>> {
  return await request<unknown, AlbumSubRequest>('/api/net_ease/album/sub', params)
}

//-----------------------alibum_sublist---------------------------------------------------
/**
 * @description: 用户收藏的专辑列表
 */
export async function alibum_sublist(
  params: AlbumSublistRequest
): Promise<Result<AlbumSublistResponse, string>> {
  return await request<AlbumSublistResponse, AlbumSublistRequest>(
    '/api/net_ease/album/sublist',
    params
  )
}
