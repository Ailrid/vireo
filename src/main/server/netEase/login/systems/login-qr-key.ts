import { createRequest, CryptoMode } from '../../utils'
import { Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { LoginQrKeyRequestMessage } from '../message'
import { type LoginQrKeyResponse } from '../types'

export class LoginQrKeySystem {
  @HttpSystem({
    messageClass: LoginQrKeyRequestMessage
  })
  public static async getQrKey(
    @Headers() headers: Record<string, string>,
    @Cookies() cookies: Record<string, string>
  ) {
    // 网易云扫码 key 接口通常固定 type: 3
    const answer = await createRequest(CryptoMode.eapi, {
      url: '/login/qrcode/unikey',
      data: {
        type: 3
      },
      cookies,
      headers
    })

    return Ok(answer.data as LoginQrKeyResponse, {
      'Set-Cookies': answer.cookies
    })
  }
}
