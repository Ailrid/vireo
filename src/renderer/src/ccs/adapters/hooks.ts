/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-31 16:01:12
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-03 21:44:50
 * @FilePath: /starry/src/renderer/src/ccs/adapters/hooks.ts
 * @Description:vue hooks 适配器，用于挂在各种vue魔法装饰器械
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import {
  bindInstantProject,
  bindProject,
  bindResponsive,
  bindWatch,
  createDeepShield,
  bindHooks,
  bindUseHooks,
  bindListener
} from './bind'
import { onUnmounted } from 'vue'
import { container } from '../ioc'
import { CCS_METADATA } from '../constants'
import { Newable } from 'inversify'
/**
 * @description: vue的hooks适配器，注入IOC容器中的Controller实例，并挂在vue的各种方法
 * @param {Newable} token
 * @return {*}
 */
export function useController<T extends object>(token: Newable): T {
  const instance = container.get<T>(token)

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
  // @InstantProject装饰器
  bindInstantProject(proto, instance)
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

  onUnmounted(() => {
    stops.forEach((stop) => stop())
    unbindList.forEach((unreg) => unreg())
    // 自动卸载信号处理器，防止 Controller 销毁后残留
  })

  return instance
}
