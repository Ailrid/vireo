/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-31 19:35:14
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-01 17:05:55
 * @FilePath: /starry/src/renderer/src/ccs/message/eventHub.ts
 * @Description:消息管理中心
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */

/**
 * @description: 事件中心，存储和分发消息
 */
export class EventHub {
  private messages = new Map<any, any[]>()

  push(event: any) {
    const type = event.constructor
    if (!this.messages.has(type)) this.messages.set(type, [])
    this.messages.get(type)!.push(event)
  }

  // 只查看，不删除数据
  peek<T>(type: new (...args: any[]) => T): T[] {
    return this.messages.get(type) || []
  }

  //清理
  clear(types: Set<any>) {
    types.forEach((type) => this.messages.delete(type))
  }
}
