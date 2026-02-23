//-----------------------lyric_new---------------------------------------------------
/**
 * @description: 歌词详情
 */
export interface LyricRequest {
  id: number
  source: 'netease' | 'local'
}
//-----------------------song_url---------------------------------------------------
/**
 * @description: 歌曲url
 * standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带)
 */
export interface SongUrlRequest {
  id: number
  level: 'standard' | 'exhigh' | 'lossless' | 'hires' | 'jyeffect' | 'sky' | 'jymaster'
  source: 'local' | 'netease'
}
