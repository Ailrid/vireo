import { EventMessage } from '@virid/core'
import { type SongDetail } from '@/utils'
export class FetchUserAccountMessage extends EventMessage {}
export class FetchUserPlaylistMessage extends EventMessage {}
export class FetchUserPlaylistDetailMessage extends EventMessage {
  constructor(public playlistId: number) {
    super()
  }
}
export class FetchUserPlaylistSongMessage extends EventMessage {
  constructor(
    public playlistId: number,
    public pageIndex: number
  ) {
    super()
  }
}

export class DeleteSongMessage extends EventMessage {
  constructor(
    public playlistId: number,
    public songId: number
  ) {
    super()
  }
}

export class AddSongMessage extends EventMessage {
  constructor(
    public playlistId: number,
    public songDetail: SongDetail
  ) {
    super()
  }
}


export class LogoutMessage extends EventMessage {}

