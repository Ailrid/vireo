/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-01 15:32:13
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-04 20:40:14
 * @FilePath: /starry/src/renderer/src/ccs/message/index.ts
 * @Description:
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
// ccs/message/index.ts

import { MessageInternal } from './internal'
import { BaseMessage, Constructor, Hook, Middleware } from './types'
import { ExecutionTask } from './dispatcher'
//  统一导出
export * from './types'
export * from './io'
export * from './registry'

export function useMiddleware(mw: Middleware) {
  MessageInternal.use(mw)
}

/**
 * 导出的类型完善的挂载函数
 */
/**
 * 外部导出：类型推导完善的挂载函数
 */
export const onBeforeExecute = <T extends BaseMessage>(type: Constructor<T>, hook: Hook<T>) =>
  ExecutionTask.addBefore(type, hook)

export const onAfterExecute = <T extends BaseMessage>(type: Constructor<T>, hook: Hook<T>) =>
  ExecutionTask.addAfter(type, hook)
