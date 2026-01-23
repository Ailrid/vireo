/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2025-07-04 11:50:31
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 17:14:20
 * @FilePath: /template/src/main/ipcMain/index.ts
 * @Description:注册所有的ipcMain事件
 *
 * Copyright (c) 2025 by ShirahaYuki, All Rights Reserved.
 */

import { windowIpc } from './window'
import { type BrowserWindow } from 'electron'

/**
 * @description: 绑定所有ipcMain事件
 * @param {BrowserWindow} mainWindow 主窗口
 * @return {void}
 */
function initIpc(mainWindow: BrowserWindow): void {
  new windowIpc(mainWindow)
}

export { initIpc }
