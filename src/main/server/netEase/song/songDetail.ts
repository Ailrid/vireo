import { type Request, type Response } from 'express'

import { createRequest } from '../../utils/request.js'
export const apiUrl = '/song/detail'
export async function handler(req: Request, res: Response): Promise<any> {
  const query = req.body
  const apiUrl = '/api/v3/song/detail'
  if (!query.ids)
    throw new Error(
      `[Netease API Error] Request Parameter Missing: Request url is ${apiUrl} Need parameter ids at least, request parameter is ${query}`
    )
  const data = {
    c: JSON.stringify(query.ids)
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  } as const

  const answer = await createRequest(apiUrl, data, options)

  const rawData = answer.data as RawSongDetailResponse
  const privilegeMap = new Map(rawData.privileges.map((p) => [p.id, p]))
  const formattedSongs = rawData.songs.map((song) => {
    const privilege = privilegeMap.get(song.id)

    // 构造符合标准接口的对象
    return {
      id: song.id,
      platformId: String(song.id),
      source: 'netease',
      name: song.name,
      artists: (song.ar || []).map((a) => ({
        id: a.id,
        name: a.name
      })),
      album: {
        id: song.al?.id || 0,
        name: song.al?.name || '未知专辑',
        cover: song.al?.picUrl || ''
      },
      duration: song.dt / 1000 || 0,
      isAvailable: privilege ? privilege.fee !== 4 : true,
      raw: song // 保留原始数据备用
    }
  })

  // 返回转换后的数据
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json({
    code: rawData.code,
    songs: formattedSongs
  })
}
/**
 * @description: 音乐详情返回的原始的数据
 */
interface RawSongDetailResponse {
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
