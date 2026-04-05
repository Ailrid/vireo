import { createRequest, CryptoMode, type AlbumInfo } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { AlbumSublistRequestMessage } from '../message'
import { type AlbumSublistRequest, type AlbumSublistResponse } from '../types'

export class AlbumSublistSystem {
  @HttpSystem({
    messageClass: AlbumSublistRequestMessage
  })
  public static async getSublist(
    @Body() body: AlbumSublistRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { limit = 25, offset = 0 } = body

    const answer = await createRequest(CryptoMode.weapi, {
      url: '/album/sublist',
      data: {
        limit,
        offset,
        total: true
      },
      cookies,
      headers
    })
    const rawData = answer.data as RawAlbumSublistResponse

    // 转化为标准的 AlbumInfo
    const formattedData: AlbumInfo[] = (rawData.data || []).map(item => ({
      id: item.id,
      name: item.name,
      cover: item.picUrl, // 映射到标准字段 cover
      publishTime: item.publishTime || 0,
      songCount: item.size,
      // 提取极简歌手信息
      artists: (item.artists || []).map(ar => ({
        id: ar.id,
        name: ar.name
      })),
      description: item.msg || item.description || ''
    }))

    return Ok({
      code: 200,
      data: formattedData,
      count: rawData.count || 0,
      hasMore: rawData.hasMore || false
    } as AlbumSublistResponse)
  }
}

/**
 * * 专辑信息
 */
interface RawAlbumInfo {
  artists: [
    {
      img1v1Url: string
      followed: boolean
      trans: string
      alias: string[]
      name: string
      id: number
      [key: string]: any
    }
  ]
  picUrl: string
  alias: string[]
  name: string
  id: number
  size: number
  [key: string]: any
}

/**
 * * 用户收藏的专辑列表信息
 */
interface RawAlbumSublistResponse {
  data: RawAlbumInfo[]
  count: number
  hasMore: boolean
  code: number
  [key: string]: any
}
