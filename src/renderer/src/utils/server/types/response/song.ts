//-----------------------song_comment---------------------------------------------------
/**
 * @description: 音乐评论返回数据
 */
export interface SongCommentResponse {
  comments: {
    user: {
      avatarUrl: string
      followed: boolean
      nickname: string
      vipType: number
      userId: number
      [key: string]: any
    }
    commentId: number
    content: string
    richContent: string
    time: number
    timeStr: string
    ipLocation: {
      ip: string
      location: string
      userId: number
    }
    [key: string]: any
  }[]
  hotComments: object[]
  userId: number
  code: number
  total: number
  more: boolean
  [key: string]: any
}
//-----------------------song_detail---------------------------------------------------
/**
 * @description: 音乐详情返回数据
 */
export interface SongDetailResponse {
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
//-----------------------song_lick_check---------------------------------------------------
/**
 * @description: 歌曲喜欢检查返回数据
 */
export interface SongLikeCheckResponse {
  ids: number[]
  code: 200
}
//-----------------------song_url---------------------------------------------------
/**
 * @description: 歌曲url返回数据
 */
export interface SongUrlResponse {
  data: {
    id: number
    url: string
    br: number
    size: number
    md5: string
    type: string
    level: 'standard' | 'higher' | 'exhigh' | 'lossless' | 'hires' | 'sky'
    time: number
    gain: number
    sr: number
    [key: string]: any
  }[]
  code: number
}
