/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-03 09:57:20
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-04 22:04:57
 * @FilePath: /starry/src/renderer/src/ccs/message/types.ts
 * @Description:  消息类型定义
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Newable } from 'inversify'
import { MessageWriter } from './io'

export abstract class BaseMessage {
  static send<T extends typeof BaseMessage>(this: T, ...args: ConstructorParameters<T>) {
    MessageWriter.write(this as any, ...args)
  }
  public senderInfo?: {
    fileName: string
    line: number
    timestamp: number
  }

  constructor() {
    // 仅在开发模式下开启，避免生产环境性能损耗
    if (process.env.NODE_ENV === 'development') {
      this.senderInfo = this.captureSender()
    }
  }
  private captureSender() {
    const stack = new Error().stack?.split('\n')
    // stack[0] 是 Error 本身
    // stack[1] 是 captureSender
    // stack[2] 是 BaseMessage 的构造函数
    // stack[3] 通常就是调用 MessageWriter.write 的地方
    const callerLine = stack?.[3] || ''
    // 用正则提取出 文件名:行号
    const match = callerLine.match(/\((.*):(\d+):(\d+)\)/)
    return {
      fileName: match ? match[1].split('/').pop()! : 'unknown',
      line: match ? parseInt(match[2]) : 0,
      timestamp: Date.now()
    }
  }
}
/**
 * 可合并的信号基类
 */
export abstract class SingleMessage extends BaseMessage {
  constructor() {
    super()
  }
}

/**
 * 不可合并的消息基类
 */
export abstract class EventMessage extends BaseMessage {
  constructor() {
    super()
  }
}

/**
 * 基础错误消息：不可合并，必须被精准捕获
 */
export class ErrorMessage extends EventMessage {
  constructor(
    public readonly error: Error,
    public readonly context?: string
  ) {
    super()
  }
}
/**
 * 基础警告消息：不可合并，必须被精准捕获
 */
export class WarnMessage extends EventMessage {
  constructor(public readonly context: string) {
    super()
  }
}

/**
 * 原子修改消息：不可合并，带上组件类型、修改逻辑和语义标签
 */
export class AtomicModifyMessage<T> extends EventMessage {
  constructor(
    public readonly ComponentClass: Newable<T>, // 你要改哪个组件？
    public readonly recipe: (comp: T) => void, // 你打算怎么改？
    public readonly label: string // 为什么要改？
  ) {
    super()
  }
}

/**
 * 的基类
 */
export abstract class ControllerMessage extends SingleMessage {}

export type Middleware = (message: BaseMessage, next: () => void) => void
/**
 * 核心 Hook 类型推理
 */
export type Hook<T extends BaseMessage> = (
  message: T extends SingleMessage ? T[] : T,
  context: CCSSystemContext
) => void | Promise<void>

export type Constructor<T> = new (...args: any[]) => T

// 定义在 types.ts 中
export interface CCSSystemContext {
  params: any[] // 参数类型定义列表
  targetClass: any // System 所在的类
  methodName: string // 方法名
  originalMethod: (...args: any[]) => any
}

export interface SystemTask {
  fn: (...args: any[]) => any
  priority: number
}
