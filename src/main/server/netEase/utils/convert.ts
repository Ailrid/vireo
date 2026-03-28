import { RawSongDetailResponse, SongDetail } from './interface'
import { createRequest, CryptoMode } from './netease-request'
export function convertSongDetail(rawData: RawSongDetailResponse): SongDetail[] {
  const privilegeMap = new Map(rawData.privileges.map(p => [p.id, p]))
  return rawData.songs.map(song => {
    const privilege = privilegeMap.get(song.id)
    return {
      id: song.id,
      platformId: String(song.id),
      source: 'netease',
      name: song.name,
      artists: (song.ar || []).map(a => ({
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
      like: false
    } as const
  })
}

export async function getSongDetail(
  ids: number[],
  cookies: Record<string, string>,
  headers: Record<string, string>
): Promise<SongDetail[]> {
  // 格式化 ID 为网易云要求的 [{id: 123}, {id: 456}] 格式
  const trackIds = ids.map(id => ({ id }))

  const answer = await createRequest(CryptoMode.weapi, {
    url: '/v3/song/detail',
    data: {
      c: JSON.stringify(trackIds)
    },
    cookies,
    headers
  })

  const rawData = answer.data as RawSongDetailResponse
  const formattedSongs = convertSongDetail(rawData)
  const res = await createRequest(CryptoMode.eapi, {
    url: '/song/like/check',
    data: {
      trackIds: formattedSongs.map(i => i.id)
    },
    cookies,
    headers
  })
  const likedIdSet = new Set(res.data.ids || res.data.data || [])
  // 返回一个和输入 ids 等长的布尔数组
  formattedSongs.forEach(song => {
    song.like = likedIdSet.has(song.id)
  })
  return formattedSongs
}
