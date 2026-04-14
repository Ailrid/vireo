import { EventMessage } from '@virid/core'
import { type SongDetail } from '@/utils'
import { AsyncQueue } from '@virid/std'
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
@AsyncQueue('song-like')
export class DeleteSongMessage extends EventMessage {
  constructor(
    public playlistId: number,
    public songId: number
  ) {
    super()
  }
}
@AsyncQueue('song-like')
export class AddSongMessage extends EventMessage {
  constructor(
    public playlistId: number,
    public songDetail: SongDetail
  ) {
    super()
  }
}

export class LogoutMessage extends EventMessage {}
