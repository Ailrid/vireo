import { System, Message, MessageWriter } from '@virid/core'
import {
  PlaySongMessage,
  SetPlaylistMessage,
  LoadFMPlaylistMessage,
  LoadIntelligencePlaylistMessage,
  SongLikeMessage,
  SetPlayModeMessage
} from '../messages'
import { PlayerComponent, PlaylistComponent } from '../components'
import { personalFm, intelligence, songLike } from '@/utils/server'
import { match } from 'ts-pattern'
import { AddSongMessage, DeleteSongMessage, UserComponent } from '@/ccs/user'
import { AsyncQueueMessage } from '@/ccs/utils'
export class PlaylistSystem {
  /**
   * *加载FM模式歌曲的buffer
   */
  @System({
    messageClass: LoadFMPlaylistMessage
  })
  async loadFmPlaylist(playlistComponent: PlaylistComponent) {
    // 获取 FM 原始数据
    const fmRes = await personalFm({} as any)

    // 处理第一层
    await match(fmRes)
      .with({ ok: true }, async ({ val }) => {
        // 填充
        playlistComponent.fmList.push(...val.songs)
        const nextSong = playlistComponent.fmList.shift()!
        PlaySongMessage.send(nextSong)
      })
      .with({ ok: false }, ({ val: err }) => {
        MessageWriter.error(new Error(err))
      })
      .exhaustive()
  }

  /**
   * *加载心动模式歌曲的buffer
   */
  @System({
    messageClass: LoadIntelligencePlaylistMessage
  })
  async loadIntelligencePlaylist(playlistComponent: PlaylistComponent) {
    if (!playlistComponent.currentSong || !playlistComponent.playlistDetail) return
    // 获取心动模式原始列表
    const intelRes = await intelligence({
      id: playlistComponent.currentSong.id, // 当前歌曲 id
      pid: playlistComponent.playlistDetail.id, // 歌单 id
      sid: playlistComponent.currentSong.id // 起始歌曲 id
    })

    await match(intelRes)
      .with({ ok: true }, async ({ val }) => {
        // 填充心动模式 Buffer
        playlistComponent.intelligenceList.push(...val.songs)
        // 立刻激活第一首
        const next = playlistComponent.intelligenceList.shift()!
        PlaySongMessage.send(next)
      })
      .with({ ok: false }, ({ val: err }) => {
        MessageWriter.error(new Error(err))
      })
      .exhaustive()
  }

  /**
   * *设置新的播放列表
   */
  @System()
  setPlaylist(
    @Message(SetPlaylistMessage) message: SetPlaylistMessage,
    playlistComponent: PlaylistComponent,
    playerComponent: PlayerComponent
  ) {
    //数据脱水
    const playlistDetail = JSON.parse(JSON.stringify(message.detail))
    const playlistSongs = JSON.parse(JSON.stringify(message.songs))
    //更新列表和索引
    playlistComponent.currentList = playlistSongs
    playlistComponent.playlistDetail = playlistDetail
    playlistComponent.currentIndex = 0
    playlistComponent.stagingList = []
    playerComponent.playMode = 'order'
  }
  /**
   * *喜欢/取消喜欢这首歌
   */
  @System({
    messageClass: SongLikeMessage
  })
  likeCurrentSong(playlistComponent: PlaylistComponent, userComponent: UserComponent) {
    const asyncTask = async () => {
      if (!playlistComponent.currentSong) return
      const currentSong = playlistComponent.currentSong
      const newState = !currentSong.like
      //第一步，把网易云的状态改了
      const res = await songLike({
        id: currentSong.id,
        like: newState
      })
      match(res)
        .with({ ok: true }, () => {
          //第二步，更改当前歌曲的喜欢状态
          currentSong.like = newState
          playlistComponent.currentList.find(song => song.id === currentSong.id)!.like = newState
          //第三步，从“喜欢“列表里删除这首歌，如果有的话
          if (!newState)
            DeleteSongMessage.send(userComponent.userPlaylists.at(0)!.id, currentSong!.id)
          else AddSongMessage.send(userComponent.userPlaylists.at(0)!.id, currentSong)
        })
        .with({ ok: false }, ({ val }) => {
          MessageWriter.error(new Error(val), '[Playlist System] ')
        })
    }
    return new AsyncQueueMessage(asyncTask)
  }
}
