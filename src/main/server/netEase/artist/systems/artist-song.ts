import {
  createRequest,
  CryptoMode,
  getSongDetail
} from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { ArtistSongsRequestMessage } from '../message'
import { type ArtistSongRequest, type ArtistSongResponse } from '../types'

export class ArtistSongsSystem {
  @HttpSystem({
    messageClass: ArtistSongsRequestMessage
  })
  public static async getArtistSongs(
    @Body() body: ArtistSongRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id, order = 'hot', limit = 100, offset = 0 } = body

    // 获取歌手歌曲索引
    const listAnswer = await createRequest(CryptoMode.eapi, {
      url: '/v1/artist/songs',
      data: {
        id,
        private_cloud: 'true',
        work_type: 1,
        order,
        offset,
        limit
      },
      cookies,
      headers
    })

    const rawSongs = listAnswer.data?.songs || []
    if (rawSongs.length === 0) {
      return Ok({
        code: 200,
        songs: [],
        total: 0,
        more: false
      } as ArtistSongResponse)
    }

    const tracksID = rawSongs.map((item: any) => item.id)
    const formattedSongs = await getSongDetail(tracksID, cookies, headers)

    return Ok({
      code: 200,
      songs: formattedSongs,
      total: listAnswer.data.total || 0,
      more: listAnswer.data.more || false
    } as ArtistSongResponse)
  }
}
