import { Tray, Menu, nativeImage } from 'electron'
import {
  NextSongMessage,
  PlayOrPauseMessage,
  PreviousSongMessage,
  ShowWindowMessage,
  CreateMainWindowMessage,
  BackupAndCloseMessage
} from './message'
import { System, ViridApp } from '@virid/core'
import iconPath from '../../../resources/icon.png?asset'
import { WindowComponent } from './component'

export class TraySystem {
  @System({
    messageClass: CreateMainWindowMessage
  })
  static createTray(windowComponent: WindowComponent) {
    let icon = nativeImage.createFromPath(iconPath)
    if (process.platform === 'darwin') {
      icon = icon.resize({ width: 22, height: 22 })
    }
    const tray = new Tray(icon)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '打开',
        type: 'normal',
        click: () => {
          ShowWindowMessage.send()
        }
      },
      {
        label: '上一首',
        type: 'normal',
        click: () => {
          PreviousSongMessage.send()
        }
      },
      {
        label: '播放/暂停',
        type: 'normal',
        click: () => {
          PlayOrPauseMessage.send()
        }
      },
      {
        label: '下一首',
        type: 'normal',
        click: () => {
          NextSongMessage.send()
        }
      },
      {
        label: '退出',
        type: 'normal',
        click: () => {
          // 注意！！这里要发给主窗口让他主动备份歌单后自己关闭，不能直接关闭否则歌单丢失！！
          windowComponent.windows.get('lyricWindow')?.close()
          BackupAndCloseMessage.send()
        }
      }
    ])
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
      tray.popUpContextMenu(contextMenu)
    })
    tray.on('right-click', () => {
      tray.popUpContextMenu(contextMenu)
    })
    windowComponent.tray = tray
  }
}

export function registerTraySystems(app: ViridApp) {
  app.register(TraySystem.createTray)
}
