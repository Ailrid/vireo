import { createRequest, CryptoMode, getSongDetail, type ArtistInfo } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { ArtistDetailRequestMessage } from '../message'
import { type ArtistDetailRequest, type ArtistDetailResponse } from '../types'

export class ArtistDetailSystem {
  @HttpSystem({
    messageClass: ArtistDetailRequestMessage
  })
  public static async getArtistDetail(
    @Body() body: ArtistDetailRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id } = body

    // 1. 获取歌手原始详情
    const answer = await createRequest(CryptoMode.weapi, {
      url: `/v1/artist/${id}`,
      data: {},
      cookies,
      headers
    })

    const rawData = answer.data as RawArtistDetailResponse
    const rawArtist = rawData.artist

    // 转换歌手基础信息
    const artist: ArtistInfo = {
      id: rawArtist.id,
      name: rawArtist.name,
      avatar: rawArtist.picUrl || rawArtist.img1v1Url,
      alias: rawArtist.alias || [],
      albumSize: rawArtist.albumSize,
      musicSize: rawArtist.musicSize,
      mvSize: rawArtist.mvSize
    }

    const hotSongIds = (rawData.hotSongs || []).map(s => s.id)
    const formattedHotSongs = await getSongDetail(hotSongIds, cookies, headers)

    return Ok({
      code: 200,
      artist,
      hotSongs: formattedHotSongs,
      more: rawData.more || false
    } as ArtistDetailResponse)
  }
}

/**
 * * 歌手的详细信息
 */
interface RawArtistDetail {
  musicSize: number
  albumSize: number
  briefDesc: string
  picUrl: string
  img1v1Url: string
  followed: boolean
  trans: string
  alias: string[]
  name: string
  id: number
  publishTime: number
  transNames: string[]
  mvSize: number
  [key: string]: any
}
/**
 * * 歌手的热门专辑信息
 */
interface RawArtistHotSong {
  rtUrls: []
  ar: {
    id: number
    name: string
    tns: string[]
    alia: string[]
    [key: string]: any
  }[]
  al: {
    id: number
    name: string
    tns: string[]
    [key: string]: any
  }
  mv: number
  alia: string[]
  dt: number
  name: string
  id: number
  videoInfo: {
    moreThanOne: boolean
    video: {
      vid: string
      title: string
      playTime: number
      coverUrl: string
      publishTime: number
      [key: string]: any
    }
    [key: string]: any
  }
  tns: string[]
  privilege: {
    id: number
    [key: string]: any
  }
  [key: string]: any
}
/**
 * * 歌手信息
 */
interface RawArtistDetailResponse {
  artist: RawArtistDetail
  hotSongs: RawArtistHotSong[]
  more: boolean
  code: number
}
