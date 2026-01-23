//-----------------------search_suggets---------------------------------------------------

import { SearchType } from '../request/search'

/**
 * @description:搜索建议
 */
export interface SearchSuggestResponse {
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
//-----------------------search---------------------------------------------------
/**
 * @description:歌曲搜索
 */
export interface SearchSong {
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
 * @description:专辑搜索
 */
export interface SearchAlbum {
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
 * @description:歌手搜索
 */
export interface SearchSinger {
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
 * @description:歌单搜索
 */
export interface SearchPlaylist {
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
 * @description:用户搜索
 */
export interface SearchUser {
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
 * @description:MV搜索
 */
export interface SearchMV {
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
/**
 * @description:歌词搜索
 */
export interface SearchLyric {
  result: {
    songCount: number
    songs: {
      id: number
      name: string
      artists: {
        id: number
        name: string
        alias: string[]
        img1v1Url: string
        trans: string
        [key: string]: any
      }[]
      album: {
        id: number
        name: string
        artist: {
          id: number
          name: string
          alias: string[]
          img1v1Url: string
          [key: string]: any
        }
        publishTime: number
        size: number
        [key: string]: any
      }
      duration: number
      alias: string[]
      lyrics: {
        txt: string
        range: {
          first: number
          second: number
        }[]
      }
      [key: string]: any
    }[]
  }
  code: number
  [key: string]: any
}

export interface SearchResultMap {
  [SearchType.Song]: SearchSong
  [SearchType.Album]: SearchAlbum
  [SearchType.Singer]: SearchSinger
  [SearchType.Playlist]: SearchPlaylist
  [SearchType.User]: SearchUser
  [SearchType.MV]: SearchMV
  [SearchType.Lyric]: SearchLyric
}
