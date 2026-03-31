import { FromRenderMessage, FromRender, ToRenderMessage } from '@virid/main'
@FromRender('close-window')
export class CloseWindowMessage extends FromRenderMessage {}

@FromRender('minimize-window')
export class MinimizeWindowMessage extends FromRenderMessage {}

@FromRender('maximize-window')
export class MaximizeWindowMessage extends FromRenderMessage {}

@FromRender('open-dialog')
export class OpenDialogMessage extends FromRenderMessage {
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
export class RenderDialogMessage extends ToRenderMessage {
  __virid_target: string = 'renderer'
  __virid_messageType: string = 'file-dialog'
  constructor(public path: string) {
    super()
  }
}

export class PlaySongMessage extends ToRenderMessage {
  __virid_target: string = 'renderer'
  __virid_messageType: string = 'play-song'
  constructor(public id: string) {
    super()
  }
}

export class SetPlaylistMessage extends ToRenderMessage {
  __virid_target: string = 'renderer'
  __virid_messageType: string = 'set-playlist'
  constructor(public id: string) {
    super()
  }
}
