import { createRequest, CryptoMode } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { ArtistMvRequestMessage } from '../message'
import { type ArtistMvRequest, type ArtistMvResponse } from '../types'

export class ArtistMvsSystem {
  @HttpSystem({
    messageClass: ArtistMvRequestMessage
  })
  public static async getArtistMvs(
    @Body() body: ArtistMvRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id: artistId, limit = 30, offset = 0 } = body

    const answer = await createRequest(CryptoMode.weapi, {
      url: '/artist/mvs/',
      data: {
        artistId,
        limit,
        offset,
        total: true
      },
      cookies,
      headers
    })

    return Ok(answer.data as ArtistMvResponse)
  }
}
