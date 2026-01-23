//-----------------------user_account---------------------------------------------------

/**
 * @description: 用户账户信息返回数据
 */
export interface UserAccountResponse {
  code: number
  account: {
    id: number
    userName: string
    createTime: number
    vipType: number
    [key: string]: any
  }
  profile: {
    userId: number
    nickname: string
    avatarUrl: string
    backgroundUrl: string
    signature: string
    createTime: number
    userName: string
    accountType: 1
    shortUserName: string
    birthday: number
    gender: number
    followed: boolean
    lastLoginTime: number
    lastLoginIP: string
    [key: string]: any
  }
}
//-----------------------user_detail---------------------------------------------------

/**
 * @description: 用户账户详细信息返回数据
 */
export interface UserDetailResponse {
  level: number
  listenSongs: number
  profile: {
    birthday: number
    gender: number
    nickname: string
    vipType: number
    followed: boolean
    detailDescription: string
    avatarUrl: string
    backgroundUrl: string
    createTime: number
    description: string
    userId: number
    signature: string
    followeds: number
    follows: number
    [key: string]: any
  }
  createTime: number
  createDays: number
  [key: string]: any
}
//-----------------------user_playlist---------------------------------------------------

/**
 * @description: 用户账户详细信息返回数据
 */
export interface UserPlaylistResponse {
  more: boolean
  playlist: {
    subscribers: string[]
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
      vipType: string
      [key: string]: any
    }
    subscribedCount: number
    userId: number
    trackUpdateTime: number
    trackCount: number
    updateTime: number
    coverImgUrl: string
    createTime: number
    playCount: number
    description: string
    tags: string[]
    name: string
    id: number
    [key: string]: any
  }[]
  code: number
}
//-----------------------user_record---------------------------------------------------
/**
 * @description: 用户最近播放歌曲
 */
interface PlayRecord {
  playCount: number
  score: number
  song: {
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
    publishTime: number
    tns: string[]
    privilege: {
      id: number
      [key: string]: any
    }
    [key: string]: any
  }
}

/**
 * @description: 用户最近播放记录返回数据
 */
export interface UserRecordResponse {
  weekData?: PlayRecord[]
  allData?: PlayRecord[]
  code: number
}
//-----------------------user_subcount---------------------------------------------------
/**
 * @description: 用户最近播放记录返回数据
 */
export interface UserSubCountResponse {
  programCount: number
  djRadioCount: number
  mvCount: number
  artistCount: number
  newProgramCount: number
  createDjRadioCount: number
  createdPlaylistCount: number
  subPlaylistCount: number
  code: number
}
