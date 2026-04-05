import { createRequest, CryptoMode, type ArtistInfo, type AlbumInfo } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { ArtistAlbumRequestMessage } from '../message'
import { type ArtistAlbumRequest, type ArtistAlbumResponse } from '../types'

export class ArtistAlbumsSystem {
  @HttpSystem({
    messageClass: ArtistAlbumRequestMessage
  })
  public static async getArtistAlbums(
    @Body() body: ArtistAlbumRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { id, limit = 50, offset = 0 } = body

    const answer = await createRequest(CryptoMode.weapi, {
      url: `/artist/albums/${id}`,
      data: {
        limit,
        offset,
        total: true
      },
      cookies,
      headers
    })
    const rawData = answer.data as RawArtistAlbumResponse
    // 1. 转换歌手基础信息
    const artist: ArtistInfo = {
      id: rawData.artist.id,
      name: rawData.artist.name,
      description: rawData.artist.briefDesc,
      avatar: rawData.artist.picUrl || rawData.artist.img1v1Url,
      alias: rawData.artist.alias || [],
      albumSize: rawData.artist.albumSize,
      songSize: rawData.artist.musicSize
    }

    // 转换专辑列表
    const hotAlbums: AlbumInfo[] = (rawData.hotAlbums || []).map(album => ({
      id: album.id,
      name: album.name,
      cover: album.picUrl,
      publishTime: album.publishTime,
      songCount: album.size,
      // 将原始的 artists 阵列简化为 id 和 name
      artists: (album.artists || []).map(ar => ({
        id: ar.id,
        name: ar.name
      })),
      company: album.company,
      description: album.description || album.briefDesc
    }))

    return Ok({
      code: 200,
      artist,
      hotAlbums,
      more: rawData.more || false
    } as ArtistAlbumResponse)
  }
}
/**
 * * 歌手专辑里的歌手信息
 */
interface RawArtistAlbumArtist {
  img1v1Url: string
  followed: boolean
  musicSize: number
  albumSize: number
  briefDesc: string
  picUrl: string
  trans: string
  alias: string[]
  name: string
  id: number
  [key: string]: any
}
/**
 * * 歌手专辑里的热门专辑
 */
interface RawArtistHotAlbum {
  artists: {
    img1v1Url: string
    followed: boolean
    musicSize: number
    albumSize: number
    briefDesc: string
    picUrl: string
    trans: string
    alias: string[]
    name: string
    id: number
    [key: string]: any
  }[]
  artist: {
    img1v1Url: string
    followed: boolean
    musicSize: number
    albumSize: number
    briefDesc: string
    picUrl: string
    trans: string
    alias: string[]
    name: string
    id: number
    [key: string]: any
  }
  briefDesc: string
  publishTime: number
  company: string
  picUrl: string
  blurPicUrl: string
  subType: string
  alias: string[]
  description: string
  tags: string
  name: string
  id: number
  type: string
  size: number
  isSub: boolean
  [key: string]: any
}

/**
 * * 歌手专辑列表
 */
interface RawArtistAlbumResponse {
  artist: RawArtistAlbumArtist
  hotAlbums: RawArtistHotAlbum[]
  more: boolean
  code: number
}