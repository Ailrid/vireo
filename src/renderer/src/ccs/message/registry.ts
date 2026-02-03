/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-03 10:00:24
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-03 21:35:48
 * @FilePath: /starry/src/renderer/src/ccs/message/registry.ts
 * @Description:给消息的注册器，收集所有的system函数
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// ccs/message/registry.ts
import { MessageInternal } from './internal'
import { ErrorMessage } from './types'
import { MessageReader } from './io'

export interface SystemTask {
  fn: () => any
  priority: number
}

/**
 * @description: 消息注册器 - 负责将系统函数或监听器与消息类型关联
 */
export class MessageRegistry {
  /**
   * 注册消息并返回一个卸载函数
   * 这种模式能完美适配 Controller 的生命周期销毁
   */
  static register(
    eventClass: any,
    systemFn: (...args: any[]) => any,
    priority: number = 0
  ): () => void {
    const interestMap = MessageInternal.interestMap
    const systems = interestMap.get(eventClass) || []

    // 检查重复注册
    const existingIndex = systems.findIndex((s) => s.fn === systemFn)
    if (existingIndex === -1) {
      systems.push({ fn: systemFn, priority })
      systems.sort((a, b) => b.priority - a.priority)
      interestMap.set(eventClass, systems)
    }

    /**
     * 返回卸载函数
     */
    return () => {
      const currentSystems = interestMap.get(eventClass)
      if (currentSystems) {
        const index = currentSystems.findIndex((s) => s.fn === systemFn)
        if (index !== -1) {
          currentSystems.splice(index, 1)
          // 如果该消息类型没有任何监听者了，清理掉 Key，保持内存干净
          if (currentSystems.length === 0) {
            interestMap.delete(eventClass)
          }
        }
      }
    }
  }
}

/**
 * 注册全局默认错误处理系统
 */
MessageRegistry.register(ErrorMessage, () => {
  const errors = new MessageReader(ErrorMessage).read()
  errors.forEach((err) => {
    console.error(`[CCS Error] Global Error Caught: [${err.context}]:`, err.error)
  })
})
