import { Song } from '@/logic/components/testComponent'
import { Responsive, OnHook } from '@/ccs/decorators/vue'
import { Listener, Message } from '@/ccs/decorators/ccs'
import { ControllerMessage } from '@/ccs/message'
import { Controller } from '@/ccs/decorators/ccs'
import { PlaySongMesage } from '../systems/testSystem'
export class SongControllerMessage extends ControllerMessage {
  //到底是哪一首歌发来的消息？索引
  constructor(public readonly index: number) {
    super()
  }
}

@Controller()
export class PlaylistController {
  @Responsive()
  public playlist!: Song[]

  @Listener(SongControllerMessage)
  onMessage(@Message(SongControllerMessage) message: SongControllerMessage) {
    console.log('song', this.playlist[message.index])
    //可以做一些操作统一拦截，或者直接调用播放器
    PlaySongMesage.send(this.playlist[message.index])
  }
  @OnHook('onSetup')
  async getPlaylist() {
    //在这里可以获取数据，例如从服务器获取数据,这里模拟一下
    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.playlist = [
      new Song('歌曲1', '1'),
      new Song('歌曲2', '2'),
      new Song('歌曲3', '3'),
      new Song('歌曲4', '4'),
      new Song('歌曲5', '5'),
      new Song('歌曲6', '6'),
      new Song('歌曲7', '7')
    ]
  }
}
