import {
  createRequest,
  CryptoMode,
  type RawSongDetailResponse,
  convertSongDetail,
  getSongDetail
} from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { FmModeRequestMessage } from '../message'
import { type PersonalFmResponse, type PersonalFmRequest } from '../types'

export class PersonalFmSystem {
  @HttpSystem({
    messageClass: FmModeRequestMessage
  })
  public static async getPersonalFm(
    @Body() body: PersonalFmRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id, pid, sid, mode, submode, limit = 3 } = body

    const requestData: Record<string, any> = mode
      ? {
          songId: id,
          playlistId: pid,
          startMusicId: sid || id,
          mode: mode,
          subMode: submode,
          limit: limit
        }
      : {}

    const fmAnswer = await createRequest(mode ? CryptoMode.eapi : CryptoMode.weapi, {
      url: '/v1/radio/get',
      data: requestData,
      cookies,
      headers
    })

    // 提取 ID
    const rawList = fmAnswer.data?.data || []
    const tracksID = rawList.map((item: any) => item.id)
    const formattedSongs = await getSongDetail(tracksID, cookies, headers)

    return Ok({
      code: 200,
      songs: formattedSongs,
      // 透传当前模式，方便前端 UI 逻辑判断
      mode: mode || 'DEFAULT'
    } as PersonalFmResponse)
  }
}
