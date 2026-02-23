import { System, Message, MessageWriter } from '@virid/core'
import {
  PlaySongMessage,
  PlayOrPauseMessage,
  NextSongMessage,
  PreviousSongMessage,
  SetVolumeMessage,
  SetPlaylistMessage,
  SetPlayModeMessage,
  LoadFMPlaylistMessage,
  LoadIntellgencePlaylistMessage,
  CurrentSongChangedMessage
} from './messages'
import { PlayerComponent, PlaylistComponent, LyricComponent } from './componets'
import { personalFm, intelligence, songDetail } from '@/utils/server/netease'
import { songUrl, lyric } from '@/utils/server/public'
import { match, P } from 'ts-pattern'
import { SongDetail } from './interface'

export class PlayerSystem {
  /**
   * 播放这首歌
   */
  @System()
  async playSong(
    @Message(PlaySongMessage) message: PlaySongMessage,
    playerComponent: PlayerComponent,
    playlistComponent: PlaylistComponent,
    lyricComponent: LyricComponent
  ) {
    const { song } = message
    const list = playlistComponent.currentSongs

    // 更新播放列表
    let index = list.findIndex((item) => item.id === song.id)
    if (index === -1) {
      list.push(song)
      index = list.length - 1
    }
    playlistComponent.currentIndex = index
    playerComponent.player.currentSong = song
    // 先加载歌词
    const lyricDetail = await lyric({ id: song.id, source: song.source })
    match(lyricDetail)
      .with({ ok: true }, ({ val }) => {
        //在开头插入一个歌词
        val.lyrics.unshift({
          time: 0.0,
          text: `${song.name}-${song.artists[0].name}`,
          trans: ''
        })
        lyricComponent.lyric = val
        lyricComponent.currentIndex = 0
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val))
      })

    // 然后播放这首歌
    const url = await songUrl({ id: song.id, level: 'lossless', source: song.source })
    match(url)
      .with({ ok: true }, ({ val }) => {
        const url = val.data.url
        playerComponent.player.setSrc(url)
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val))
        NextSongMessage.send()
      })
      .exhaustive()
    PlayOrPauseMessage.send(true)
    CurrentSongChangedMessage.send()
  }

  /**
   * 暂停或继续播放
   */
  @System()
  playOrPause(
    @Message(PlayOrPauseMessage) message: PlayOrPauseMessage,
    playerComponet: PlayerComponent
  ) {
    if (!playerComponet.player.currentSong) return
    message.play ? playerComponet.player.play() : playerComponet.player.pause()
    message.play
      ? (navigator.mediaSession.playbackState = 'playing')
      : (navigator.mediaSession.playbackState = 'paused')
  }

  /**
   * 播放下一首
   */
  @System()
  nextSong(
    @Message(NextSongMessage) _message: NextSongMessage,
    playerComponent: PlayerComponent,
    playlistComponent: PlaylistComponent
  ) {
    const { currentSongs, currentIndex, fmList, intellgenceList } = playlistComponent
    const { playMode, player } = playerComponent

    match(playMode)
      // 列表类模式
      .with(P.union('order', 'random'), () => {
        if (currentSongs.length === 0) return
        const nextIndex = (currentIndex + 1) % currentSongs.length
        PlaySongMessage.send(currentSongs[nextIndex])
      })

      // 单曲循环
      .with('loop', () => {
        if (!player.currentSong.id) return
        PlaySongMessage.send(player.currentSong)
      })

      // FM
      .with('fm', () => {
        // 判断当前是不是已经处于历史记录的末尾
        if (currentIndex < currentSongs.length - 1) {
          // 如果后面还有存过的历史歌，直接播下一首
          PlaySongMessage.send(currentSongs[currentIndex + 1])
        } else {
          // 如果已经到了尽头，去 buffer 要货
          this.consumeBuffer(fmList, () => LoadFMPlaylistMessage.send())
        }
      })

      // 心动模式
      .with('intellgence', () => {
        if (currentIndex < currentSongs.length - 1) {
          PlaySongMessage.send(currentSongs[currentIndex + 1])
        } else {
          this.consumeBuffer(intellgenceList, () => {
            const song = player.currentSong
            LoadIntellgencePlaylistMessage.send(song.id, playlistComponent.playlistId, song.id)
          })
        }
      })
      .exhaustive()
  }

  /**
   * 内部私有工具：消费缓冲区
   */
  private consumeBuffer(buffer: SongDetail[], refillAction: () => void) {
    const next = buffer.shift()
    if (next) {
      PlaySongMessage.send(next)
      //剩 1 首就开始拉取
      if (buffer.length <= 1) refillAction()
    } else {
      // 同步触发拉取
      refillAction()
    }
  }

  /**
   * 播放上一首
   */
  @System()
  previousSong(
    @Message(PreviousSongMessage) _message: PreviousSongMessage,
    playlistComponent: PlaylistComponent
  ) {
    const { currentSongs, currentIndex } = playlistComponent
    if (currentSongs.length === 0) return
    // 无论什么模式，只要 currentSongs 有记录，就允许回退
    const prevIndex = (currentIndex - 1 + currentSongs.length) % currentSongs.length
    PlaySongMessage.send(currentSongs[prevIndex])
  }

  /**
   * 设置音量
   */
  @System()
  setVolume(@Message(SetVolumeMessage) message: SetVolumeMessage, playerComponet: PlayerComponent) {
    playerComponet.player.setVolume(message.volume)
  }

  /**
   * 设置播放模式
   */
  @System()
  setPlayMode(
    @Message(SetPlayModeMessage) message: SetPlayModeMessage,
    playerComponent: PlayerComponent,
    playlistComponent: PlaylistComponent
  ) {
    const oldMode = playerComponent.playMode
    playerComponent.playMode = message.playMode

    // 如果切到 FM 或心动，清空所有列表
    if (message.playMode === 'fm' || message.playMode === 'intellgence') {
      const playlistId = playlistComponent.playlistId
      // 重置所有状态
      playlistComponent.currentSongs = []
      playlistComponent.fmList = []
      playlistComponent.intellgenceList = []
      playlistComponent.stagingList = []
      playlistComponent.currentIndex = 0
      playlistComponent.playlistId = 0

      // 加载歌单
      if (message.playMode === 'fm') LoadFMPlaylistMessage.send()
      if (message.playMode === 'intellgence') {
        const song = playerComponent.player.currentSong
        LoadIntellgencePlaylistMessage.send(song.id, playlistId, song.id)
      }
      return
    }
    // 如果切换到随机模式：生成洗牌列表
    if (message.playMode === 'random') {
      // 备份当前顺序列表到 staging
      playlistComponent.stagingList = [...playlistComponent.currentSongs]

      const list = [...playlistComponent.currentSongs]
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
      }

      // 直接替换当前列表
      playlistComponent.currentSongs = list
      playlistComponent.currentIndex = list.findIndex(
        (s) => s.id === playerComponent.player.currentSong.id
      )
    }
    // 从随机模式切回,恢复原列表
    if (oldMode === 'random' && message.playMode !== 'random') {
      if (playlistComponent.stagingList.length > 0) {
        // 还原备份的顺序列表
        playlistComponent.currentSongs = [...playlistComponent.stagingList]
        // 找到当前这首歌在顺序列表里的位置
        playlistComponent.currentIndex = playlistComponent.currentSongs.findIndex(
          (s) => s.id === playerComponent.player.currentSong.id
        )
        // 清空备份
        playlistComponent.stagingList = []
      }
    }
  }
}

export class PlaylistSystem {
  /**
   * 加载FM模式歌曲的buffer
   */
  @System()
  async loadFMPlaylist(
    @Message(LoadFMPlaylistMessage) _message: LoadFMPlaylistMessage,
    playlistComponent: PlaylistComponent
  ) {
    // 获取 FM 原始数据
    const fmRes = await personalFm()

    // 处理第一层
    await match(fmRes)
      .with({ ok: true }, async ({ val }) => {
        const songIds = {
          ids: val.data.map((item) => ({ id: item.id })),
          level: 'lossless'
        } as const

        // 获取歌曲详情
        const detailRes = await songDetail(songIds)
        match(detailRes)
          .with({ ok: true }, ({ val: detail }) => {
            // 填充
            playlistComponent.fmList.push(...detail.songs)
            const nextSong = playlistComponent.fmList.shift()!
            PlaySongMessage.send(nextSong)
          })
          .with({ ok: false }, ({ val: err }) => {
            MessageWriter.error(new Error(err))
          })
          .exhaustive()
      })
      .with({ ok: false }, ({ val: err }) => {
        MessageWriter.error(new Error(err))
      })
      .exhaustive()
  }

  /**
   * 加载心动模式歌曲的buffer
   */
  @System()
  async loadIntelligencePlaylist(
    @Message(LoadIntellgencePlaylistMessage) message: LoadIntellgencePlaylistMessage,
    playlistComponent: PlaylistComponent
  ) {
    // 获取心动模式原始列表
    const intelRes = await intelligence({
      id: message.id, // 当前歌曲 id
      pid: message.pid, // 歌单 id
      sid: message.sid // 起始歌曲 id
    })

    await match(intelRes)
      .with({ ok: true }, async ({ val }) => {
        // 只取 ID
        const songIds = {
          ids: val.data.map((item) => ({ id: item.id })),
          level: 'lossless'
        } as const

        //走 songDetail 拿标准数据
        const detailRes = await songDetail(songIds)
        match(detailRes)
          .with({ ok: true }, ({ val: detail }) => {
            // 填充心动模式 Buffer
            playlistComponent.intellgenceList.push(...detail.songs)
            //立刻激活第一首
            const next = playlistComponent.intellgenceList.shift()!
            PlaySongMessage.send(next)
          })
          .with({ ok: false }, ({ val: err }) => {
            MessageWriter.error(new Error(err))
          })
          .exhaustive()
      })
      .with({ ok: false }, ({ val: err }) => {
        MessageWriter.error(new Error(err))
      })
      .exhaustive()
  }

  /**
   * 设置新的播放列表
   */
  @System()
  setPlaylist(
    @Message(SetPlaylistMessage) message: SetPlaylistMessage,
    playlistComponent: PlaylistComponent
  ) {
    //更新列表和索引
    playlistComponent.currentSongs = message.songs
    playlistComponent.playlistDetail = message.detail
    playlistComponent.currentIndex = 0
  }
}

export class MediaSessionSystem {
  private static lastSongId: number = 0

  @System()
  async changeSongMatedata(
    @Message(CurrentSongChangedMessage) _message: CurrentSongChangedMessage,
    playerComponent: PlayerComponent
  ) {
    const currentSong = playerComponent.player.currentSong

    if (!currentSong) return

    // 只有当歌曲真正改变时，才更新元数据（避免暂停/播放时重复刷新封面）
    if (MediaSessionSystem.lastSongId !== currentSong.id) {
      navigator.mediaSession.metadata = new MediaMetadata({
        // title: currentSong.name,
        // artist: currentSong.artists.map((a) => a.name).join('/'),
        // album: currentSong.album.name,
        artwork: [{ src: `${currentSong.album.cover}?param=512y512`, sizes: '512x512' }]
      })

      MediaSessionSystem.lastSongId = currentSong.id
    }
    // 播放状态是每次消息过来都要更新的
    navigator.mediaSession.setPositionState({
      // 总时长
      duration: currentSong.duration,
      // 播放速率
      playbackRate: 1,
      // 当前播放到的时间
      position: 0
    })
  }
}
