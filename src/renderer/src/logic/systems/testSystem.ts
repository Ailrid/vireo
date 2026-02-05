import { PlayerComponent, PlaylistComponent, Song } from '@/logic/components/testComponent'
import { System, Message } from '@/ccs/decorators/ccs'
import { SingleMessage, EventMessage, onBeforeExecute } from '@/ccs/message'
import { injectable } from 'inversify'

//可以在这里注册一个全局钩子用来看看都有什么消息
onBeforeExecute(SingleMessage, (message, context) => {
  //打印记录
  console.log('[SingleMessage] 发送了消息:', message[0].constructor.name)
  console.log('[SingleMessage] 目标类型:', context.targetClass.name)
  console.log('[SingleMessage] 方法名:', context.methodName)
})
onBeforeExecute(EventMessage, (message, context) => {
  //打印记录
  console.log('[EventMessage] 发送了消息:', message.constructor.name)
  console.log('[EventMessage] 目标类型:', context.targetClass.name)
  console.log('[EventMessage] 方法名:', context.methodName)
})

export class ChangePlaylistMessage extends SingleMessage {
  constructor(public readonly songs: Song[]) {
    super()
  }
}
//不可合并
export class PlaySongMesage extends SingleMessage {
  constructor(public readonly song: Song) {
    super()
  }
}
export class PlayerPlayOrPauseMessage extends SingleMessage {
  constructor(public readonly action: boolean) {
    super()
  }
}
export class PlayMessage extends SingleMessage {
  constructor(public readonly songs: Song[]) {
    super()
  }
}
//不可合并，每个消息都会调用对应的system
export class IncreasePlayNumMessage extends EventMessage {}

export class Player {
  @System()
  static changePlaylist(
    @Message(ChangePlaylistMessage) message: ChangePlaylistMessage,
    playlist: PlaylistComponent
  ) {
    //更新整个播放列表
    playlist.playlist = message.songs
  }
  @System()
  static playOrPause(
    @Message(PlayerPlayOrPauseMessage) message: PlayerPlayOrPauseMessage,
    player: PlayerComponent
  ) {
    //只拿最后一个动作来决定
    const action = message.action
    player.player.pause(action)
  }
  @System()
  static playThisSong(
    @Message(PlaySongMesage) message: PlaySongMesage,
    playlist: PlaylistComponent,
    player: PlayerComponent
  ) {
    //把这首歌添加到playlist里，如果没有的话
    playlist.playlist.push(message.song)

    //开始播放这首歌
    playlist.currentSong = message.song
    player.player.play(message.song)
    //自动发送新消息，记录
    return new IncreasePlayNumMessage()
  }
  @System()
  static increasePlayNum(@Message(IncreasePlayNumMessage) _message: IncreasePlayNumMessage) {
    //在这里可以做一些别的事情，例如发送数据给服务器做记录
    console.log('播放的歌曲数量+1')
  }
}
