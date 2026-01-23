import { request } from './request'
import { Result } from 'ts-results'
import { UserDetailRequest, UserPlaylistRequest, UserRecordRequest } from './types/request/user'
import {
  UserAccountResponse,
  UserDetailResponse,
  UserPlaylistResponse,
  UserRecordResponse,
  UserSubCountResponse
} from './types/response/user'
//-----------------------user_account---------------------------------------------------

/**
 * @description: 自己的账户详细
 */
export async function user_account(): Promise<Result<UserAccountResponse, string>> {
  return await request<UserAccountResponse, object>('/api/net_ease/user/detail', {})
}
//-----------------------user_detail---------------------------------------------------

/**
 * @description: 用户账户详细信息
 */
export async function user_detail(
  params: UserDetailRequest
): Promise<Result<UserDetailResponse, string>> {
  return await request<UserDetailResponse, UserDetailRequest>('/api/net_ease/user/detail', params)
}
//-----------------------user_playlist---------------------------------------------------

/**
 * @description: 用户歌单信息
 */
export async function user_playlist(
  params: UserPlaylistRequest
): Promise<Result<UserPlaylistResponse, string>> {
  return await request<UserPlaylistResponse, UserPlaylistRequest>(
    '/api/net_ease/user/playlist',
    params
  )
}
//-----------------------user_record--------------------------------------------------
/**
 * @description: 用户最近播放记录返回数据
 * 1: 最近一周, 0: 所有时间
 */
export async function user_record(
  params: UserRecordRequest
): Promise<Result<UserRecordResponse, string>> {
  return await request<UserRecordResponse, UserRecordRequest>('/api/net_ease/user/record', params)
}
//-----------------------user_subcount--------------------------------------------------
/**
 * @description: 用户粉丝
 */
export async function user_subcount(): Promise<Result<UserSubCountResponse, string>> {
  return await request<UserSubCountResponse, object>('/api/net_ease/user/record', {})
}
