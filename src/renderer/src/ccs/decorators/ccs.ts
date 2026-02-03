/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-31 16:17:36
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-03 22:06:15
 * @FilePath: /starry/src/renderer/src/ccs/decorators/ccs.ts
 * @Description: ccs核心魔法装饰器
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { container } from '@/ccs/ioc'
import {
  MessageReader,
  MessageRegistry,
  BaseMessage,
  MessageWriter,
  ControllerMessage
} from '../message'
import { CCS_METADATA } from '../constants'
import { injectable } from 'inversify'

/**
 * @description: 系统装饰器
 * @param priority 优先级，数值越大越早执行
 */
export function System(priority: number = 0) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    const types = Reflect.getMetadata('design:paramtypes', target, key) || []
    const readerConfigs = Reflect.getMetadata(CCS_METADATA.MESSAGE, target, key) || []

    // 重新包装 System 函数
    const wrappedSystem = function () {
      const instance = container.get(target.constructor)

      const args = types.map((type: any, index: number) => {
        const config = readerConfigs.find((c: any) => c.index === index)
        if (config) return new MessageReader(config.eventClass)
        return container.get(type)
      })

      // 使用 instance 作为 this 绑定执行
      const result = originalMethod.apply(instance, args)

      const handleResult = (res: any) => {
        if (res === undefined || res === null) return
        if (res instanceof BaseMessage) {
          MessageWriter.write(res)
        } else {
          MessageWriter.error(
            new Error(`[CCS Decorator] System Decorator: '${key}' returned invalid value.`),
            `SystemReturnTypeCheck:${key}`
          )
        }
      }

      // 异步 System 处理
      if (result instanceof Promise) {
        return result.then(handleResult)
      }

      return handleResult(result)
    }

    // 替换原方法（注意：这里通常在类加载阶段执行）
    descriptor.value = wrappedSystem

    // 注册到调度中心
    readerConfigs.forEach((config: any) => {
      MessageRegistry.register(config.eventClass, wrappedSystem, priority)
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
 * @description: Listener 装饰器 - 标记 Controller 的成员方法为消息监听器
 * 模仿 Bevy 的即时响应机制，但严格限制其只能处理 UI 逻辑
 */
export function Listener<T extends ControllerMessage>(
  eventClass: new (...args: any[]) => T,
  priority: number = 0
) {
  return (target: any, propertyKey: string) => {
    // 获取该 Controller 原型上已有的监听器元数据
    const listeners = Reflect.getMetadata(CCS_METADATA.CONTROLLER_LISTENERS, target) || []

    // 存入当前方法的配置：哪个方法(propertyKey) 听 哪个消息(eventClass)
    listeners.push({
      propertyKey,
      eventClass,
      priority
    })

    // 将元数据重新定义回类原型，供 useController 在实例化时扫描
    Reflect.defineMetadata(CCS_METADATA.CONTROLLER_LISTENERS, listeners, target)
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
