//-----------------------artist_album---------------------------------------------------
/**
 * @description: 歌手专辑里的歌手信息
 */
export interface ArtistAlbumArtist {
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
 * @description: 歌手专辑里的热门专辑
 */
export interface ArtistHotAlbum {
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
 * @description: 歌手专辑列表
 */
export interface ArtistAlbumResponse {
  artist: ArtistAlbumArtist
  hotAlbums: ArtistHotAlbum[]
  more: boolean
  code: number
}
//-----------------------artist_mv---------------------------------------------------
/**
 * @description: 歌手单个MV信息
 */
export interface ArtistMV {
  id: number
  name: string
  artist: {
    alias: string[]
    briefDesc: string
    picUrl: string
    img1v1Url: string
    albumSize: number
    trans: string
    musicSize: number
    name: string
    id: number
    [key: string]: any
  }
  imgurl16v9: string
  artistName: string
  imgurl: string
  duration: number
  playCount: number
  publishTime: string
  [key: string]: any
}

/**
 * @description: 歌手MV列表
 */
export interface ArtistMVResponse {
  mvs: ArtistMV[]
  time: number
  hasMore: boolean
  code: number
}
//-----------------------artist_song---------------------------------------------------
/**
 * @description: 歌手MV列表
 */
export interface ArtistSong {
  name: string
  mainTitle: string
  additionalTitle: string
  id: number
  ar: {
    id: number
    name: string
    tns: string[]
    alias: string[]
    [key: string]: any
  }[]
  alia: string[]
  al: {
    id: number
    name: string
    picUrl: string
    tns: string[]
    [key: string]: any
  }
  dt: number
  publishTime: 1319731200000
  [key: string]: any
}

/**
 * @description: 歌手MV列表
 */
export interface ArtistSongResponse {
  songs: ArtistSong[]
  total: number
  more: boolean
  code: number
}
//-----------------------artist_sublist---------------------------------------------------
/**
 * @description: 已收藏的歌手的简短信息
 */
export interface ArtistSub {
  info: string
  id: number
  name: string
  trans: string
  alias: string[]
  albumSize: number
  mvSize: number
  picUrl: string
  img1v1Url: string
  [key: string]: any
}

/**
 * @description: 已收藏的歌手列表
 */
export interface ArtistSublistResponse {
  data: ArtistSub[]
  count: number
  hasMore: boolean
  code: number
}
//-----------------------artist_sublist---------------------------------------------------
/**
 * @description: 歌手的详细信息
 */
export interface ArtistDetail {
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
  mvSize: 16
  [key: string]: any
}
/**
 * @description: 歌手的热门专辑信息
 */
export interface ArtistHotSong {
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
 * @description: 歌手信息
 */
export interface ArtistDetailtResponse {
  artist: ArtistDetail
  hotSongs: ArtistHotSong[]
  more: boolean
  code: number
}
