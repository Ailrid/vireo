//-----------------------playlist_create---------------------------------------------------
/**
 * @description: 创建歌单返回数据
 */
export interface PlaylistCreateResponse {
  code: number
  playlist: {
    userId: 270937527
    updateTime: number
    coverImgUrl: string
    createTime: number
    name: string
    id: number
  }
  id: number
}
//-----------------------playlist_detail---------------------------------------------------
export interface PlaylistDetail {
  id: number
  name: string
  coverImgUrl: string
  userId: number
  createTime: number
  updateTime: number
  trackCount: number
  trackUpdateTime: number
  playCount: number
  trackNumberUpdateTime: number
  subscribedCount: number
  description: string
  tags: string[]
  subscribers: {
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
    avatarDetail: {
      identityIconUrl: string
      [key: string]: any
    }
    [key: string]: any
  }[]
  creator: {
    followed: boolean
    avatarUrl: string
    gender: number
    userId: number
    nickname: string
    signature: string
    description: string
    detailDescription: string
    backgroundUrl: string
    [key: string]: any
  }
  trackIds: {
    id: number
    uid: number
    [key: string]: any
  }[]
  [key: string]: any
}

/**
 * @description: 歌单详细返回数据
 */
export interface PlaylistDetailResponse {
  code: number
  playlist: PlaylistDetail
  [key: string]: any
}
