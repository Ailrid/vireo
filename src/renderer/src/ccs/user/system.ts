import { System, MessageWriter, Message } from '@virid/core'
import { UserComponent } from './component'
import {
  FetchUserAccountMessage,
  FetchUserPlaylistMessage,
  LogoutMessage,
  FetchUserPlaylistDetailMessage,
  FetchUserPlaylistSongMessage,
  AddSongMessage,
  DeleteSongMessage
} from './message'
import { match } from 'ts-pattern'
import {
  userAccount,
  userPlaylist,
  logout,
  playlistDetail,
  songDetail,
  type SongDetail
} from '@/utils/server'

const PAGE_SIZE = 200

export class UserSystem {
  /**
   * * 获取用户信息
   */
  @System({
    messageClass: FetchUserAccountMessage
  })
  static async fetchUserInfo(userComponent: UserComponent) {
    const profile = await userAccount()
    match(profile)
      .with({ ok: true }, ({ val }) => {
        if (val.profile) {
          userComponent.userProfile = val.profile
          //获取歌单
          FetchUserPlaylistMessage.send()
        } else {
          MessageWriter.error(
            new Error('[UserSystem] Failed To Fetch User Information: Got empty profile')
          )
        }
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val), '[UserSystem] Failed To Fetch User Information')
      })
      .exhaustive()
  }
  /**
   * * 获取用户歌单列表
   */
  @System({
    messageClass: FetchUserPlaylistMessage
  })
  static async fetchUserPlaylist(userComponent: UserComponent) {
    if (!userComponent.userProfile) {
      MessageWriter.warn('[UserSystem] Fetch User Playlist: Not login in')
      return
    }
    const playlist = await userPlaylist({
      uid: userComponent.userProfile.userId,
      limit: 100,
      offset: 0
    })
    match(playlist)
      .with({ ok: true }, ({ val }) => {
        userComponent.userPlaylists = val.playlists
        // 自动去拿第一个歌单的详情（我喜欢列表）
        FetchUserPlaylistDetailMessage.send(val.playlists[0].id)
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val), '[UserSystem] Failed To Fetch User Playlist')
      })
      .exhaustive()
  }
  /**
   * * 获取用户歌单详情
   */
  @System()
  static async fetchUserPlaylistDetail(
    @Message(FetchUserPlaylistDetailMessage) message: FetchUserPlaylistDetailMessage,
    userComponent: UserComponent
  ) {
    if (!userComponent.userProfile) {
      MessageWriter.warn('[UserSystem] Fetch User Playlist: Not login in')
      return
    }
    if (userComponent.userPlaylistsDetail.has(message.playlistId)) return
    const detail = await playlistDetail({
      id: message.playlistId
    })
    match(detail)
      .with({ ok: true }, ({ val }) => {
        userComponent.userPlaylistsDetail.set(message.playlistId, val.playlist)

        //自动去拿第0页
        FetchUserPlaylistSongMessage.send(message.playlistId, 0)
        // 到这里可以认为用户的初始化完成了（用户信息和“我喜欢”歌单信息是必须的，其他都是可选的），可以展示界面了
        userComponent.initialize = true
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(
          new Error(val),
          `[UserSystem] Failed To Fetch User Playlist Detail: Id ${message.playlistId}`
        )
      })
      .exhaustive()
  }
  /**
   * * 获取用户歌单里的歌
   */
  @System()
  static async fetchUserPlaylistSong(
    @Message(FetchUserPlaylistSongMessage) message: FetchUserPlaylistSongMessage,
    userComponent: UserComponent
  ) {
    if (!userComponent.userProfile) {
      MessageWriter.warn('[UserSystem] Fetch User Playlist Song: Not login in')
      return
    }
    if (!userComponent.userPlaylistsDetail.has(message.playlistId)) {
      //如果没有detail，先去拿detail
      return new FetchUserPlaylistDetailMessage(message.playlistId)
    }
    const songsIds = userComponent.userPlaylistsDetail.get(message.playlistId)!.songsIds
    //如果已经有数据了，什么也不做
    if (userComponent.userPlaylistsSongs.get(message.playlistId)?.has(message.pageIndex)) return
    //计算这一页的开始索引和结束索引
    const startIndex = message.pageIndex * PAGE_SIZE
    const endIndex =
      startIndex + PAGE_SIZE > songsIds.length ? songsIds.length : startIndex + PAGE_SIZE
    const playlist = await songDetail({
      ids: songsIds.slice(startIndex, endIndex)
    })
    match(playlist)
      .with({ ok: true }, ({ val }) => {
        let playlistPages = userComponent.userPlaylistsSongs.get(message.playlistId)
        if (!playlistPages) {
          playlistPages = new Map<number, SongDetail[]>()
          userComponent.userPlaylistsSongs.set(message.playlistId, playlistPages)
        }
        playlistPages.set(message.pageIndex, val.songs)
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(
          new Error(val),
          `[UserSystem] Failed To Fetch User Playlist Song: Page index: ${message.pageIndex}`
        )
      })
      .exhaustive()
    return
  }
  /**
   * * 向歌单添加歌曲
   */
  @System()
  static async addSong(
    @Message(AddSongMessage) message: AddSongMessage,
    userComponent: UserComponent
  ) {
    const { playlistId, songDetail: newSong } = message
    const playlistMap = userComponent.userPlaylistsSongs.get(playlistId)
    const playlistDetail = userComponent.userPlaylistsDetail.get(playlistId)

    if (!playlistMap || !playlistDetail) return
    // 更新ID 序列
    playlistDetail.playCount += 1
    playlistDetail.songsIds = [newSong.id, ...playlistDetail.songsIds]
    // 找出所有已缓存的页码并排序
    const cachedPageIndexes = Array.from(playlistMap.keys()).sort((a, b) => a - b)
    // 计算每一页位移后“理论上”的第一首歌 ID
    const neededIds = cachedPageIndexes.map(idx => playlistDetail.songsIds[idx * PAGE_SIZE])
    const res = await songDetail({ ids: neededIds })

    match(res)
      .with({ ok: true }, ({ val }) => {
        // 将获取到的歌曲详情转为 Map 方便快速取用
        const fetchedSongsMap = new Map(val.songs.map(s => [s.id, s]))
        // 更新每一页的数据
        for (const pageIdx of cachedPageIndexes) {
          const oldPage = playlistMap.get(pageIdx)!
          // 拿到新的每页的第一个
          const targetId = playlistDetail.songsIds[pageIdx * PAGE_SIZE]
          const newHeaderSong = fetchedSongsMap.get(targetId)!
          // 构造新页面
          let newPageData: SongDetail[]
          if (oldPage.length >= PAGE_SIZE) {
            // 满了就踢掉最后一个，把新头塞进去
            newPageData = [newHeaderSong, ...oldPage.slice(0, PAGE_SIZE - 1)]
          } else {
            // 没满就直接塞进去
            newPageData = [newHeaderSong, ...oldPage]
          }
          playlistMap.set(pageIdx, newPageData)
        }
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val), `[UserSystem] Add Song Failed: Cannot get song detail`)
      })
      .exhaustive()
  }

  /**
   * * 从歌单删除歌曲
   */
  @System()
  static async deleteSong(
    @Message(DeleteSongMessage) message: DeleteSongMessage,
    userComponent: UserComponent
  ) {
    const { playlistId, songId } = message
    const playlistMap = userComponent.userPlaylistsSongs.get(playlistId)
    const playlistDetail = userComponent.userPlaylistsDetail.get(playlistId)

    if (!playlistMap || !playlistDetail) return

    const index = playlistDetail.songsIds.findIndex(id => id === songId)
    if (index === -1) return

    // 同步更新
    playlistDetail.playCount = Math.max(0, playlistDetail.playCount - 1)
    playlistDetail.songsIds.splice(index, 1)

    const affectedPageIndex = Math.floor(index / PAGE_SIZE)
    const cachedAffectedPages = Array.from(playlistMap.keys())
      .filter(pageIdx => pageIdx >= affectedPageIndex)
      .sort((a, b) => a - b)

    if (cachedAffectedPages.length === 0) return

    // 预计算补位 ID
    const neededIds: number[] = []
    for (const pageIdx of cachedAffectedPages) {
      const nextLastIndex = (pageIdx + 1) * PAGE_SIZE - 1
      if (nextLastIndex < playlistDetail.songsIds.length) {
        neededIds.push(playlistDetail.songsIds[nextLastIndex])
      }
    }

    // 处理不需要补位的简单情况（只有一页，或者删的是最后一页的末尾）
    if (neededIds.length === 0) {
      for (const pageIdx of cachedAffectedPages) {
        // 如果删完后这页彻底没了
        if (pageIdx * PAGE_SIZE >= playlistDetail.songsIds.length) {
          if (pageIdx !== 0) playlistMap.delete(pageIdx)
          else playlistMap.set(pageIdx, [])
          continue
        }
        // 否则只是简单减员
        const currentPage = playlistMap.get(pageIdx)!.filter(s => s.id !== songId)
        playlistMap.set(pageIdx, currentPage)
      }
      return
    }

    // 需要补位的复杂情况
    const res = await songDetail({ ids: neededIds })
    match(res)
      .with({ ok: true }, ({ val }) => {
        const fetchedSongsMap = new Map(val.songs.map(s => [s.id, s]))
        for (const pageIdx of cachedAffectedPages) {
          // 删掉空页面
          if (pageIdx * PAGE_SIZE >= playlistDetail.songsIds.length) {
            playlistMap.delete(pageIdx)
            continue
          }
          // 计算补位之后的内容
          let currentPage = [...playlistMap.get(pageIdx)!]
          if (pageIdx === affectedPageIndex) {
            const targetIdx = currentPage.findIndex(s => s.id === songId)
            if (targetIdx !== -1) currentPage.splice(targetIdx, 1)
          } else {
            // 后续页面掐头
            currentPage.shift()
          }
          const newLastSongId = playlistDetail.songsIds[(pageIdx + 1) * PAGE_SIZE - 1]
          const refillSong = fetchedSongsMap.get(newLastSongId)
          if (refillSong && currentPage.length < PAGE_SIZE) {
            currentPage.push(refillSong)
          }
          // 更新缓存
          playlistMap.set(pageIdx, currentPage)
        }
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val), `[UserSystem] Delete Fallback Failed`)
      })
      .exhaustive()
  }
  /**
   *
   * * 登出
   */
  @System({
    messageClass: LogoutMessage
  })
  static async logoutNetease(userComponent: UserComponent) {
    logout()
    userComponent.userPlaylists = []
    userComponent.userProfile = null
  }
}
