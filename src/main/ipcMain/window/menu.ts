/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2025-07-06 22:27:43
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:36:55
 * @FilePath: /template/src/main/ipcMain/window/menu.ts
 * @Description: 定义窗口菜单和其他窗口事件相关的ipcMain事件
 *
 * Copyright (c) 2025 by ShirahaYuki, All Rights Reserved.
 */
import { shell, type IpcMainEvent } from 'electron'
import { ipcMainOn, IpcMainRegister } from '../utils/ipcMain'

/**
 * @description: 主窗口菜单icpMain事件
 * @param {BrowserWindow} mainWindow 主窗口
 */
export class WindowMenu extends IpcMainRegister {
  @ipcMainOn('close-window')
  close(_event: IpcMainEvent): void {
    this.mainWindow.close()
  }
  @ipcMainOn('minimize-window')
  minimize(_event: IpcMainEvent): void {
    this.mainWindow.minimize()
  }
  @ipcMainOn('maximize-window')
  maximize(_event: IpcMainEvent): void {
    if (this.mainWindow.isMaximized()) {
      this.mainWindow.unmaximize()
    } else {
      this.mainWindow.maximize()
    }
  }
  @ipcMainOn('hide-window')
  hide(_event: IpcMainEvent): void {
    this.mainWindow.hide()
  }
  @ipcMainOn('open-url')
  openUrl(_event: IpcMainEvent, url: string): void {
    shell.openExternal(url)
  }
}
