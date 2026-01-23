/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2025-07-06 17:57:05
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-23 10:19:59
 * @FilePath: /starry/src/renderer/src/utils/icpRender/icpRender.ts
 * @Description:定义icpRender装饰器和基类
 *
 * Copyright (c) 2025 by ShirahaYuki, All Rights Reserved.
 */
import log from 'electron-log/renderer'
import { Ok, Err } from 'ts-results'
import type { Result } from 'ts-results'
import type { OnChannel, InvokeChannel } from './type'
import { match, P } from 'ts-pattern'
/**
 * @description: 自动绑定 on 事件的装饰器 (Renderer)
 */
export function ipcRenderOn(channel: string) {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    if (typeof descriptor.value !== 'function') {
      throw new Error(`@ipcRenderOn decorator can only be applied to methods.`)
    }
    const originalMethod = descriptor.value
    descriptor.value = function (this: any) {
      // 这里的 actualListener 主要是监听主进程主动推过来的消息
      const actualListener = async (event: any, ...ipcArgs: any[]): Promise<void> => {
        try {
          await originalMethod.apply(this, [event, ...ipcArgs])
        } catch (error: any) {
          log.error(`[IpcRender On] Channel: ${channel} error:`, error)
        }
      }
      window.electron.ipcRenderer.on(channel, actualListener)
      this.__ipcMainListeners[channel] = actualListener
    }
    descriptor.value.channel = channel
    return descriptor
  }
}

/**
 * @description: 自动注册所有的 IpcRender 的基类
 */
export class IpcRenderRegister {
  private __ipcMainListeners: {
    [key: string]: ((event: any, ...args: any[]) => Promise<any>) | undefined
  } = {}

  constructor() {
    this.init()
  }

  static async invoke<T>(channel: InvokeChannel, ...args: any[]): Promise<Result<T, string>> {
    try {
      const res = await window.electron.ipcRenderer.invoke(channel, ...args)
      return match(res)
        .with({ ok: true, val: P.select() }, (value) => Ok(value as T))
        .with({ ok: false, val: P.select() }, (error) => Err(error as string))
        .otherwise(() => Err('Unexpected response format'))
    } catch (error: any) {
      return Err(error.message || 'IPC_INTERNAL_ERROR')
    }
  }

  /**
   * @description: 给主进程发送单向消息
   */
  static send(channel: OnChannel, ...args: any[]): void {
    window.electron.ipcRenderer.send(channel, ...args)
  }

  // 绑定所有装饰器方法
  init(): void {
    const prototype = Object.getPrototypeOf(this)
    for (const key of Object.getOwnPropertyNames(prototype)) {
      if (typeof prototype[key] === 'function' && key !== 'constructor' && key !== 'init') {
        const channel = prototype[key].channel
        if (channel) {
          ;(this as any)[key]()
        }
      }
    }
  }

  // 解除监听器
  dispose(): void {
    for (const channel in this.__ipcMainListeners) {
      const actualListener = this.__ipcMainListeners[channel]
      if (actualListener) {
        window.electron.ipcRenderer.removeListener(channel, actualListener as any)
      }
    }
    this.__ipcMainListeners = {}
  }
}
