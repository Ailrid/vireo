import { createRequest, CryptoMode } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { PlaylistUpdateRequestMessage } from '../message'
import { type PlaylistUpdateRequest } from '../types'

export class PlaylistUpdateSystem {
  @HttpSystem({
    messageClass: PlaylistUpdateRequestMessage
  })
  public static async updatePlaylist(
    @Body() body: PlaylistUpdateRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id, name, desc, tags = '' } = body

    const data = {
      '/api/playlist/desc/update': JSON.stringify({ id, desc }),
      '/api/playlist/tags/update': JSON.stringify({ id, tags }),
      '/api/playlist/update/name': JSON.stringify({ id, name })
    }

    const answer = await createRequest(CryptoMode.weapi, {
      url: '/batch',
      data,
      cookies,
      headers
    })

    return Ok({
      code: answer.data?.code || answer.status,
      message: 'Playlist updated successfully',
      // 如果想看细节，可以把 answer.data 返回回去
      details: answer.data
    })
  }
}
