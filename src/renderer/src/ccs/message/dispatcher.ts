/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-01 16:02:19
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-01 16:41:31
 * @FilePath: /starry/src/renderer/src/ccs/message/dispatcher.ts
 * @Description:事件调度中心
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
/**
 * @description: 事件调度器
 */
export class Dispatcher {
  private pendingTypes = new Set<any>()
  private isRunning = false
  // 定义一个清理回调的空位
  private cleanupHook: (pendingTypes: Set<any>) => void = () => {}

  // 允许外部注入逻辑
  public setCleanupHook(hook: (types: Set<any>) => void) {
    this.cleanupHook = hook
  }
  // 标记某类型消息已到达并等待调度
  public markDirty(eventClass: any, interestMap: Map<any, Array<() => void>>) {
    this.pendingTypes.add(eventClass)
    this.tick(interestMap)
  }

  private tick(interestMap: Map<any, Array<() => void>>) {
    if (this.isRunning) return
    this.isRunning = true

    queueMicrotask(async () => {
      try {
        //运行
        const systemsToRun = new Set<() => any>()
        this.pendingTypes.forEach((type) => {
          interestMap.get(type)?.forEach((sys) => systemsToRun.add(sys))
        })

        const results = Array.from(systemsToRun).map((run) => {
          try {
            return run()
          } catch (e) {
            console.error('System execution error:', e)
            return Promise.resolve()
          }
        })

        await Promise.all(results)
      } finally {
        //清理此次运行的事件
        this.cleanupHook(this.pendingTypes)
        this.pendingTypes.clear()
        this.isRunning = false
      }
    })
  }
}
