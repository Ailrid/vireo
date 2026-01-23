//-----------------------alibum_sublist---------------------------------------------------
/**
 * @description: 专辑信息
 */
export interface AlbumInfo {
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
 * @description: 用户收藏的专辑列表信息
 */
export interface AlbumSublistResponse {
  data: AlbumInfo[]
  count: number
  hasMore: boolean
  code: number
  [key: string]: any
}
/**
 * @description: 专辑详情里的每个歌曲的信息
 */
export interface AlbumSongDetail {
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

//-----------------------alibum---------------------------------------------------
/**
 * @description: 专辑的详细详情
 */
export interface AlbumDetail {
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
 * @description: 专辑详情响应
 */
export interface AlbumDetailResponse {
  resourceState: boolean
  songs: AlbumSongDetail[]
  code: number
  album: AlbumDetail
  [key: string]: any
}
