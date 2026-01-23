/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2025-07-06 17:57:05
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 18:16:22
 * @FilePath: /template/src/main/ipcMain/utils/ipcMain.ts
 * @Description:定义icpMain.on和icpMain.handle的装饰器以及自动注册事件的基类IpcMainRegister
 *
 * Copyright (c) 2025 by ShirahaYuki, All Rights Reserved.
 */
import { ipcMain, type IpcMainInvokeEvent, type IpcMainEvent, type BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { OnChannel, InvokeChannel } from '@main/ipcMain/type'
import { Ok, Err } from 'ts-results'
/**
 * @description: 自动绑定handle事件的装饰器
 * @param {string} channel 消息标识
 * @param {function} errorHandler 错误处理函数
 * @return {*}
 */
export function ipcMainHandle(channel: InvokeChannel): any {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    if (typeof descriptor.value !== 'function') {
      throw new Error(`@ipcMainHandle decorator can only be used on methods.`)
    }
    const originalMethod = descriptor.value

    descriptor.value = function (this: any, ..._args: any[]) {
      const actualListener = async (event: IpcMainInvokeEvent, ...ipcArgs: any[]): Promise<any> => {
        try {
          const result = await originalMethod.apply(this, [event, ...ipcArgs])
          return Ok(result)
        } catch (error: any) {
          log.error(`IpcMain handle channel ${channel} fail.`, error)
          return Err(error.message || 'Unknown Error')
        }
      }
      ipcMain.handle(channel, actualListener)
      this.__ipcMainListeners[channel] = actualListener
    }
    descriptor.value.channel = channel
    return descriptor
  }
}

/**
 * @description: 自动绑定on事件的装饰器
 * @param {string} channel 消息标识
 * @param {function} errorHandler 错误处理函数
 * @return {*}
 */
export function ipcMainOn(channel: OnChannel): any {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    if (typeof descriptor.value !== 'function') {
      throw new Error(`@ipcMainOn decorator can only be used on methods.`)
    }
    const originalMethod = descriptor.value
    descriptor.value = function (this: any, ..._args: any[]) {
      const actualListener = async (event: IpcMainEvent, ...ipcArgs: any[]): Promise<void> => {
        try {
          await originalMethod.apply(this, [event, ...ipcArgs])
        } catch (error: any) {
          // 在单向通讯中，错误通常只能记录日志或通知前端
          log.error(`[IPC_ON_ERROR] Channel: ${channel}`, error)
        }
      }
      ipcMain.on(channel, actualListener)
      this.__ipcMainListeners[channel] = actualListener
    }
    descriptor.value.channel = channel
    return descriptor
  }
}
/**
 * @description: 自动注册所有的IpcMain的基类
 */
export class IpcMainRegister {
  private __ipcMainListeners: {
    [key: string]: ((event: IpcMainEvent, ...args: any[]) => Promise<any>) | undefined
  } = {}
  public mainWindow: BrowserWindow
  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.init()
  }

  /**
   * @description: 朝主窗口发送消息
   * @param {string} channel 消息标识
   * @param {array} args 参数
   * @return {*}
   */
  send(channel: string, ...args: any[]): any {
    this.mainWindow.webContents.send(channel, ...args)
  }
  //绑定所有事件
  init(): void {
    const prototype = Object.getPrototypeOf(this)
    for (const key of Object.getOwnPropertyNames(prototype)) {
      if (typeof prototype[key] === 'function' && key !== 'constructor' && key !== 'init') {
        const channel = prototype[key].channel
        if (channel) {
          // 这里执行的就是装饰器重新定义的 descriptor.value
          ;(this as any)[key]()
        }
      }
    }
  }
  //解除所有事件
  dispose(): void {
    const prototype = Object.getPrototypeOf(this)
    //挨个删除所有监听器
    for (const key of Object.getOwnPropertyNames(prototype)) {
      if (typeof prototype[key] === 'function' && prototype[key].channel) {
        const channel = prototype[key].channel
        const actualListener = this.__ipcMainListeners[channel]
        if (actualListener) {
          ipcMain.removeListener(channel, actualListener)
        }
      }
    }
    this.__ipcMainListeners = {}
  }
}
