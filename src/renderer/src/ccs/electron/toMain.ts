import { ToMainMessage } from '@virid/renderer'
import { System, ErrorMessage, InfoMessage, WarnMessage, ViridApp } from '@virid/core'
import { type ThemeConfig } from '../settings'
export class CloseWindowMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type: string = 'close-window'
  constructor() {
    super()
  }
}

export class MinimizeWindowMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type: string = 'minimize-window'
}

export class MaximizeWindowMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type: string = 'maximize-window'
}

export class HiddenWindowMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type: string = 'hidden-window'
}

export class RendererErrorMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type: string = 'renderer-error'
  constructor(
    public message: string,
    public context?: string
  ) {
    super()
  }
}

export class RendererWarnMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type: string = 'renderer-warn'
  constructor(public context: string) {
    super()
  }
}

export class RendererInfoMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type: string = 'renderer-info'
  constructor(public context: string) {
    super()
  }
}

export class CreateLyricWindowMessage extends ToMainMessage {
  __virid_target = 'main'
  __virid_message_type: string = 'create-lyric-window'
}

export class _SyncLyricMessage extends ToMainMessage {
  __virid_target = 'lyric'
  __virid_message_type = 'sync-lyric'
  constructor(
    public theme: ThemeConfig,
    public lyric: {
      time: number
      text: string
      trans: string
    },
    public isPlaying: boolean
  ) {
    super()
  }
}

/**
 * * 错误处理和日志系统,直接转发到主进程一份去
 */
export class LogSystem {
  @System()
  static error(message: ErrorMessage) {
    // 这里必须要检查是否预加载脚本加载完成了，不然会导致递归报错卡死
    // 因为RendererErrorMessage出错了，又会导致ErrorMessage被发送，然后继续出错，在一个微队列里直接永远死循环
    if (!window.__VIRID_BRIDGE__) return
    return new RendererErrorMessage(message.error.message, message.context)
  }

  @System()
  static warn(message: WarnMessage) {
    return new RendererWarnMessage(message.context)
  }

  @System()
  static info(message: InfoMessage) {
    return new RendererInfoMessage(message.context)
  }
}

export function registerToMainSystems(app: ViridApp) {
  app.register(LogSystem.error)
  app.register(LogSystem.warn)
  app.register(LogSystem.info)
}
