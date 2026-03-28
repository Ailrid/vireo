import { createRequest, CryptoMode, type AlbumDetail, getSongDetail } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { AlbumDetailRequestMessage } from '../message'
import { type AlbumDetailRequest, type AlbumDetailResponse } from '../types'

export class AlbumDetailSystem {
  @HttpSystem({
    messageClass: AlbumDetailRequestMessage
  })
  public static async getAlbumDetail(
    @Body() body: AlbumDetailRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id } = body

    // 1. 获取原始专辑详情
    const albumAnswer = await createRequest(CryptoMode.weapi, {
      url: `/v1/album/${id}`,
      data: { id },
      cookies,
      headers
    })

    const rawData = albumAnswer.data as RawAlbumDetailResponse
    const rawAlbum = rawData.album
    const tracksID = (rawData.songs || []).map(s => s.id)
    const formattedSongs = await getSongDetail(tracksID, cookies, headers)

    const albumDetail: AlbumDetail = {
      id: rawAlbum.id,
      name: rawAlbum.name,
      cover: rawAlbum.picUrl,
      publishTime: rawAlbum.publishTime,
      size: rawAlbum.size,
      // 专辑歌手：统一极简格式
      artists: (rawAlbum.artists || []).map(ar => ({
        id: ar.id,
        name: ar.name
      })),
      description: rawAlbum.description || rawAlbum.briefDesc || '',
      // 详情扩展字段
      songsIds: formattedSongs.map(s => s.id),
      commentCount: rawAlbum.info?.commentCount || 0,
      shareCount: rawAlbum.info?.shareCount || 0,
      isSubscribed: rawAlbum.info?.isSubscribed || false
    }

    // 返回干净的 Response
    return Ok({
      code: 200,
      album: albumDetail,
      songs: formattedSongs
    } as AlbumDetailResponse)
  }
}

//-----------------------album---------------------------------------------------
/**
 * * 专辑的详细详情
 */
export interface RawAlbumDetail {
  artists: {
    img1v1Url: string
    followed: boolean
    trans: string
    alias: string[]
    name: string
    id: number
    [key: string]: any
  }[]
  artist: {
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
    [key: string]: any
  }
  briefDesc: string
  publishTime: number
  picUrl: string
  blurPicUrl: string
  subType: string
  alias: string[]
  description: string
  name: string
  id: number
  type: string
  size: number
  info: {
    commentThread: {
      id: string
      resourceInfo: {
        id: number
        userId: number
        name: string
        imgUrl: string
        creator: any
        encodedId: number
        subTitle: string
        webUrl: string
      }
      commentCount: number
      hotCount: number
      resourceId: number
      resourceTitle: string
    }
    [key: string]: any
  }
}
/**
 * * 专辑详情响应
 */

interface RawAlbumSongDetail {
  name: string
  id: number
  ar: {
    id: number
    name: string
    alias: string[]
    [key: string]: any
  }[]
  alia: string[]
  al: {
    id: number
    name: string
    picUrl: string
    [key: string]: any
  }
  dt: number
  [key: string]: any
}
export interface RawAlbumDetailResponse {
  resourceState: boolean
  songs: RawAlbumSongDetail[]
  code: number
  album: RawAlbumDetail
  [key: string]: any
}
