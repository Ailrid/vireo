import { BrowserWindow, shell } from 'electron'
import {
  CreateMainWindowMessage,
  ExecuteCommandQueueMessage,
  CheckClipboardMessage,
  CreateLoginWindowMessage
} from './message'
import { System, MessageWriter, ViridApp } from '@virid/core'
import { join } from 'path'
import icon from '../../../resources/icon.png?asset'
import { WindowComponent } from './component'
import { ElectronComponent } from '@main/electron'
import { DatabaseComponent } from '@main/database'

/**
 * * 创建窗口
 */
export class MainWindowSystem {
  /*
   * 创建主窗口
   */
  @System({
    messageClass: CreateMainWindowMessage
  })
  static createMainWindow(
    windowComponent: WindowComponent,
    electronComponent: ElectronComponent,
    dbComponent: DatabaseComponent
  ) {
    if (windowComponent.windows.has('mainWindow')) return
    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: false,
      backgroundColor: '#00000000',
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })
    windowComponent.windows.set('mainWindow', mainWindow)
    // 注册自己
    mainWindow.on('closed', () => {
      windowComponent.windows.delete('mainWindow')
      // 这里记得要销毁系统托盘
      windowComponent.tray?.destroy()
    })
    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
      // 触发命令队列,执行所有缓存命令
      ExecuteCommandQueueMessage.send('mainWindow')
    })

    // 获得焦点时自动检查一遍剪切板
    mainWindow.on('focus', () => {
      CheckClipboardMessage.send()
    })
    mainWindow.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    mainWindow.loadURL(`http://localhost:${electronComponent.port}`)
    mainWindow.webContents.session.cookies.on('changed', (_event, cookie, cause, removed) => {
      if (removed && cookie.name == '__csrf' && cause === 'expired') {
        dbComponent.db.removeCookies()
        CreateLoginWindowMessage.send()
      }
    })

    MessageWriter.info(
      '[MainWindowSystem] Created MainWindow: Initialize window and mount page completed.'
    )
  }
}

export function registerMainWindowSystems(app: ViridApp) {
  app.register(MainWindowSystem.createMainWindow)
}
