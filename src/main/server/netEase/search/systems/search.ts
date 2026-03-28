import {
  createRequest,
  CryptoMode,
  type SongDetail,
  type AlbumInfo,
  type ArtistInfo,
  type PlaylistInfo,
  getSongDetail
} from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { SearchRequestMessage } from '../message'
import {
  SearchType,
  type SearchRequest,
  type SearchResponse,
  type UserInfo,
  type MvInfo
} from '../types'

export class SearchSystem {
  @HttpSystem({
    messageClass: SearchRequestMessage
  })
  public static async search(
    @Body() body: SearchRequest<SearchType>,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { keywords, type, limit = 30, offset = 0 } = body

    // 发起原始搜索请求
    const answer = await createRequest(CryptoMode.eapi, {
      url: '/search/get',
      data: { s: keywords, type, limit, offset },
      cookies,
      headers
    })

    const result = answer.data?.result || {}

    // 分拣中心：根据 type 进行不同路径的“脱水”
    switch (type) {
      // ================= 单曲搜索 (包含 ID 补全逻辑) =================
      case SearchType.Song:
      case SearchType.Lyric: {
        const rawSongs: RawSearchSong = result.songs || []
        if (rawSongs.length === 0) return this.empty(200)
        const ids = rawSongs.map((s: any) => s.id)
        const formattedSongs = await getSongDetail(ids, cookies, headers)
        return Ok({
          code: 200,
          items: formattedSongs,
          total: result.songCount || 0,
          hasMore: result.hasMore ?? true
        } as SearchResponse<SongDetail>)
      }

      // ================= 专辑搜索 =================
      case SearchType.Album: {
        const rawAlbums: RawSearchAlbum = result.albums || []
        const items: AlbumInfo[] = rawAlbums.map((al: any) => ({
          id: al.id,
          name: al.name,
          cover: al.picUrl,
          publishTime: al.publishTime,
          size: al.size,
          artists: (al.artists || [al.artist]).filter(Boolean).map((ar: any) => ({
            id: ar.id,
            name: ar.name
          }))
        }))
        return Ok({
          code: 200,
          items,
          total: result.albumCount || 0,
          hasMore: result.hasMore ?? true
        } as SearchResponse<AlbumInfo>)
      }

      // ================= 歌手搜索 =================
      case SearchType.Singer: {
        const rawArtists: RawSearchSinger = result.artists || []
        const items: ArtistInfo[] = rawArtists.map((ar: any) => ({
          id: ar.id,
          name: ar.name,
          avatar: ar.picUrl || ar.img1v1Url,
          alias: ar.alias || [],
          albumSize: ar.albumSize,
          musicSize: ar.musicSize
        }))
        return Ok({
          code: 200,
          items,
          total: result.artistCount || 0,
          hasMore: result.hasMore ?? true
        } as SearchResponse<ArtistInfo>)
      }

      // ================= 歌单搜索 =================
      case SearchType.Playlist: {
        const rawPlaylists: RawSearchPlaylist = result.playlists || []
        const items: PlaylistInfo[] = rawPlaylists.map((pl: any) => ({
          id: pl.id,
          name: pl.name,
          cover: pl.coverImgUrl,
          creator: {
            id: pl.userId,
            name: pl.creator?.nickname || '',
            avatar: pl.creator?.avatarUrl || ''
          },
          description: pl.description || '',
          songCount: pl.trackCount,
          playCount: pl.playCount,
          createTime: 0
        }))
        return Ok({
          code: 200,
          items,
          total: result.playlistCount || 0,
          hasMore: result.hasMore ?? true
        } as SearchResponse<PlaylistInfo>)
      }

      // ================= 用户搜索 =================
      case SearchType.User: {
        const rawUsers: RawSearchUser = result.userprofiles || []
        const items: UserInfo[] = rawUsers.map((u: any) => ({
          id: u.userId,
          name: u.nickname,
          avatar: u.avatarUrl,
          signature: u.signature || '',
          gender: u.gender,
          isVip: u.vipType > 0 // 网易云通过 vipType 判断是否是 VIP
        }))
        return Ok({
          code: 200,
          items,
          total: result.userprofileCount || 0,
          hasMore: result.hasMore ?? true
        } as SearchResponse<UserInfo>)
      }

      // ================= MV 搜索 =================
      case SearchType.Mv: {
        const rawMvs: RawSearchMv = result.mvs || []
        const items: MvInfo[] = rawMvs.map((m: any) => ({
          id: m.id,
          name: m.name,
          cover: m.cover,
          artistName: m.artistName,
          artistId: m.artistId,
          duration: m.duration,
          playCount: m.playCount
        }))
        return Ok({
          code: 200,
          items,
          total: result.mvCount || 0,
          hasMore: result.hasMore ?? true
        } as SearchResponse<MvInfo>)
      }

      default:
        return Ok({ code: 200, items: [], total: 0, hasMore: false })
    }
  }

  private static empty(code: number) {
    return Ok({ code, items: [], total: 0, hasMore: false })
  }
}

/**
 * *歌曲搜索
 */
interface RawSearchSong {
  result: {
    songs: {
      album: {
        publishTime: number
        size: number
        artist: {
          img1v1Url: string
          name: string
          alias: string[]
          [key: string]: any
        }
        transNames: string[]
        name: string
        id: number
        [key: string]: any
      }
      artists: {
        img1v1Url: string
        name: string
        alias: string[]
        id: number
        [key: string]: any
      }[]
      transNames: string[]
      name: string
      alias: string[]
      id: number
      [key: string]: any
    }[]
    hasMore: boolean
    songCount: number
  }
  code: number
  [key: string]: any
}
/**
 * *专辑搜索
 */
interface RawSearchAlbum {
  result: {
    albums: {
      name: string
      id: number
      size: number
      blurPicUrl: string
      picUrl: string
      publishTime: number
      description: string
      tags: string
      company: string
      briefDesc: string
      artist: {
        name: string
        id: number
        briefDesc: string
        picUrl: string
        img1v1Url: string
        albumSize: number
        alias: string[]
        trans: string
        musicSize: number
        alia: string[]
        [key: string]: any
      }
      alias: string[]
      artists: {
        name: string
        id: number
        briefDesc: string
        picUrl: string
        img1v1Url: string
        albumSize: number
        alias: string[]
        trans: string
        [key: string]: any
      }[]
      [key: string]: any
    }[]
    albumCount: number
    [key: string]: any
  }
  code: number
  [key: string]: any
}
/**
 * *歌手搜索
 */
interface RawSearchSinger {
  result: {
    hasMore: boolean
    artistCount: number
    artists: {
      id: number
      name: string
      picUrl: string
      alias: string[]
      albumSize: number
      musicSize: number
      img1v1Url: string
      mvSize: number
      followed: boolean
      trans: string
      [key: string]: any
    }[]
  }
  code: number
  [key: string]: any
}
/**
 * *歌单搜索
 */
interface RawSearchPlaylist {
  result: {
    playlists: {
      id: number
      name: string
      coverImgUrl: string
      creator: {
        nickname: string
        userId: number
        avatarUrl: number
        [key: string]: any
      }
      subscribed: boolean
      trackCount: number
      userId: number
      playCount: number
      officialTags: string[]
      description: string
      [key: string]: any
    }[]
    playlistCount: number
    [key: string]: any
  }
  code: number
  [key: string]: any
}
/**
 * *用户搜索
 */
interface RawSearchUser {
  result: {
    hasMore: boolean
    userprofileCount: number
    userprofiles: {
      followed: boolean
      avatarUrl: string
      gender: number
      userId: number
      nickname: string
      signature: string
      description: string
      detailDescription: string
      backgroundUrl: string
      vipType: number
      [key: string]: any
    }[]
  }
  code: number
  [key: string]: any
}
/**
 * *MV搜索
 */
interface RawSearchMv {
  result: {
    mvCount: 233
    mvs: {
      id: number
      cover: string
      name: string
      playCount: number
      briefDesc: string
      desc: string
      artistName: string
      artistId: number
      duration: number
      arTransName: string
      artists: {
        id: number
        name: string
        alias: number
        transNames: number
        [key: string]: any
      }[]
      transNames: number
      alias: number
      [key: string]: any
    }[]
  }
  code: number
  [key: string]: any
}
// /**
//  * *歌词搜索
//  */
// interface RawSearchLyric {
//   result: {
//     songCount: number
//     songs: {
//       id: number
//       name: string
//       artists: {
//         id: number
//         name: string
//         alias: string[]
//         img1v1Url: string
//         trans: string
//         [key: string]: any
//       }[]
//       album: {
//         id: number
//         name: string
//         artist: {
//           id: number
//           name: string
//           alias: string[]
//           img1v1Url: string
//           [key: string]: any
//         }
//         publishTime: number
//         size: number
//         [key: string]: any
//       }
//       duration: number
//       alias: string[]
//       lyrics: {
//         txt: string
//         range: {
//           first: number
//           second: number
//         }[]
//       }
//       [key: string]: any
//     }[]
//   }
//   code: number
//   [key: string]: any
// }
