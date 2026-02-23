import { createRequest } from '../utils/request'
import { type Request, type Response } from 'express'
import { urlMap } from './songData'

export const apiUrl = '/song/url'
export async function handler(req: Request, res: Response): Promise<any> {
  const { id, level, source } = req.body as SongUrlRequest
  if (source === 'local') {
    // 如果是本地的，应该从数据库里找一找，待做
    // TODO
  } else {
    const url = '/api/song/enhance/player/url/v1'
    const data: any = {
      ids: JSON.stringify([id]),
      level: level,
      encodeType: 'mp3'
    }
    if (data.level == 'sky') {
      data.immerseType = 'c51'
    }
    const options = {
      crypto: 'eapi',
      cookie: { ...req.cookies, os: 'pc' },
      headers: {}
    } as const
    const answer = await createRequest(url, data, options)
    const rawResponse = answer.data as RawSongUrlResponse
    //在这里我们得根据网易云的返回数据进行转换
    const response = {
      data: {
        id: id,
        url: `/api/song/data?id=${id}&md5=${rawResponse.data[0].md5 || ''}&source=netease`,
        md5: rawResponse.data[0].md5,
        size: rawResponse.data[0].size,
        br: rawResponse.data[0].br,
        level: rawResponse.data[0].level
      },
      code: 200
    } as SongUrlResponse
    // 设置一个全局的url
    urlMap.set(id, rawResponse.data[0].url)
    return res.set('Set-Cookie', answer.cookie).status(answer.status).json(response)
  }
}
interface SongUrlRequest {
  id: number
  level: 'standard' | 'exhigh' | 'lossless' | 'hires' | 'jyeffect' | 'sky' | 'jymaster'
  source: 'local' | 'netease'
}
/**
 * @description: 原始歌曲url返回数据
 */
interface RawSongUrlResponse {
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

/**
 * @description: 带缓存的歌曲url返回数据
 */
interface SongUrlResponse {
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
