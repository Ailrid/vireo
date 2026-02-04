/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-31 16:01:12
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-04 18:48:01
 * @FilePath: /starry/src/renderer/src/ccs/adapters/hooks.ts
 * @Description:vue hooks 适配器，用于挂在各种vue魔法装饰器械
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import {
  bindProject,
  bindResponsive,
  bindWatch,
  createDeepShield,
  bindHooks,
  bindUseHooks,
  bindListener,
  GlobalRegistry
} from './bind'
import { onUnmounted, useAttrs } from 'vue'
import { container } from '../ioc'
import { CCS_METADATA } from '../constants'
import { Newable } from 'inversify'
import { MessageWriter } from '../message'

/**
 * @description: vue的hooks适配器，注入IOC容器中的Controller实例，并挂在vue的各种方法
 * @param {Newable} token
 * @return {*}
 */
export function useController<T extends object>(
  token: Newable,
  options?: { id?: string; context?: any }
): T {
  const instance = container.get<T>(token)
  //注入vue的乱七八糟的context
  const reactiveContext = options?.context || useAttrs()
  if (reactiveContext) {
    injectContext(reactiveContext, instance)
  }

  // 检查身份 Controller
  const isController = Reflect.hasMetadata(CCS_METADATA.CONTROLLER, token)
  // 建立真身仓库 (此时 instance 里的 service 还是干净的原始对象)
  const rawDeps: Record<string, any> = {}
  if (isController) {
    Object.keys(instance).forEach((key) => {
      const dep = (instance as any)[key]
      if (dep && typeof dep === 'object' && dep.constructor) {
        if (Reflect.hasMetadata(CCS_METADATA.COMPONENT, dep.constructor)) {
          rawDeps[key] = dep // 存下真身
        }
      }
    })
  }

  // 处理@Responsive，将属性变成响应式的
  bindResponsive(instance)
  //绑定各种魔法装饰器
  const proto = Object.getPrototypeOf(instance)
  // @Project装饰器
  bindProject(proto, instance, rawDeps)
  // @Use装饰器
  bindUseHooks(proto, instance)
  // @Watch装饰器
  const stops = bindWatch(proto, instance)
  // @Listener装饰器
  // 运行时动态挂载监听器
  const unbindList = bindListener(proto, instance)
  // 给 Controller 上的注入项套上护盾，禁止写操作
  if (isController) {
    Object.keys(rawDeps).forEach((key) => {
      // 从这一刻起，直接访问 instance.service 就会报错
      ;(instance as any)[key] = createDeepShield(rawDeps[key], key, '')
    })
  }
  // 生命周期钩子
  bindHooks(proto, instance)
  //绑定全局注册表
  //如果有id,就去注册
  let unbindRegister = () => true
  if (options?.id) {
    unbindRegister = GlobalRegistry.set(options?.id, instance)
  }
  onUnmounted(() => {
    stops.forEach((stop) => stop())
    unbindList.forEach((unreg) => unreg())
    unbindRegister()
    // 自动卸载信号处理器，防止 Controller 销毁后残留
  })

  return instance
}

/**
u* @description: 把槽或者其他乱七八糟的东西传递过来的上下文注入到controller里
 * @param {*} context 上下文对象
 * @param {*} instance controller实例
 */
function injectContext(context: any, instance: any) {
  if (context && typeof context === 'object') {
    Object.keys(context).forEach((key) => {
      Object.defineProperty(instance, key, {
        // Getter 确保了 @Watch 的依赖收集能一路穿透到 Vue 源头
        get: () => context[key],

        // 处理写入逻辑
        set: (val) => {
          // 如果 context 是只读的 (比如 attrs)，Vue 内部会报错
          // 我们这里可以增加一层架构上的提示
          if (context[key] === val) return

          try {
            // 尝试直接修改源数据（支持某些 slot props 的双向绑定）
            context[key] = val
          } catch (e) {
            // console.error(`[CCS] 属性 "${key}" 是环境受限的，无法在逻辑层直接修改。`)
            MessageWriter.error(e as Error, `[CCS Context] Set Failed: "${key}" is only readable.`)
          }
        },
        enumerable: true,
        configurable: true
      })
    })
  }
}
