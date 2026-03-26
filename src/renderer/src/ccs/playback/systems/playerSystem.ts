import { System, Message, MessageWriter } from '@virid/core'
import {
  PlaySongMessage,
  PlayOrPauseMessage,
  NextSongMessage,
  PreviousSongMessage,
  SetVolumeMessage,
  SetPlayModeMessage,
  LoadFMPlaylistMessage,
  LoadIntelligencePlaylistMessage,
  MediaSessionMessage,
  SeekTimeMessage
} from '../messages'
import { PlayerComponent, PlaylistComponent, LyricComponent } from '../components'
import { songUrl, lyric } from '@/utils/server'
import { match, P } from 'ts-pattern'
import { SongDetail } from '@utils/server/interfaces'

export class PlayerSystem {
  /**
   * 播放这首歌
   */
  @System({
    priority: -1
  })
  async playSong(
    @Message(PlaySongMessage) message: PlaySongMessage,
    playerComponent: PlayerComponent,
    playlistComponent: PlaylistComponent,
    lyricComponent: LyricComponent
  ) {
    const list = playlistComponent.currentList
    // 更新播放列表
    let index = list.findIndex(item => item.id === message.song.id)
    if (index === -1) {
      const song = JSON.parse(JSON.stringify(message.song))
      list.push(song)
      index = list.length - 1
    }
    const song = list[index]
    playlistComponent.currentIndex = index
    playlistComponent.currentSong = song
    playerComponent.player.duration = song.duration
    // 同时发起请求
    const lyricPromise = lyric({ id: song.id, source: song.source })
    const urlPromise = songUrl({ id: song.id, level: 'lossless', source: song.source })

    // 并行等待结果
    const [lyricDetail, urlDetail] = await Promise.all([lyricPromise, urlPromise])
    // 处理歌词逻辑
    match(lyricDetail)
      .with({ ok: true }, ({ val }) => {
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
      .exhaustive()

    // 处理播放逻辑
    match(urlDetail)
      .with({ ok: true }, ({ val }) => {
        const url = val.data.url
        playerComponent.player.setSrc(url)
        //转交播放权并通知MediaSession
        PlayOrPauseMessage.send(true)
        MediaSessionMessage.send()
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val))
        NextSongMessage.send()
      })
      .exhaustive()
  }

  /**
   * 暂停或继续播放
   */
  @System()
  playOrPause(
    @Message(PlayOrPauseMessage) message: PlayOrPauseMessage,
    playerComponent: PlayerComponent,
    playlistComponent: PlaylistComponent
  ) {
    if (!playlistComponent.currentSong) return
    message.play ? playerComponent.player.play() : playerComponent.player.pause()
    message.play
      ? (navigator.mediaSession.playbackState = 'playing')
      : (navigator.mediaSession.playbackState = 'paused')
  }

  /**
   * 播放下一首
   */
  @System({
    messageClass: NextSongMessage
  })
  nextSong(playerComponent: PlayerComponent, playlistComponent: PlaylistComponent) {
    const { currentList, currentIndex, fmList, intelligenceList, currentSong } = playlistComponent
    const { playMode } = playerComponent

    match(playMode)
      // 列表类模式
      .with(P.union('order', 'random'), () => {
        if (currentList.length === 0) return
        const nextIndex = (currentIndex + 1) % currentList.length
        PlaySongMessage.send(currentList[nextIndex])
      })

      // 单曲循环
      .with('loop', () => {
        if (!currentSong?.id) return
        PlaySongMessage.send(currentSong)
      })

      // FM
      .with('fm', () => {
        // 判断当前是不是已经处于历史记录的末尾
        if (currentIndex < currentList.length - 1) {
          // 如果后面还有存过的历史歌，直接播下一首
          PlaySongMessage.send(currentList[currentIndex + 1])
        } else {
          // 如果已经到了尽头，去 buffer 要货
          this.consumeBuffer(fmList, () => LoadFMPlaylistMessage.send())
        }
      })

      // 心动模式
      .with('intelligence', () => {
        if (currentIndex < currentList.length - 1) {
          PlaySongMessage.send(currentList[currentIndex + 1])
        } else {
          this.consumeBuffer(intelligenceList, () => {
            LoadIntelligencePlaylistMessage.send()
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
  @System({
    messageClass: PreviousSongMessage
  })
  previousSong(playlistComponent: PlaylistComponent) {
    const { currentList, currentIndex } = playlistComponent
    if (currentList.length === 0) return
    // 无论什么模式，只要 currentList 有记录，就允许回退
    const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length
    PlaySongMessage.send(currentList[prevIndex])
  }

  /**
   * 设置音量
   */
  @System()
  setVolume(
    @Message(SetVolumeMessage) message: SetVolumeMessage,
    playerComponent: PlayerComponent
  ) {
    playerComponent.player.setVolume(message.volume)
  }
  /**
   * 设置进度
   */
  @System()
  seekProgress(
    @Message(SeekTimeMessage) message: SeekTimeMessage,
    playerComponent: PlayerComponent
  ) {
    playerComponent.player.seek(message.newTime)
    //更新MediaSession
    navigator.mediaSession.setPositionState({
      // 总时长
      duration: playerComponent.player.duration,
      // 播放速率
      playbackRate: 1,
      // 当前播放到的时间
      position: message.newTime
    })
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

    // 如果切到 FM 或心动
    if (message.playMode === 'fm' || message.playMode === 'intelligence') {
      // 备份当前顺序列表到 staging
      playlistComponent.stagingList = [...playlistComponent.currentList]
      // 重置当前状体啊
      playlistComponent.currentList = []
      if (message.playMode === 'fm') LoadFMPlaylistMessage.send()
      if (message.playMode === 'intelligence') LoadIntelligencePlaylistMessage.send()
    }

    // 如果切换到随机模式：生成洗牌列表
    if (message.playMode === 'random') {
      if (!playlistComponent.currentList || playlistComponent.currentList.length == 0) return
      // 备份当前顺序列表到 staging
      playlistComponent.stagingList = [...playlistComponent.currentList]

      const list = [...playlistComponent.currentList]
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
      }

      // 直接替换当前列表
      playlistComponent.currentList = list
      playlistComponent.currentIndex = list.findIndex(
        s => s.id === playlistComponent.currentSong!.id
      )
    }
    // 从随机模式切回,恢复原列表
    if (oldMode === 'random' && message.playMode !== 'random') {
      if (playlistComponent.stagingList.length == 0) return
      // 还原备份的顺序列表
      playlistComponent.currentList = [...playlistComponent.stagingList]
      // 找到当前这首歌在顺序列表里的位置
      playlistComponent.currentIndex = playlistComponent.currentList.findIndex(
        s => s.id === playlistComponent.currentSong!.id
      )
      // 清空备份
      playlistComponent.stagingList = []
    }
    if (oldMode === 'fm' || oldMode === 'intelligence') {
      if (playlistComponent.stagingList.length == 0) return
      // 还原备份的顺序列表
      playlistComponent.currentList = [...playlistComponent.stagingList]
      // 清空备份
      playlistComponent.stagingList = []
      PlaySongMessage.send(playlistComponent.currentList[0])
    }
  }
}
