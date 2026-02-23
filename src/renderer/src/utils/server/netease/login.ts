import { request } from '../request'
import { Result } from 'ts-results'
import { LoginQrCreateRequest, LoginQrCheckRequest } from './types'
import { LoginQrCreateResponse, LoginQrKeyResponse, LoginQrCheckResponse } from './types'
//-----------------------login_qr_check---------------------------------------------------
/**
 * @description: 登陆检查
 */
export async function loginQrCheck(
  params: LoginQrCheckRequest
): Promise<Result<LoginQrCheckResponse, string>> {
  return await request<LoginQrCheckResponse, LoginQrCheckRequest>(
    '/api/netease/login/qr/check',
    params
  )
}
//-----------------------login_qr_create---------------------------------------------------
/**
 * @description: 登陆检查
 */
export async function loginQrCreate(
  params: LoginQrCreateRequest
): Promise<Result<LoginQrCreateResponse, string>> {
  return await request<LoginQrCreateResponse, LoginQrCreateRequest>(
    '/api/netease/login/qr/create',
    params
  )
}
//-----------------------login_qr_key---------------------------------------------------
/**
 * @description: 登陆检查
 */
export async function loginQrKey(): Promise<Result<LoginQrKeyResponse, string>> {
  return await request<LoginQrKeyResponse, object>('/api/netease/login/qrcode/key', {})
}
//-----------------------login_status---------------------------------------------------
/**
 * @description: 登陆状态
 */
export async function loginStatus(): Promise<Result<any, string>> {
  return await request<any, any>('/api/netease/login/status', {})
}
