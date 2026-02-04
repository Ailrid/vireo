/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-01 15:47:24
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-04 19:04:12
 * @FilePath: /starry/src/renderer/src/ccs/decorators/vue.ts
 * @Description:各种Vue的魔法装饰器
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Newable } from 'inversify'
import { CCS_METADATA } from '../constants'
import type { WatchOptions } from 'vue'

/**
 * @description:实现Watch
 * 用法：@Watch('a.b.c') 或 @Watch(instance => instance.a.b.c)
 */

// 重载 1: 监听 Controller 自身变量
export function Watch<T>(source: (instance: T) => any, options?: WatchOptions): any

// 重载 2: 监听全局 Component 变量
export function Watch<C>(
  component: Newable<C>,
  source: (comp: C) => any,
  options?: WatchOptions
): any

// 实现逻辑
export function Watch(arg1: any, arg2?: any, arg3?: any) {
  return (target: any, methodName: string) => {
    const existing = Reflect.getMetadata(CCS_METADATA.WATCH, target) || []

    if (typeof arg2 === 'function') {
      // 重载 2: Watch(Component, (c) => c.prop, options)
      existing.push({
        type: 'component',
        componentClass: arg1,
        source: arg2,
        options: arg3,
        methodName
      })
    } else {
      // 重载 1: Watch((i) => i.prop, options)
      existing.push({
        type: 'local',
        source: arg1,
        options: arg2,
        methodName
      })
    }

    Reflect.defineMetadata(CCS_METADATA.WATCH, existing, target)
  }
}
/**
 * @description: 实现数据投影
 * 用法：@Project() 或 @Project('a.b.c')
 */
// 重载 1: 内部投影 @Project(i => i.someService.data)
export function Project<T>(source: (instance: T) => any): any

// 重载 2: 跨组件投影 @Project(UserComponent, c => c.name)
export function Project<C>(component: Newable<C>, source: (comp: C) => any): any

// 实现逻辑
export function Project(arg1: any, arg2?: any) {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    const existing = Reflect.getMetadata(CCS_METADATA.PROJECT, target) || []

    const metadata = {
      propertyKey,
      isAccessor: !!(descriptor?.get || descriptor?.set),
      // 这里的逻辑和 Watch 保持高度一致
      type: typeof arg2 === 'function' ? 'component' : 'local',
      componentClass: typeof arg2 === 'function' ? arg1 : null,
      source: typeof arg2 === 'function' ? arg2 : arg1
    }

    existing.push(metadata)
    Reflect.defineMetadata(CCS_METADATA.PROJECT, existing, target)
  }
}
/**
 * @description: 给数据增加响应式
 * 用法：@Responsive()
 */
export function Responsive() {
  return (target: any, propertyKey: string) => {
    // 记录哪些属性需要变成响应式
    const props = Reflect.getMetadata(CCS_METADATA.RESPONSIVE, target) || []
    props.push(propertyKey)
    Reflect.defineMetadata(CCS_METADATA.RESPONSIVE, props, target)
  }
}

/**
 * @description: 声明式生命周期钩子
 * 用法：@OnHook("onMounted")
 */
export function OnHook(
  hookName: 'onMounted' | 'onUnmounted' | 'onUpdated' | 'onActivated' | 'onDeactivated'
) {
  return (target: any, methodName: string) => {
    const existing = Reflect.getMetadata(CCS_METADATA.LIFE_CRICLE, target) || []
    existing.push({ hookName, methodName })
    Reflect.defineMetadata(CCS_METADATA.LIFE_CRICLE, existing, target)
  }
}
/**
 * @description: 万能 Hook 注入装饰器
 * 用法：@Use(() => useRoute()) public route!: RouteLocationNormalized
 */
export function Use(hookFactory: () => any) {
  return (target: any, propertyKey: string) => {
    const existing = Reflect.getMetadata(CCS_METADATA.USE_HOOKS, target) || []
    existing.push({ propertyKey, hookFactory })
    Reflect.defineMetadata(CCS_METADATA.USE_HOOKS, existing, target)
  }
}
/**
 * @description: Inherit注入装饰器
 * 用法：@Inherit(Contronller,(instance) => instance.xxxx) public data!: SomeType
 */
export function Inherit(token: Newable, id: string, selector?: (instance: any) => any) {
  return (target: any, propertyKey: string) => {
    const metadata = Reflect.getMetadata(CCS_METADATA.INHERIT, target) || []
    metadata.push({ propertyKey, token, id, selector })
    Reflect.defineMetadata(CCS_METADATA.INHERIT, metadata, target)
  }
}

/**
 * @description: 标记一个属性是从外部环境(context)注入的
 * 纯元数据标记，什么也不干，方便后期做自动化文档或 TS 类型提示
 */
export function Env() {
  return (_target: any, _propertyKey: string) => {
    // 即使现在不存元数据，有了这个装饰器，Controller 看起来也会更清晰
  }
}
