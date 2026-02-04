/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-03 09:59:36
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-04 12:11:56
 * @FilePath: /starry/src/renderer/src/ccs/message/io.ts
 * @Description:  消息读写器
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { MessageInternal } from './internal'
import { BaseMessage, ErrorMessage, WarnMessage } from './types'

type ConstructorArgs<T> = T extends new (...args: infer P) => any ? P : never

export class MessageWriter {
  /**
   * 核心入口：无论是类还是实例，统一交给 Internal 处理
   */
  public static write<T extends BaseMessage, K extends new (...args: any[]) => T>(
    target: K | T,
    ...args: ConstructorArgs<K>
  ): void {
    const instance = typeof target === 'function' ? new (target as any)(...args) : (target as T)

    // 所有的存储、标记脏数据、触发 Tick，全部收拢到 dispatch 一个方法里
    MessageInternal.dispatch(instance)
  }

  /**
   * 快捷方式：系统内部常用
   */
  public static error(e: Error, context?: string): void {
    this.write(new ErrorMessage(e, context))
  }

  public static warn(context: string): void {
    this.write(new WarnMessage(context))
  }
}
