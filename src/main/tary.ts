/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2025-07-09 23:24:32
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 19:04:31
 * @FilePath: /template/src/main/tary.ts
 * @Description:注册系统托盘
 *
 * Copyright (c) 2025 by ShirahaYuki, All Rights Reserved.
 */
import { Tray, Menu, nativeImage, type BrowserWindow } from 'electron'
import iconPath from '@resources/icon.png?asset'
export function createTray(mainWindow: BrowserWindow): Tray {
  const icon = nativeImage.createFromPath(iconPath)
  const tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开',
      type: 'normal',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: '退出',
      type: 'normal',
      click: () => {
        mainWindow.close()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
  return tray
}
