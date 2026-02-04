/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-31 16:17:36
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-04 21:35:34
 * @FilePath: /starry/src/renderer/src/ccs/decorators/ccs.ts
 * @Description: ccs核心魔法装饰器
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { container } from '@/ccs/ioc'
import { MessageRegistry, BaseMessage, MessageWriter, ControllerMessage } from '../message'
import { CCS_METADATA } from '../constants'
import { injectable } from 'inversify'
import { CCSSystemContext } from '../message/types'
/**
 * @description: 系统装饰器
 * @param priority 优先级，数值越大越早执行
 */
export function System(priority: number = 0) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    const types = Reflect.getMetadata('design:paramtypes', target, key) || []
    const readerConfigs: { index: number; eventClass: any }[] =
      Reflect.getMetadata(CCS_METADATA.MESSAGE, target, key) || []
    //不允许有多个Configs,只能由一种Message触发
    if (readerConfigs.length > 1) {
      MessageWriter.warn(
        `[CCS System] Multiple Messages Are Not Allowed: ${key} has multiple @Message() decorators!`
      )
      return
    }
    const wrappedSystem = function (currentMessage: any) {
      const instance = container.get(target)
      const args = types.map((type: any, index: number) => {
        // 先看看这个参数是不是标记过的Event
        const config = readerConfigs.find((c: any) => c.index === index)
        if (config) {
          const { eventClass } = config
          // 如果是 eventClass 类,注入参数
          if (currentMessage instanceof eventClass) {
            return currentMessage
          } else {
            MessageWriter.error(
              new Error(
                `[CCS System] Unkonw Inject Message Type: ${eventClass.name} is not EventMessage or SignalMessage!`
              )
            )
            return null
          }
        }
        // 处理普通的依赖注入
        const param = container.get(type)
        if (!param)
          MessageWriter.error(
            new Error(
              `[CCS System] Unkonw Inject Data Types: ${type.name} is not registered in the container!`
            )
          )
        return param
      })

      // 执行业务逻辑
      const result = originalMethod.apply(instance, args)

      // 统一处理返回值：System 可以直接 return 一个消息来实现“链式反应”
      const handleResult = (res: any) => {
        if (!res) return
        const messages = Array.isArray(res) ? res : [res]
        messages.forEach((m) => {
          if (m instanceof BaseMessage) {
            MessageWriter.write(m)
          }
        })
      }

      return result instanceof Promise ? result.then(handleResult) : handleResult(result)
    }
    // 给包装后的函数挂载上下文信息（供 Dispatcher 读取）
    const taskContext: CCSSystemContext = {
      params: types,
      targetClass: target,
      methodName: key,
      originalMethod: originalMethod
    }
    ;(wrappedSystem as any).ccsContext = taskContext

    // 修改方法定义
    descriptor.value = wrappedSystem
    // 注册到调度中心：每个监听的消息类都要关联这个包装函数
    readerConfigs.forEach((config: any) => {
      MessageRegistry.register(config.eventClass, wrappedSystem, priority)
    })
  }
}

/**
 * @description: 标记参数为 MessageReader 并锁定其消息类型
 */
export function Message<T extends BaseMessage>(eventClass: new (...args: any[]) => T) {
  return (target: any, key: string, index: number) => {
    const configs = Reflect.getMetadata(CCS_METADATA.MESSAGE, target, key) || []
    // 存储元数据：哪个参数索引，对应哪个消息类
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
