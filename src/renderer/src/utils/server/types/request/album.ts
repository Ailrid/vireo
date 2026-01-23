//-----------------------alibum_sublist---------------------------------------------------
/**
 * @description: 用户收藏的专辑列表
 */
export interface AlbumSublistRequest {
  id: number
}

//-----------------------alibum---------------------------------------------------
/**
 * @description: 专辑详情
 */
export interface AlbumDetailRequest {
  id: number
}
//-----------------------alibum_sub---------------------------------------------------
/**
 * @description: 收藏/取消收藏专辑
 */
export interface AlbumSubRequest {
  id: number
  type: 'sub' | 'unsub'
}
