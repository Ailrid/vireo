import { createRequest, CryptoMode, type PlaylistInfo } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { PlaylistCreateRequestMessage } from '../message'
import { type PlaylistCreateRequest, type PlaylistCreateResponse } from '../types'

export class PlaylistCreateSystem {
  @HttpSystem({
    messageClass: PlaylistCreateRequestMessage
  })
  public static async createPlaylist(
    @Body() body: PlaylistCreateRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const {
      name,
      privacy = 0, // 0: 普通, 10: 隐私
      type = 'NORMAL' // NORMAL, VIDEO, SHARED
    } = body

    const answer = await createRequest(CryptoMode.weapi, {
      url: '/playlist/create',
      data: {
        name,
        privacy,
        type
      },
      cookies,
      headers
    })
    const raw = (answer.data?.playlist || {}) as RawPlaylistInfo

    // 映射到标准 PlaylistInfo 接口
    const newPlaylist: PlaylistInfo = {
      id: raw.id,
      name: raw.name,
      cover: raw.coverImgUrl,
      description: '',
      songCount: 0,
      playCount: 0,
      createTime: raw.createTime,
      creator: {
        id: raw.userId,
        name: '',
        avatar: ''
      }
    }

    return Ok({
      code: 200,
      playlist: newPlaylist
    } as PlaylistCreateResponse)
  }
}

interface RawPlaylistInfo {
  userId: number
  updateTime: number
  coverImgUrl: string
  createTime: number
  name: string
  id: number
}
