import { createRequest, CryptoMode } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { AlbumWikiRequestMessage } from '../message'
import { type AlbumWikiRequest } from '../types'

export class AlbumWikiSystem {
  @HttpSystem({
    messageClass: AlbumWikiRequestMessage
  })
  public static async getAlbumWiki(
    @Body() body: AlbumWikiRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id } = body

    // 这个接口比较特殊，url 是 /rep/ugc/album/get，必须用 eapi
    const answer = await createRequest(CryptoMode.eapi, {
      url: '/rep/ugc/album/get',
      data: {
        albumId: id
      },
      cookies,
      headers
    })

    // 返回百科数据
    return Ok(answer.data)
  }
}
