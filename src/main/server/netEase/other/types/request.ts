//-----------------------comment---------------------------------------------------
/**
 * * MV详情
 */
export interface CommentRequest {
  id: number
  t: 'add' | 'delete' | 'reply'
  content: string
  commentId: number | null
}

//-----------------------mv_detail---------------------------------------------------
/**
 * * MV详情
 */
export interface MvDetailRequest {
  id: number
}
//-----------------------mv_detail---------------------------------------------------
/**
 * * MV链接
 */
export interface MvUrlRequest {
  id: number
  r?: number
}

//-----------------------intelligence---------------------------------------------------
/**
 * * 心动模式
 */
export interface IntelligenceRequest {
  id: number
  pid: number
  sid: number
  count?: number
}
//-----------------------fm---------------------------------------------------
/**
 * @description 私人FM模式选择请求参数
 */
export interface PersonalFmRequest {
  /** 歌曲 ID */
  id: number
  /** 歌单 ID (作为推荐基准) */
  pid: number
  /** 起始歌曲 ID (通常同 id) */
  sid?: number
  /** 推荐数量 */
  count?: number

  /** * 推荐模式
   * DEFAULT: 默认
   * FAMILIAR: 熟悉
   * EXPLORE: 探索
   * AIDJ: AI 广播员
   * SCENE_RCMD: 场景推荐 (需配合 submode)
   */
  mode: 'DEFAULT' | 'FAMILIAR' | 'EXPLORE' | 'AIDJ' | 'SCENE_RCMD'

  /** * 子模式 (仅在 mode 为 SCENE_RCMD 时生效)
   * EXERCISE: 运动
   * FOCUS: 专注
   * NIGHT_EMO: 深夜情绪
   */
  submode?: 'EXERCISE' | 'FOCUS' | 'NIGHT_EMO' | string
  limit?: number
}

export interface VipInfoRequest {
  uid: number
}

export interface HomepageRequest {
  refresh?: number
}
