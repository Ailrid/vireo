/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-03 09:57:20
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-03 21:38:03
 * @FilePath: /starry/src/renderer/src/ccs/message/types.ts
 * @Description:  消息类型定义
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { MessageWriter } from './io'
export enum MessageStrategy {
  SIGNAL, // 可合并：一个 Tick 内无论发多少次，System 只执行一次
  EVENT // 不可合并：每一个消息实例都必须触发 System 执行
}

export abstract class BaseMessage {
  // 默认为 SIGNAL 模式
  static readonly strategy: MessageStrategy = MessageStrategy.SIGNAL
  static send<T extends typeof BaseMessage>(this: T, ...args: ConstructorParameters<T>) {
    MessageWriter.write(this as any, ...args)
  }
}

/**
 * 不可合并的消息基类
 */
export abstract class EventMessage extends BaseMessage {
  static override readonly strategy = MessageStrategy.EVENT
}

/**
 * 基础错误消息：天生不可合并，必须被精准捕获
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
 * 的基类
 */
export abstract class ControllerMessage extends BaseMessage {}

export type Middleware = (message: BaseMessage, next: () => void) => void
