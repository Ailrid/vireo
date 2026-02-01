/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-31 16:01:12
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-01 17:06:30
 * @FilePath: /starry/src/renderer/src/ccs/adapters/hooks.ts
 * @Description:vue hooks 适配器，用于挂在各种vue魔法装饰器械
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { onMounted, onUnmounted, watch, computed, type WatchStopHandle, isRef } from 'vue'
import { container } from '../ioc'
import log from 'electron-log/renderer'
import { CCS_METADATA } from '../constants'
import { Newable } from 'inversify'
/**
 * @description: vue的hooks适配器，注入IOC容器中的Controller实例，并挂在vue的各种方法
 * @param {Newable} token
 * @return {*}
 */
export function useController<T extends object>(token: Newable): T {
  const instance = container.get<T>(token)
  const proto = Object.getPrototypeOf(instance)
  bindProject(proto, instance)
  const stops = bindWatch(proto, instance)
  // 生命周期
  if (typeof (instance as any).onMounted === 'function') {
    onMounted(() => (instance as any).onMounted())
  }
  onUnmounted(() => {
    stops.forEach((stop) => stop())
    if (typeof (instance as any).onUnmounted === 'function') {
      ;(instance as any).onUnmounted()
    }
  })

  return instance
}

function bindProject(proto: any, instance: any) {
  // 处理 @Project
  const projects = Reflect.getMetadata(CCS_METADATA.PROJECT, proto)
  projects?.forEach(({ propertyKey, path, isAccessor }) => {
    let c: any
    // 如果手写了 get/set
    if (isAccessor) {
      const rawDescriptor = Object.getOwnPropertyDescriptor(proto, propertyKey)
      c = computed({
        get: () => rawDescriptor?.get?.call(instance),
        set: (val) => rawDescriptor?.set?.call(instance, val)
      })
    }
    // 如果没写 get/set，但提供了路径 (path 存在)
    else if (path) {
      c = computed({
        get: () => {
          const value = path.split('.').reduce((obj, key) => obj?.[key], instance)
          return isRef(value) ? value.value : value
        },
        set: (val) => {
          const keys = path.split('.')
          const lastKey = keys.pop()!
          const targetObj = keys.reduce((obj, key) => obj?.[key], instance)
          if (targetObj) {
            const targetValue = targetObj[lastKey]
            // 判断是否为 ref
            if (isRef(targetValue)) {
              targetValue.value = val // 修改 ref 的内部值，保持响应式
            } else {
              targetObj[lastKey] = val // 正常修改 reactive 属性或普通变量
            }
          }
        }
      })
    }
    // 如果既没逻辑也没路径
    else {
      log.warn(`Property ${propertyKey} has @Project() but no logic or path!`)
      return
    }
    // 最后统一定义
    Object.defineProperty(instance, propertyKey, {
      get: () => c.value,
      set: (val) => (c.value = val),
      enumerable: true,
      configurable: true
    })
  })
}

function bindWatch(proto: any, instance: any) {
  // 处理 @Watch
  // hooks.ts -> useController 内部
  const watches: any[] = Reflect.getMetadata(CCS_METADATA.WATCH, proto)
  const stops: WatchStopHandle[] = []
  watches?.forEach(({ source, methodName, options }) => {
    const getter = () => {
      if (typeof source === 'string') {
        // 路径解析
        const val = source.split('.').reduce((obj, key) => obj?.[key], instance)
        return isRef(val) ? val.value : val
      } else {
        // 函数模式
        return source(instance)
      }
    }

    // 绑定 watch
    const stop = watch(getter, (instance as any)[methodName].bind(instance), options)
    stops.push(stop)
  })
  return stops
}
