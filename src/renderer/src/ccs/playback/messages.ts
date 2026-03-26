import { SingleMessage } from '@virid/core'
import { PlaylistDetail, SongDetail } from '@/utils/server'

export class PlaySongMessage extends SingleMessage {
  constructor(public song: SongDetail) {
    super()
  }
}
export class PlayOrPauseMessage extends SingleMessage {
  constructor(public play: boolean) {
    super()
  }
}
export class NextSongMessage extends SingleMessage {}
export class PreviousSongMessage extends SingleMessage {}

export class SetVolumeMessage extends SingleMessage {
  constructor(public volume: number) {
    super()
  }
}
export class SeekTimeMessage extends SingleMessage {
  constructor(public newTime: number) {
    super()
  }
}
export class SetPlaylistMessage extends SingleMessage {
  constructor(
    public songs: SongDetail[],
    public detail: PlaylistDetail
  ) {
    super()
  }
}
export class SetPlayModeMessage extends SingleMessage {
  constructor(public playMode: 'order' | 'random' | 'loop' | 'fm' | 'intelligence') {
    super()
  }
}

export class LoadFMPlaylistMessage extends SingleMessage {}
export class LoadIntelligencePlaylistMessage extends SingleMessage {}

export class MediaSessionMessage extends SingleMessage {}

export class SongLikeMessage extends SingleMessage {}
