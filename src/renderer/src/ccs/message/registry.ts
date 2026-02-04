/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-03 10:00:24
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-04 21:47:38
 * @FilePath: /starry/src/renderer/src/ccs/message/registry.ts
 * @Description:给消息的注册器，收集所有的system函数
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// ccs/message/registry.ts

import {
  AtomicModifyMessage,
  CCSSystemContext,
  ErrorMessage,
  SystemTask,
  WarnMessage
} from './types'
import { MessageWriter } from './io'
import { container } from '../ioc'

/**
 * @description: 消息注册器 - 负责将系统函数或监听器与消息类型关联
 */
export class MessageRegistry {
  static interestMap = new Map<any, SystemTask[]>()
  /**
   * 注册消息并返回一个卸载函数
   * 这种模式能完美适配 Controller 的生命周期销毁
   */
  static register(
    eventClass: any,
    systemFn: (...args: any[]) => any,
    priority: number = 0
  ): () => void {
    const systems = this.interestMap.get(eventClass) || []

    const existingIndex = systems.findIndex((s) => s.fn === systemFn)
    if (existingIndex === -1) {
      systems.push({ fn: systemFn, priority })
      systems.sort((a, b) => b.priority - a.priority)
      this.interestMap.set(eventClass, systems)
    } else {
      // 检查重复注册
      const funcName = systemFn.name || 'Anonymous'
      MessageWriter.error(
        new Error(
          `[CCS Error] System Already Registered: Class ${eventClass.name} , Function ${funcName}`
        )
      )
      return () => {}
    }

    /**
     * 返回卸载函数
     */
    return () => {
      const currentSystems = this.interestMap.get(eventClass)
      if (currentSystems) {
        const index = currentSystems.findIndex((s) => s.fn === systemFn)
        if (index !== -1) {
          currentSystems.splice(index, 1)
          // 如果该消息类型没有任何监听者了，清理掉 Key，保持内存干净
          if (currentSystems.length === 0) {
            this.interestMap.delete(eventClass)
          }
        }
      }
    }
  }
}

/**
 * 助手函数：为全局处理器包装上下文
 */
function withContext(params, fn: (...args: any[]) => any, methodName: string) {
  const context: CCSSystemContext = {
    params: params, // 参数类型
    targetClass: Object, // 指向全局 Object 或特定标记类
    methodName: methodName,
    originalMethod: fn
  }
  ;(fn as any).ccsContext = context
  return fn
}

/**
 * 注册全局默认错误处理系统
 */
const globalErrorHandler = (err: ErrorMessage) => {
  console.error(`[CCS Error] Global Error Caught: [${err.context}]:`, err.error)
}
MessageRegistry.register(
  ErrorMessage,
  withContext(ErrorMessage, globalErrorHandler, 'GlobalErrorHandler'),
  -999 // 错误处理通常优先级最低，作为保底
)

/**
 * 注册全局默认警告处理系统
 */
const globalWarnHandler = (warn: WarnMessage) => {
  console.warn(`[CCS Warn] Global Warn Caught: [${warn.context}]`, warn)
}
MessageRegistry.register(
  WarnMessage,
  withContext(WarnMessage, globalWarnHandler, 'GlobalWarnHandler'),
  -999
)

/**
 * 注册全局原子修改处理器
 * 它是整个架构中唯一允许直接操作 raw 数据的“合法特权区”
 */
const atomicModifyHandler = (modifications: AtomicModifyMessage<any>) => {
  // 从 Registry 拿到未经 Proxy 劫持的原始对象 (Raw)
  const rawComponent = container.get(modifications.ComponentClass)

  if (!rawComponent) {
    console.error(
      `[CCS Modify] Component Not Found: Component ${modifications.ComponentClass.name} not found in Registry.`
    )
    return
  }
  // 执行修改逻辑
  try {
    modifications.recipe(rawComponent)
    // 记录显式的审计日志
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[CCS Modify] Successfully: [${modifications.label}] on ${modifications.ComponentClass.name}`
      )
    }
  } catch (e) {
    MessageWriter.error(e as Error, `[CCS Error] Modify Failed: [${modifications.label}]`)
  }
}

MessageRegistry.register(
  AtomicModifyMessage,
  withContext(AtomicModifyMessage<any>, atomicModifyHandler, 'GlobalAtomicModifier'),
  1000 // 修改器优先级通常极高，确保状态第一时间更新
)
