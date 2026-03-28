import { getSongDetail } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, Ok } from '@virid/express'
import { SongDetailRequestMessage } from '../message'
import { type SongDetailRequest, type SongDetailResponse } from '../types'

export class SongDetailSystem {
  @HttpSystem({
    messageClass: SongDetailRequestMessage
  })
  public static async getDetail(
    @Body() body: SongDetailRequest,
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>
  ) {
    const { ids } = body

    const formattedSongs = await getSongDetail(ids, cookies, headers)
    return Ok({
      code: 200,
      songs: formattedSongs
    } as SongDetailResponse)
  }
}

// /**
//  * * 音乐详情返回的原始的数据
//  */
// interface RawSongDetailResponse {
//   songs: {
//     name: string
//     id: number
//     ar: {
//       id: number
//       name: string
//       tns: string[]
//       alias: string[]
//       [key: string]: any
//     }[]
//     alia: string[]
//     al: {
//       id: number
//       name: string
//       picUrl: string
//       tns: string[]
//       [key: string]: any
//     }
//     dt: number
//     mv: number
//     publishTime: number
//     tns: string[]
//     [key: string]: any
//   }[]
//   privileges: {
//     id: number
//     fee: 0 | 1 | 4 | 8 | number
//     freeTrialPrivilege: {
//       resConsumable: boolean
//       userConsumable: boolean
//       [key: string]: any
//     }
//     [key: string]: any
//   }[]
//   code: number
// }
