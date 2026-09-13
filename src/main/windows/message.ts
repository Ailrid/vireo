import { EventMessage, SingleMessage } from '@virid/core'
import { FromRendererMessage, FromRenderer, ToRendererMessage, MainPlugin } from '@virid/main'
import { type BrowserWindow } from 'electron'

// 渲染进程发来的操作消息
@FromRenderer('close-window')
export class CloseWindowMessage extends FromRendererMessage {}

@FromRenderer('minimize-window')
export class MinimizeWindowMessage extends FromRendererMessage {}

@FromRenderer('maximize-window')
export class MaximizeWindowMessage extends FromRendererMessage {}

@FromRenderer('hidden-window')
export class HiddenWindowMessage extends FromRendererMessage {}

@FromRenderer('open-dialog')
export class OpenDialogMessage extends FromRendererMessage {
  constructor(
    public options: {
      title?: string
      filters?: Array<{ name: string; extensions: string[] }>
      properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>
    }
  ) {
    super()
  }
}

// 内部的操作消息
export class ShowWindowMessage extends SingleMessage {
  constructor(public windowName: string = 'mainWindow') {
    super()
  }
}
export class RenderDialogMessage extends ToRendererMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'file-dialog'
  constructor(public path: string) {
    super()
  }
}

export class PlaySongMessage extends ToRendererMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'play-song'
  constructor(public id: string) {
    super()
  }
}
export class SetPlaylistMessage extends ToRendererMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'set-playlist'
  constructor(public id: string) {
    super()
  }
}

export class PlayOrPauseMessage extends ToRendererMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'play-or-pause'
}

export class NextSongMessage extends ToRendererMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'next-song'
}

export class PreviousSongMessage extends ToRendererMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'previous-song'
}
export class BackupAndCloseMessage extends ToRendererMessage {
  __virid_target: string = 'renderer'
  __virid_message_type: string = 'backup-playback'
}

export class NeteaseLoginSuccessMessage extends ToRendererMessage {
  __virid_message_type: string = 'netease-login-success'
  __virid_target: string = 'renderer'
}

export class CreateMainWindowMessage extends SingleMessage {}

export class CreateLoginWindowMessage extends SingleMessage {}

@FromRenderer('create-lyric-window')
export class CreateLyricWindowMessage extends FromRendererMessage {}

@FromRenderer('lock-lyric-window')
export class LockLyricWindowMessage extends FromRendererMessage { }

export class UnlockLyricMessage extends ToRendererMessage {
  __virid_message_type: string = 'unlock-lyric'
  __virid_target: string = 'lyric'
}

export class ExecuteCommandQueueMessage extends EventMessage {
  constructor(public window: string) {
    super()
  }
}

export class SetCommandQueueMessage extends EventMessage {
  constructor(
    public window: string,
    public command: (window: BrowserWindow) => void
  ) {
    super()
  }
}

export class CheckClipboardMessage extends EventMessage {}

export class ShareMusicCommandMessage extends EventMessage {
  constructor(public url: string) {
    super()
  }
}

export function bindWindowMessages(plugin: MainPlugin) {
  plugin.bindRoute(CloseWindowMessage)
  plugin.bindRoute(MinimizeWindowMessage)
  plugin.bindRoute(MaximizeWindowMessage)
  plugin.bindRoute(HiddenWindowMessage)
  plugin.bindRoute(OpenDialogMessage)
  plugin.bindRoute(CreateLyricWindowMessage)
  plugin.bindRoute(LockLyricWindowMessage)
}
