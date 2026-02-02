/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-01 16:02:19
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-02 09:43:09
 * @FilePath: /starry/src/renderer/src/ccs/message/dispatcher.ts
 * @Description:事件调度中心
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
/**
 * @description: 事件调度器
 */
// ccs/message/dispatcher.ts

export class Dispatcher {
  // 定义两个缓冲区
  private backBuffer = new Set<any>() // 后台缓冲区：负责接收新消息 (Write)
  private isRunning = false
  private cleanupHook: (types: Set<any>) => void = () => {}

  public setCleanupHook(hook: (types: Set<any>) => void) {
    this.cleanupHook = hook
  }

  public markDirty(eventClass: any) {
    // 永远只往后台缓冲区塞消息
    this.backBuffer.add(eventClass)
  }

  public tick(interestMap: Map<any, Array<() => void>>) {
    // 如果已经在执行，或者没活干，直接返回
    if (this.isRunning || this.backBuffer.size === 0) return
    this.isRunning = true

    queueMicrotask(async () => {
      // 交换缓冲区
      // 把后台缓冲区的内容全拿到 frontBuffer，然后立刻清空后台
      const frontBuffer = new Set(this.backBuffer)
      this.backBuffer.clear()

      try {
        // 收集并派发当前这一波任务
        const systemsToRun = new Set<() => any>()
        frontBuffer.forEach((type) => {
          interestMap.get(type)?.forEach((sys) => systemsToRun.add(sys))
        })

        for (const run of systemsToRun) {
          try {
            const result = run()
            if (result instanceof Promise) {
              result.catch((e) => console.error('[CCS] Async System Error:', e))
            }
          } catch (e) {
            console.error('[CCS] System Error:', e)
          }
        }

        // 清理当前这一波的消息
        this.cleanupHook(frontBuffer)
      } finally {
        this.isRunning = false

        // 检查后台缓冲区是否有新活
        // 如果处理期间产生了新消息，不再原地 while 循环
        // 而是递归触发一个新的 tick，即申请一个新的微任务
        if (this.backBuffer.size > 0) {
          this.tick(interestMap)
        }
      }
    })
  }
}
