import {
  createRequest,
  CryptoMode,
  type AlbumInfo,
  type ArtistInfo,
  type PlaylistInfo,
  getSongDetail
} from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { SearchSuggestRequestMessage } from '../message'
import { type SearchSuggestRequest, type SearchSuggestResponse } from '../types'

export class SearchSuggestSystem {
  @HttpSystem({
    messageClass: SearchSuggestRequestMessage
  })
  public static async getSuggest(
    @Body() body: SearchSuggestRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { keywords, type: clientType = 'web' } = body
    const typePath = clientType === 'mobile' ? 'keyword' : 'web'

    const answer = await createRequest(CryptoMode.weapi, {
      url: `/search/suggest/${typePath}`,
      data: { s: keywords || '' },
      cookies,
      headers
    })

    const raw = (answer.data as RawSearchSuggestResponse).result || {}
    const ids = raw.songs?.map((s: any) => s.id) || []
    const songs = await getSongDetail(ids, cookies, headers)

    // Albums
    const albums: AlbumInfo[] = (raw.albums || []).map(al => ({
      id: al.id,
      name: al.name,
      cover: al.artist?.picUrl || '', // 借用歌手图作为临时封面
      publishTime: al.publishTime || 0,
      songCount: al.size || 0,
      artists: al.artist ? [{ id: al.artist.id, name: al.artist.name }] : []
    }))

    // Artists
    const artists: ArtistInfo[] = (raw.artists || []).map(ar => ({
      id: ar.id,
      name: ar.name,
      avatar: ar.img1v1Url || ar.picUrl || '',
      alias: ar.alias || [],
      albumSize: ar.albumSize,
      songSize: ar.musicSize,
      description: ar.briefDesc || ''
    }))

    // Playlists
    const playlists: PlaylistInfo[] = (raw.playlists || []).map(pl => ({
      id: pl.id,
      name: pl.name,
      cover: pl.coverImgUrl,
      creator: {
        id: pl.userId,
        name: '', // 建议接口不带创建者名字
        avatar: ''
      },
      description: pl.description || '',
      songCount: pl.trackCount || 0,
      playCount: pl.playCount || 0,
      createTime: 0
    }))

    return Ok({
      code: 200,
      result: {
        songs,
        albums,
        artists,
        playlists,
        order: raw.order || []
      }
    } as SearchSuggestResponse)
  }
}

export interface RawSearchSuggestResponse {
  result: {
    albums: {
      id: number
      name: string
      artist: {
        id: number
        name: string
        picUrl: string
        alias: string[]
        albumSize: number
        musicSize: number
        alia: string[]
        trans: string
        [key: string]: any
      }
      publishTime: number
      size: number
      transNames: string[]
      [key: string]: any
    }[]
    artists: {
      id: number
      name: string
      picUrl: string
      alias: string[]
      albumSize: number
      musicSize: number
      img1v1Url: string
      alia: string[]
      trans: string
      [key: string]: any
    }[]
    songs: {
      id: number
      name: string
      artists: {
        id: number
        name: string
        img1v1Url: string
        trans: string
        [key: string]: any
      }[]
      album: {
        id: number
        name: string
        artist: {
          img1v1Url: string
          trans: string
          [key: string]: any
        }
        publishTime: number
        size: number
        transNames: string[]
        [key: string]: any
      }
      duration: number
      alias: string[]
      [key: string]: any
    }[]
    playlists: {
      id: number
      name: string
      coverImgUrl: string
      creator: any
      subscribed: boolean
      trackCount: number
      userId: number
      playCount: number
      description: string
      [key: string]: any
    }[]
    order: string[]
  }
  code: number
}
