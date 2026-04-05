/**
 * * 音乐详情返回的原始的数据
 */
export interface RawSongDetailResponse {
  songs: {
    name: string
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
    mv: number
    publishTime: number
    tns: string[]
    [key: string]: any
  }[]
  privileges: {
    id: number
    fee: 0 | 1 | 4 | 8 | number
    freeTrialPrivilege: {
      resConsumable: boolean
      userConsumable: boolean
      [key: string]: any
    }
    [key: string]: any
  }[]
  code: number
}

export interface SongDetail {
  // 核心标识
  id: number // 框架全局 ID
  platformId: string // 原始 ID
  source: 'netease' | 'local'
  // 基础元数据
  name: string // 歌名
  artists: { id: number | string; name: string }[] // 统一叫 artists
  album: {
    id: number | string
    name: string
    cover: string // 统一叫 cover
  }
  like: boolean
  // 播放属性
  duration: number // 统一毫秒或秒
  url?: string // 预留给播放地址
  level?: string // 音质标识
  // 状态位
  isAvailable: boolean // 是否有版权/文件是否存在
  localPath?: string // 本地歌曲专用
  raw?: any // 仍然保留一份原始数据
}

/** 歌单基础信息 (用于列表展示、磁贴、预览) */
export interface PlaylistInfo {
  id: number
  name: string
  cover: string
  creator: {
    name: string
    id: number
    avatar: string
  }
  description: string
  songCount: number
  playCount: number
  createTime: number
}

/** 专辑基础信息 (用于列表展示、收藏列表、搜索建议) */
export interface AlbumInfo {
  id: number
  name: string
  cover: string
  publishTime: number
  songCount: number // 歌曲数量
  /** 这里的歌手我们要统一成极简格式 */
  artists: {
    id: number
    name: string
  }[]
  company?: string // 发行公司
  description?: string
}

/** 歌手基础信息*/
export interface ArtistInfo {
  id: number
  name: string
  description: string
  avatar: string
  alias: string[]
  albumSize: number
  songSize: number
  mvSize?: number
}

/** 专辑详情*/
export interface AlbumDetail extends AlbumInfo {
  songsIds: number[] // 依然走你的“ID 索引”策略
  shareCount?: number
  commentCount?: number
  isSubscribed?: boolean // 是否收藏
}

/** 歌手详情*/
export interface ArtistDetail extends ArtistInfo {
  briefDesc: string
  songsIds: number[]
  publishTime?: number
  followed?: boolean
}

export interface PlaylistDetail extends PlaylistInfo {
  songsIds: number[]
  firstSongCover: string
  subscribedCount?: number
  shareCount?: number
}
