/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-01 15:47:24
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-02 12:12:50
 * @FilePath: /starry/src/renderer/src/ccs/decorators/vue.ts
 * @Description:各种Vue的魔法装饰器
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { CCS_METADATA } from '../constants'
import type { WatchOptions } from 'vue'
/**
 * @description:实现Watch
 * 用法：@Watch('a.b.c') 或 @Watch(instance => instance.a.b.c)
 */
export type WatchSource<T> = string | ((instance: T) => any)
export function Watch<T>(source: WatchSource<T>, options?: WatchOptions) {
  return (target: T, methodName: string, _descriptor: PropertyDescriptor) => {
    const existing = Reflect.getMetadata(CCS_METADATA.WATCH, target as any) || []
    existing.push({
      source,
      methodName,
      options
    })
    Reflect.defineMetadata(CCS_METADATA.WATCH, existing, target as any)
  }
}

/**
 * @description: 实现数据投影
 * 用法：@Project() 或 @Project('a.b.c')
 */
export function Project(path?: string) {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    // 记录路径元数据
    const metadata = {
      propertyKey,
      path, // 如果 path 为空，则视为内部 Computed
      isAccessor: !!(descriptor?.get || descriptor?.set)
    }
    const existing = Reflect.getMetadata(CCS_METADATA.PROJECT, target) || []
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
