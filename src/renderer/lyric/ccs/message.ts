import { FromMain, FromMainMessage, type RendererPlugin, ToMainMessage } from '@virid/renderer'
import { type Lyric, type ThemeConfig } from './component'

export class CloseWindowMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type: string = 'close-window'
  constructor() {
    super()
  }
}

export class EnableLyricMessage extends ToMainMessage {
  __virid_target = 'renderer'
  __virid_message_type = 'enable-lyric'
  constructor(public enable: boolean) {
    super()
  }
}

export class LockLyricWindowMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type = 'lock-lyric-window'
}

@FromMain('sync-lyric')
export class SyncLyricMessage extends FromMainMessage {
  constructor(
    public theme: ThemeConfig,
    public lyric: Lyric,
    public isPlaying: boolean
  ) {
    super()
  }
}

@FromMain('unlock-lyric')
export class UnlockLyricMessage extends FromMainMessage {
  constructor() {
    super()
  }
}

export class PlayOrPauseMessage extends ToMainMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'play-or-pause'
}

export class NextSongMessage extends ToMainMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'next-song'
}

export class PreviousSongMessage extends ToMainMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'previous-song'
}

export function registerFromMainMessage(plugin: RendererPlugin) {
  plugin.bindRoute(SyncLyricMessage)
  plugin.bindRoute(UnlockLyricMessage)
}
