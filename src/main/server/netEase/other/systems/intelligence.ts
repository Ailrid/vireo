import {
  createRequest,
  CryptoMode,
  type RawSongDetailResponse,
  convertSongDetail,
  getSongDetail
} from '../../utils'
import { Body, Cookies, Headers, HttpSystem, InternalServerError, Ok } from '@virid/express'
import { IntelligenceModeRequestMessage } from '../message'
import { type IntelligenceRequest, type IntelligenceResponse } from '../types'

export class IntelligenceListSystem {
  @HttpSystem({
    messageClass: IntelligenceModeRequestMessage
  })
  public static async getIntelligenceList(
    @Body() body: IntelligenceRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id, pid, sid, count = 1 } = body

    // 获取心动模式的原始索引列表
    const listAnswer = await createRequest(CryptoMode.weapi, {
      url: '/playmode/intelligence/list',
      data: {
        songId: id,
        playlistId: pid,
        startMusicId: sid || id,
        count: count,
        type: 'fromPlayOne'
      },
      cookies,
      headers
    })
    if (!listAnswer.data.data) return InternalServerError(JSON.stringify(listAnswer.data))
    // 提取歌曲 ID 列表
    const tracksID = listAnswer.data.data.map((item: any) => item.id || item.songInfo.id)
    const formattedSongs = await getSongDetail(tracksID, cookies, headers)
    return Ok({
      code: 200,
      songs: formattedSongs,
      message: listAnswer.data.message
    } as IntelligenceResponse)
  }
}
