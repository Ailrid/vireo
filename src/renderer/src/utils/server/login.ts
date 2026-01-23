import { request } from './request'
import { Result } from 'ts-results'
import { LoginQrCreateRequest, LoginQrCheckRequest } from './types/request/login'
import {
  LoginQrCreateResponse,
  LoginQrKeyResponse,
  LoginQrCheckResponse
} from './types/response/login'
//-----------------------login_qr_check---------------------------------------------------
/**
 * @description: 登陆检查
 */
export async function login_qr_check(
  params: LoginQrCheckRequest
): Promise<Result<LoginQrCheckResponse, string>> {
  return await request<LoginQrCheckResponse, LoginQrCheckRequest>(
    '/api/net_ease/login/qr/check',
    params
  )
}
//-----------------------login_qr_create---------------------------------------------------
/**
 * @description: 登陆检查
 */
export async function login_qr_create(
  params: LoginQrCreateRequest
): Promise<Result<LoginQrCreateResponse, string>> {
  return await request<LoginQrCreateResponse, LoginQrCreateRequest>(
    '/api/net_ease/login/qr/create',
    params
  )
}
//-----------------------login_qr_key---------------------------------------------------
/**
 * @description: 登陆检查
 */
export async function login_qr_key(): Promise<Result<LoginQrKeyResponse, string>> {
  return await request<LoginQrKeyResponse, object>('/api/login/qrcode/key', {})
}
//-----------------------login_status---------------------------------------------------
/**
 * @description: 登陆状态
 */
export async function login_status(): Promise<Result<any, string>> {
  return await request<any, any>('/api/login/status', {})
}
