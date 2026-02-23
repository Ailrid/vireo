export interface SongDetail {
  // 核心标识
  id: number // 框架全局 ID
  platformId: string // 原始 ID (网易云的数字 ID 或本地文件的 MD5/路径)
  source: 'netease' | 'local'
  name: string // 歌名
  artists: { id: number | string; name: string }[]
  album: {
    id: number | string
    name: string
    cover: string
  }
  duration: number // 统一毫秒
  url?: string // 预留给播放地址
  level?: string // 音质标识
  isAvailable: boolean // 是否有版权/文件是否存在
  localPath?: string // 本地歌曲专用
  raw?: any // 仍然保留一份原始数据，
}

export interface PlaylistDetail {
  id: number
  name: string
  coverImgUrl: string
  creatorName: string
  description: string
  trackIds: number[]
  trackCount: number
}

export interface LyricDetail {
  isPure: boolean
  lyrics: {
    time: number
    text: string
    trans: string
  }[]
}
