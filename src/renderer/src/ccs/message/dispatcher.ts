/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-01 16:02:19
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-04 21:29:30
 * @FilePath: /starry/src/renderer/src/ccs/message/dispatcher.ts
 * @Description:事件调度中心
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
/**
 * @description: 事件调度器
 */
import { MessageWriter } from './io'
import {
  SingleMessage,
  EventMessage,
  BaseMessage,
  Constructor,
  Hook,
  CCSSystemContext,
  SystemTask
} from './types'
import { MessageInternal } from './internal'

export class ExecutionTask {
  private static beforeHooks: Array<{ type: Constructor<any>; handler: Hook<any> }> = []
  private static afterHooks: Array<{ type: Constructor<any>; handler: Hook<any> }> = []

  constructor(
    public fn: (...args: any[]) => any,
    public priority: number,
    public message: any,
    public context: CCSSystemContext
  ) {}

  private triggerHooks(hooks: Array<{ type: Constructor<any>; handler: Hook<any> }>) {
    const sample = Array.isArray(this.message) ? this.message[0] : this.message
    if (!sample) return

    for (const hook of hooks) {
      if (sample instanceof hook.type) {
        try {
          const result = hook.handler(this.message, this.context)
          if (result instanceof Promise) {
            result.catch((e) =>
              MessageWriter.error(e, `[CCS Hook] Async Hook Error: ${hook.type.name}`)
            )
          }
        } catch (e) {
          MessageWriter.error(
            e as Error,
            `[CCS Hook] Hook Execute Failed: Triggered by: ${sample.constructor.name}, Registered type: ${hook.type.name}`
          )
        }
      }
    }
  }

  public execute(arg?: any): any {
    // 执行前置钩子
    this.triggerHooks(ExecutionTask.beforeHooks)

    // 执行核心业务逻辑
    const result = this.fn(arg)

    // 分支处理
    if (result instanceof Promise) {
      // 异步使用 then 挂载后置逻辑
      return result
        .then((resolvedValue) => {
          this.triggerHooks(ExecutionTask.afterHooks)
          return resolvedValue
        })
        .catch((e) => {
          MessageWriter.error(e, `[CCS Task] Async Execution Error: ${this.fn.name}`)
        })
    } else {
      // 同步直接执行后置钩子并返回
      this.triggerHooks(ExecutionTask.afterHooks)
      return result
    }
  }

  static addBefore<T extends BaseMessage>(type: Constructor<T>, hook: Hook<T>) {
    this.beforeHooks.push({ type, handler: hook })
  }

  static addAfter<T extends BaseMessage>(type: Constructor<T>, hook: Hook<T>) {
    this.afterHooks.push({ type, handler: hook })
  }
}

export class Dispatcher {
  private dirtySignalTypes = new Set<any>()
  private eventQueue: EventMessage[] = []
  private isRunning = false
  private tickCount = 0
  private cleanupHook: (types: Set<any>) => void = () => {}

  public setCleanupHook(hook: (types: Set<any>) => void) {
    this.cleanupHook = hook
  }

  /**
   * 标记脏数据：根据基类判断进入哪个池子
   */
  public markDirty(message: any) {
    if (message instanceof EventMessage) {
      // EventMessage：顺序追加，不合并
      this.eventQueue.push(message)
    } else if (message instanceof SingleMessage) {
      // SingleMessage：按类型合并
      this.dirtySignalTypes.add(message.constructor)
    }
  }

  public tick(interestMap: Map<any, SystemTask[]>) {
    if (this.isRunning || (this.dirtySignalTypes.size === 0 && this.eventQueue.length === 0)) return

    // 死循环防御
    if (this.tickCount > 100) {
      this.tickCount = 0
      MessageInternal.eventHub.reset()
      MessageWriter.error(new Error('[CCS Dispatcher] Deadlock: Recursive loop detected.'))
      return
    }

    this.isRunning = true
    this.tickCount++

    queueMicrotask(() => {
      // 交换双缓冲区，锁定当前 Tick 数据
      MessageInternal.eventHub.flip()
      // 拍下当前待处理任务的快照
      const signalSnapshot = new Set(this.dirtySignalTypes)
      const eventSnapshot = [...this.eventQueue]
      // 立即清空队列，允许 System 在执行时产生新消息进入 staging
      this.dirtySignalTypes.clear()
      this.eventQueue = []

      const tasks: ExecutionTask[] = []

      // 收集 EVENT 任务 ,从前往后每一条消息执行所有关联 System
      for (const msg of eventSnapshot) {
        const systems = interestMap.get(msg.constructor) || []
        systems.forEach((s) => {
          //拿到Context
          tasks.push(new ExecutionTask(s.fn, s.priority, msg, (s.fn as any).ccsContext))
        })
      }
      // 收集 SIGNAL 任务 (每个 System 针对该类型只跑一次)
      // 对 System 函数引用进行去重，防止同一个类型触发多次重复的 SIGNAL 处理
      const signalFnSet = new Set<any>()
      for (const type of signalSnapshot) {
        const systems = interestMap.get(type) || []
        systems.forEach((s) => {
          if (!signalFnSet.has(s.fn)) {
            tasks.push(
              new ExecutionTask(
                s.fn,
                s.priority,
                MessageInternal.eventHub.peekSignal(type),
                (s.fn as any).ccsContext
              )
            )
            signalFnSet.add(s.fn)
          }
        })
      }
      // 无论消息类型，按照 System 定义的优先级排序
      tasks.sort((a, b) => b.priority - a.priority)
      // 执行任务流
      for (const task of tasks) {
        try {
          const result = task.execute()
          // 如果是 Promise，只管注册一个 catch 防止崩溃，不 await 它
          if (result instanceof Promise) {
            result.catch((e) =>
              MessageWriter.error(e, `[CCS Dispatcher] Async Error: ${task.fn.name}`)
            )
          }
        } catch (e) {
          MessageWriter.error(e as Error, `[CCS Dispatcher] Sync Error: ${task.fn.name}`)
        }
      }
      // 立即进行清理
      const processedTypes = new Set(signalSnapshot)
      eventSnapshot.forEach((m) => processedTypes.add(m.constructor))
      this.cleanupHook(processedTypes)
      // 释放锁并尝试下一轮执行
      this.isRunning = false
      if (this.dirtySignalTypes.size > 0 || this.eventQueue.length > 0) {
        // 此时 tick 立即进入下一轮，由于不需要异步返回的结果，直接不管就行
        this.tick(interestMap)
      } else {
        this.tickCount = 0
      }
    })
  }
}
