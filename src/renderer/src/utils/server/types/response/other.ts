//-----------------------mv_detail---------------------------------------------------
/**
 * @description: MV详情
 */
export interface MvDetailResponse {
  mp: {
    id: number
    pl: number
    dl: number
    [key: string]: any
  }
  data: {
    id: number
    name: string
    artistId: number
    artistName: string
    briefDesc: string
    desc: string
    cover: string
    playCount: number
    commentCount: number
    duration: number
    publishTime: string
    brs: {
      size: number
      br: number
      point: number
    }[]
    artists: [
      {
        id: number
        name: string
        img1v1Url: string
        followed: boolean
      }
    ]
    videoGroup: {
      id: number
      name: string
      type: number
    }[]
    [key: string]: any
  }
  code: number
  [key: string]: any
}
//-----------------------mv_detail---------------------------------------------------
/**
 * @description: MV链接
 */
export interface MvUrlResponse {
  data: {
    id: number
    url: string
    [key: string]: any
  }
  code: number
}
//-----------------------personal_fm---------------------------------------------------
/**
 * @description: 私人FM数据
 */
export interface PersonalFmData {
  name: string
  id: number
  alias: string[]
  artists: {
    name: string
    id: number
    briefDesc: string
    picUrl: string
    img1v1Url: string
    alias: string[]
    trans: string
    [key: string]: any
  }[]
  album: {
    name: string
    id: number
    type: string
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
      alias: string[]
      trans: string
      [key: string]: any
    }
    artists: [
      {
        name: string
        id: number
        briefDesc: string
        picUrl: string
        img1v1Url: string
        alias: string[]
        trans: string
        [key: string]: any
      }
    ]
    [key: string]: any
  }
  duration: number
  transName: string
  transNames: string[]
  privilege: {
    id: number
    [key: string]: any
  }
  [key: string]: any
}
/**
 * @description: 私人FM
 */
export interface PersonalFmResponse {
  data: PersonalFmData[]
  code: number
  [key: string]: any
}
//-----------------------recommend_playlist---------------------------------------------------
/**
 * @description: 推荐歌单数据
 */
export interface RecommendPlaylistData {
  id: number
  type: 1
  name: string
  picUrl: string
  playcount: number
  createTime: number
  creator: {
    avatarUrl: string
    nickname: string
    backgroundUrl: string
    detailDescription: string
    followed: boolean
    description: string
    userId: number
    signature: string
    [key: string]: any
  }
  trackCount: number
  userId: number
  [key: string]: any
}
/**
 * @description: 私人FM
 */
export interface RecommendPlaylistResponse {
  data: RecommendPlaylistData[]
  code: number
  [key: string]: any
}
//-----------------------recommend_songs---------------------------------------------------
/**
 * @description: 推荐歌单数据
 */
export interface RecommendSongData {
  dailySongs: {
    name: string
    id: number
    ar: {
      id: number
      name: string
      tns: string[]
      alias: string[]
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
    videoInfo: {
      moreThanOne: boolean
      video: any
    }
    recommendReason: any
    privilege: {
      id: number
      [key: string]: any
    }
    [key: string]: any
  }[]
  recommendReasons: {
    songId: number
    reason: string
    targetUrl: string
    [key: string]: any
  }[]
  [key: string]: any
}
/**
 * @description: 日推
 */
export interface RecommendSongResponse {
  data: RecommendSongData[]
  code: number
}
//-----------------------vip_info_v2---------------------------------------------------
/**
 * @description: 推荐歌单数据
 */
export interface VipInfoResponse {
  message: string
  data: {
    redVipLevel: number
    now: number
    musicPackage: {
      vipCode: number
      expireTime: number
      [key: string]: any
    }
    associator: {
      vipCode: 100
      expireTime: number
      [key: string]: any
    }
    userId: number
    voiceBookVip: {
      vipCode: number
      expireTime: number
      [key: string]: any
    }
    [key: string]: any
  }
  code: number
}
//-----------------------intelligence---------------------------------------------------
/**
 * @description: 心动模式数据
 */
export interface IntelligenceResponse {
  message: string
  data: {
    id: number
    songInfo: {
      privilege: {
        id: 2728427776
        [key: string]: any
      }
      dt: number
      id: number
      publishTime: number
      mv: number
      al: {
        picUrl: string
        name: string
        tns: string[]
        [key: string]: any
      }
      alia: string[]
      ar: {
        name: string
        tns: string[]
        alias: string[]
        id: number
      }[]
      name: string
      tns: string[]
      [key: string]: any
    }
  }[]
  code: number
}
