import { FromMain, FromMainMessage } from '@virid/renderer'
import {
  playlistDetail,
  songDetail,
  type SongDetail,
  type PlaylistDetail,
  getAccentRGB
} from '@/utils'
import { match } from 'ts-pattern'
import { Controller, MessageWriter, SingleMessage } from '@virid/core'
import { Listener, Responsive } from '@virid/vue'

@FromMain('play-song')
export class MainPlaySongMessage extends FromMainMessage {
  constructor(public id: string) {
    super()
  }
}
@FromMain('set-playlist')
export class MainPlayPlaylistMessage extends FromMainMessage {
  constructor(public id: string) {
    super()
  }
}

export class OpenShareDialogMessage extends SingleMessage {
  constructor(public open: boolean) {
    super()
  }
}

@Controller()
export class ShareDialogController {
  @Responsive()
  public show: boolean = false

  @Responsive()
  public songDetail: SongDetail | null = null

  @Responsive()
  public playlistDetail: PlaylistDetail | null = null

  @Responsive()
  public songColor: string = ''

  @Listener({
    messageClass: MainPlaySongMessage
  })
  async mainPlaySongMessage(message: MainPlaySongMessage) {
    const res = await songDetail({ ids: [Number(message.id)] })
    match(res)
      .with({ ok: true }, async ({ val }) => {
        if (val.songs.at(0)) {
          const { avgColor } = await getAccentRGB(val.songs.at(0)!.album.cover + '?param=64y64')
          this.songColor = `rgb(${avgColor[0]}, ${avgColor[1]}, ${avgColor[2]})`
          this.songDetail = val.songs.at(0)!
          this.show = true
        } else MessageWriter.error(new Error('[ShareDialogController] Song not found'))
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(
          new Error(val),
          '[ShareDialogController] Cannot get song detail in mainPlaySongMessage'
        )
      })
  }

  @Listener({
    messageClass: MainPlayPlaylistMessage
  })
  async mainPlayPlaylistMessage(message: MainPlayPlaylistMessage) {
    const res = await playlistDetail({ id: Number(message.id) })
    match(res)
      .with({ ok: true }, async ({ val }) => {
        const { avgColor } = await getAccentRGB(val.playlist.firstSongCover + '?param=64y64')
        this.songColor = `rgb(${avgColor[0]}, ${avgColor[1]}, ${avgColor[2]})`
        this.playlistDetail = val.playlist
        this.show = true
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(
          new Error(val),
          '[ShareDialogController] Cannot get song detail in mainPlaySongMessage'
        )
      })
  }

  closeDialog() {
    this.songDetail = null
    this.playlistDetail = null
    this.show = false
  }
}
