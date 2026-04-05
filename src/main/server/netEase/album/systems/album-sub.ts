import { createRequest, CryptoMode } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { AlbumSubRequestMessage } from '../message'
import { type AlbumSubRequest } from '../types'

export class AlbumSubSystem {
  @HttpSystem({
    messageClass: AlbumSubRequestMessage
  })
  public static async subscribeAlbum(
    @Body() body: AlbumSubRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id, type } = body

    // sub -> /api/album/sub, unsub -> /api/album/unsub
    const url = `/album/${type}`

    const answer = await createRequest(CryptoMode.weapi, {
      url,
      data: { id },
      cookies,
      headers
    })
    // 直接返回网易云的原始结果即可（通常是 { code: 200 }）
    return Ok(answer.data)
  }
}
