import { Controller, MessageWriter } from '@virid/core'
import { Listener, Responsive, Use, Watch } from '@virid/vue'
import { useRoute, useRouter } from 'vue-router'
import { FromIpc, FromMainMessage } from '@virid/renderer'
import { PlaySongMessage } from '@/ccs/playback'
import { songDetail } from '@/utils'
import { match } from 'ts-pattern'

@FromIpc('play-song')
export class MainPlaySongMessage extends FromMainMessage {
  constructor(public id: string) {
    super()
  }
}
@FromIpc('set-playlist')
export class MainPlayPlaylistMessage extends FromMainMessage {
  constructor(public id: string) {
    super()
  }
}

@Controller()
export class LayoutController {
  @Use(() => useRoute())
  public route!: ReturnType<typeof useRoute>

  @Use(() => useRouter())
  public router!: ReturnType<typeof useRouter>

  @Responsive()
  public transitionName: string = ''
  @Watch<LayoutController>(i => i.route.name)
  public onRouteChange(toName: string, fromName: string) {
    if (toName == 'player') {
      this.transitionName = 'fly-up'
    } else if (fromName == 'player') {
      this.transitionName = 'fly-down'
    }
  }
  @Listener({
    messageClass: MainPlaySongMessage
  })
  async mainPlaySongMessage(message: MainPlaySongMessage) {
    const res = await songDetail({ ids: [Number(message.id)] })
    match(res)
      .with({ ok: true }, ({ val }) => {
        if (val.songs[0]) PlaySongMessage.send(val.songs[0])
        else MessageWriter.error(new Error('Song not found'))
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(
          new Error(val),
          '[Song Detail] Cannot get song detail in mainPlaySongMessage'
        )
      })
  }

  @Listener({
    messageClass: MainPlayPlaylistMessage
  })
  mainPlayPlaylistMessage(message: MainPlayPlaylistMessage) {
    this.router.push({ name: 'playlist', params: { id: message.id } })
  }
}
