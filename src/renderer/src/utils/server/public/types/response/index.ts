//-----------------------lyric---------------------------------------------------
/**
 * @description: 歌词数据
 */
export interface LyircResponse {
  isPure: boolean
  lyrics: {
    time: number
    text: string
    trans: string
  }[]
  fromCache?: boolean
  code: number
}
//-----------------------song_url---------------------------------------------------
/**
 * @description: 歌曲url返回数据
 */
export interface SongUrlResponse {
  data: {
    id: number
    url: string
    md5: string
    size: number
    br: number
    level: string
  }
  code: number
}
