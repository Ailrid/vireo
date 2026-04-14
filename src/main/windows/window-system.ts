import { dialog } from 'electron'
import {
  MinimizeWindowMessage,
  CloseWindowMessage,
  MaximizeWindowMessage,
  OpenDialogMessage,
  RenderDialogMessage,
  ExecuteCommandQueueMessage,
  SetCommandQueueMessage,
  ShowWindowMessage,
  HiddenWindowMessage
} from './message'
import { System, Message } from '@virid/core'
import { WindowComponent } from './component'
/**
 * * 与窗口相关的一些事情
 */
export class WindowControllerSystem {
  @System()
  static closeWindow(@Message(CloseWindowMessage) message: CloseWindowMessage) {
    message.senderWindow.close()
  }
  @System()
  static hiddenWindow(@Message(HiddenWindowMessage) message: HiddenWindowMessage) {
    message.senderWindow.hide()
  }
  @System()
  static minimizeWindow(@Message(MinimizeWindowMessage) message: MinimizeWindowMessage) {
    message.senderWindow.minimize()
  }
  @System()
  static maximizeWindow(@Message(MaximizeWindowMessage) message: MaximizeWindowMessage) {
    if (message.senderWindow.isMaximized()) {
      message.senderWindow.unmaximize()
    } else {
      message.senderWindow.maximize()
    }
  }

  @System()
  static showWindow(
    @Message(ShowWindowMessage) message: ShowWindowMessage,
    windowComponent: WindowComponent
  ) {
    if (!windowComponent.windows.has(message.windowName)) return
    windowComponent.windows.get(message.windowName)!.show()
  }

  @System()
  static async openDialog(@Message(OpenDialogMessage) message: OpenDialogMessage) {
    // 调用原生对话框
    const result = await dialog.showOpenDialog(message.senderWindow, message.options)
    // 如果用户没有取消，并且确实选择了文件
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0]
      return new RenderDialogMessage(selectedPath)
    }
    return
  }
}

export class WindowCommandSystem {
  /**
   * * 当窗口准备好时执行对应的所有命令
   */
  @System()
  static windowReady(
    @Message(ExecuteCommandQueueMessage) message: ExecuteCommandQueueMessage,
    windowComponent: WindowComponent
  ) {
    // 执行所有暂存的命令
    const window = windowComponent.windows.get(message.window)
    if (!window) return
    windowComponent.commandQueue.get(message.window)?.forEach(fn => fn(window))
  }

  /**
   * * 缓存所有窗口的命令
   */
  @System()
  static setWindowCommand(
    @Message(SetCommandQueueMessage) message: SetCommandQueueMessage,
    windowComponent: WindowComponent
  ) {
    if (windowComponent.windows.has(message.window)) {
      message.command(windowComponent.windows.get(message.window)!)
      return
    }
    const queue = windowComponent.commandQueue.get(message.window) || []
    queue.push(message.command)
    windowComponent.commandQueue.set(message.window, queue)
    // 如果窗口已经准备好了，直接发射
  }
}
