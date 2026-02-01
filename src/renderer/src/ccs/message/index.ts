/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-01 15:32:13
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-01 17:41:54
 * @FilePath: /starry/src/renderer/src/ccs/message/index.ts
 * @Description:
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { EventHub } from './eventHub'
import { Dispatcher } from './dispatcher'
class MessageInternal {
  static readonly eventHub = new EventHub()
  static readonly dispatcher = new Dispatcher()
  static readonly interestMap = new Map<any, Array<() => void>>()

  static {
    // 连线：把 Hub 的清理逻辑注入 Dispatcher
    this.dispatcher.setCleanupHook((snapshot) => {
      this.eventHub.clear(snapshot)
    })
  }
}

// 消息基类，方便管理
export abstract class BaseMessage {}

/**
 * @description: 写入消息（老大唯一的对外传谕接口）
 */
export class MessageWriter {
  public static write<T extends BaseMessage>(message: T): void {
    const eventClass = message.constructor
    // 1. 存入数据
    MessageInternal.eventHub.push(message)
    // 2. 标记脏类型
    MessageInternal.dispatcher.markDirty(eventClass)
    // 3. 尝试启动调度（内部有 isRunning 锁和 snapshot 机制，绝对安全）
    MessageInternal.dispatcher.tick(MessageInternal.interestMap)
  }
}

/**
 * @description: 读取消息
 */
// ccs/message/index.ts
export class MessageReader<T extends BaseMessage> {
  constructor(public readonly eventClass: new (...args: any[]) => T) {}
  read(): T[] {
    return MessageInternal.eventHub.peek(this.eventClass)
  }
}

/**
 * @description: 消息注册器
 */
export class MessageRegistry {
  static register(eventClass: any, systemFn: () => void) {
    const systems = MessageInternal.interestMap.get(eventClass) || []
    if (!systems.includes(systemFn)) {
      systems.push(systemFn)
      MessageInternal.interestMap.set(eventClass, systems)
    }
  }

  static getHub() {
    return MessageInternal.eventHub
  }
}
