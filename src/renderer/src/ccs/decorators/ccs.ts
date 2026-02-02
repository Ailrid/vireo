/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-31 16:17:36
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-02 15:41:27
 * @FilePath: /starry/src/renderer/src/ccs/decorators/ccs.ts
 * @Description: ccs核心魔法装饰器合集
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { container } from '@/ccs/ioc'
import { MessageReader, MessageRegistry, BaseMessage } from '../message'
import { CCS_METADATA } from '../constants'
import { injectable } from 'inversify'
/**
 * @description: 自动注入 Service 和 MessageReader 的系统装饰器
 */
export function System() {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    const types = Reflect.getMetadata('design:paramtypes', target, key) || []
    const readerConfigs = Reflect.getMetadata(CCS_METADATA.MESSAGE, target, key) || []

    const wrappedSystem = function () {
      const args = types.map((type: any, index: number) => {
        const config = readerConfigs.find((c: any) => c.index === index)
        if (config) {
          return new MessageReader(config.eventClass)
        }
        return container.get(type)
      })

      return originalMethod.apply(target, args)
    }

    descriptor.value = wrappedSystem

    readerConfigs.forEach((config: any) => {
      MessageRegistry.register(config.eventClass, wrappedSystem)
    })
  }
}

/**
 * @description: 标记参数为 MessageReader 并锁定其消息类型
 */
export function Event<T extends BaseMessage>(eventClass: new (...args: any[]) => T) {
  return (target: any, key: string, index: number) => {
    const configs = Reflect.getMetadata(CCS_METADATA.MESSAGE, target, key) || []
    configs.push({ index, eventClass })
    Reflect.defineMetadata(CCS_METADATA.MESSAGE, configs, target, key)
  }
}

/**
 * @description: 标记Controller身份
 */
export function Controller() {
  return (target: any) => {
    // 1. 依然要保持它可被依赖注入
    injectable()(target)
    // 2. 打上身份标签
    Reflect.defineMetadata(CCS_METADATA.CONTROLLER, true, target)
  }
}
/**
 * @description: 标记Component身份
 */
export function Component() {
  return (target: any) => {
    injectable()(target)
    // 打上组件标签
    Reflect.defineMetadata(CCS_METADATA.COMPONENT, true, target)
  }
}
