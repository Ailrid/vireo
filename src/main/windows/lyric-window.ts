import { BrowserWindow } from 'electron'
import { CreateLyricWindowMessage, LockLyricWindowMessage, UnlockLyricMessage } from './message'
import { System, MessageWriter, ViridApp } from '@virid/core'
import { join } from 'path'
import { WindowComponent } from './component'
import { ElectronComponent } from '@main/electron'

export class LyricWindowSystem {
  /*
   * 创建登陆窗口
   */
  @System({
    messageClass: CreateLyricWindowMessage
  })
  static createLyricWindow(windowComponent: WindowComponent, electronComponent: ElectronComponent) {
    if (windowComponent.windows.has('lyricWindow')) {
      // 解锁窗口，并通知窗口自己已经解锁
      const lyricWindow = windowComponent.windows.get('lyricWindow')!
      lyricWindow.setIgnoreMouseEvents(false)
      lyricWindow.focus()
      UnlockLyricMessage.send()
      return
    }
    // 第一次创建歌词窗口
    const lyricWindow = new BrowserWindow({
      width: 1200,
      height: 150,
      transparent: true,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: false,
      backgroundColor: '#00000000',
      alwaysOnTop: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })
    // 注册自己
    windowComponent.windows.set('lyricWindow', lyricWindow)
    lyricWindow.on('closed', () => {
      windowComponent.windows.delete('lyricWindow')
    })
    lyricWindow.on('ready-to-show', () => {
      lyricWindow.show()
    })
    lyricWindow.loadURL(`http://localhost:${electronComponent.port}/lyric.html`)

    MessageWriter.info(
      '[LyricWindowSystem] Created LyricWindow: Initialize window and mount page completed.'
    )
  }

  @System({
    messageClass: LockLyricWindowMessage
  })
  static lockLyricWindow(windowComponent: WindowComponent) {
    // 窗口要求锁定自身
    if (!windowComponent.windows.has('lyricWindow')) return
    const lyricWindow = windowComponent.windows.get('lyricWindow')!
    lyricWindow.setAlwaysOnTop(true, 'screen-saver')
    lyricWindow.setIgnoreMouseEvents(true, { forward: true })
  }
}

export function registerLyricWindowSystems(app: ViridApp) {
  app.register(LyricWindowSystem.createLyricWindow)
  app.register(LyricWindowSystem.lockLyricWindow)
}
