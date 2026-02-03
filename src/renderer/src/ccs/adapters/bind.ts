/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-03 11:05:48
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-03 22:05:41
 * @FilePath: /starry/src/renderer/src/ccs/adapters/bind.ts
 * @Description: hook绑定适配器，用于处理各种魔法装饰器的绑定逻辑
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { CCS_METADATA } from '../constants'
import { watch, computed, type WatchStopHandle, isRef, ref, reactive } from 'vue'
import { container } from '../ioc'
import { MessageReader, MessageRegistry, MessageWriter } from '../message'

export function bindProject(proto: any, instance: any, rawDeps: Record<string, any>) {
  const projects = Reflect.getMetadata(CCS_METADATA.PROJECT, proto)
  projects?.forEach(({ propertyKey, path, isAccessor }) => {
    let c: any
    // 1处理手写的 get/set
    if (isAccessor) {
      const rawDescriptor = Object.getOwnPropertyDescriptor(proto, propertyKey)
      c = computed({
        // 这里 call(instance) 没问题，因为内部逻辑只要不直接修改注入项就不会触发报错
        get: () => rawDescriptor?.get?.call(instance),
        set: (val) => rawDescriptor?.set?.call(instance, val)
      })
    }
    // 处理路径映射
    else if (path) {
      const keys = path.split('.')
      const rootKey = keys[0] // 比如 'playerService'
      const lastKey = keys.pop()! // 比如 'counter'
      const midKeys = keys.slice(1) // 路径中间的部分

      c = computed({
        // 读取：走 instance。因为 instance 里的 service 是 Proxy，
        // 这样可以确保如果 Service 里的属性是 ref，我们能正常触发依赖收集。
        get: () => {
          const value = path.split('.').reduce((obj, key) => obj?.[key], instance)
          return isRef(value) ? value.value : value
        },
        // 写入：必须走“密道” (rawDeps)
        set: (val) => {
          // 优先从 rawDeps 拿真身，拿不到（说明不是注入项）再回退到 instance
          const root = rawDeps[rootKey] || (instance as any)[rootKey]
          if (!root) return

          // 寻址到倒数第二层
          const targetObj = midKeys.reduce((obj, key) => obj?.[key], root)

          if (targetObj) {
            const targetValue = targetObj[lastKey]
            // 真正干活的地方：由于 targetObj 是从 rawDeps 出来的“真身”，
            // 这里的赋值不会触发 createDeepShield 的 Proxy.set 报错！
            if (isRef(targetValue)) {
              targetValue.value = val
            } else {
              targetObj[lastKey] = val
            }
          }
        }
      })
    } else {
      MessageWriter.error(
        new Error(
          `[CCS Project] Data Not Found: Property ${propertyKey} @Project but missing logic/path.`
        )
      )
      return
    }

    // 将计算属性挂载到 Controller 实例上
    Object.defineProperty(instance, propertyKey, {
      get: () => c.value,
      set: (val) => (c.value = val),
      enumerable: true,
      configurable: true
    })
  })
}

export function bindWatch(proto: any, instance: any) {
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

/**
 * 递归处理依赖注入树中的所有 Component，将其标记属性变为响应式
 */
// @/ccs/adapters/hooks.ts
export function bindResponsive(instance: any) {
  if (!instance || typeof instance !== 'object') return
  if (Object.prototype.hasOwnProperty.call(instance, '__ccs_processed__')) return
  Object.defineProperty(instance, '__ccs_processed__', { value: true, enumerable: false })

  // 偷梁换柱
  const props = Reflect.getMetadata(CCS_METADATA.RESPONSIVE, instance) || []
  props.forEach((key: string) => {
    const rawValue = instance[key]
    const internalState = typeof rawValue === 'object' ? reactive(rawValue) : ref(rawValue)

    Object.defineProperty(instance, key, {
      get: () => {
        const val = isRef(internalState) ? internalState.value : internalState
        return val
      },
      set: (val) => {
        if (isRef(internalState)) {
          internalState.value = val
        } else {
          // 对于对象/数组，使用 Object.assign 或 Vue 的响应式逻辑
          Object.assign(internalState, val)
        }
      },
      enumerable: true,
      configurable: true
    })
  })

  // 递归处理
  const allKeys = Object.keys(instance)
  for (const key of allKeys) {
    const val = instance[key]
    if (val && typeof val === 'object') {
      // 只要父级是 Component，或者在 Controller 里明确标记了这是注入项
      // 递归下去的每一层都应该维持 isService = true
      bindResponsive(val)
    }
  }
}

// @/ccs/utils/shield.ts

/**
 * 递归物理护盾：将对象及其所有后代变为硬只读
 */
export function createDeepShield(target: any, rootName: string, path: string = ''): any {
  // 基本类型直接返回
  if (target === null || typeof target !== 'object') {
    return target
  }

  // 防止重复包装
  if (target.__ccs_shield__) return target

  return new Proxy(target, {
    get(obj, prop) {
      // 内部标识，用于识别是否已被包装
      if (prop === '__ccs_shield__') return true
      // 允许访问原始对象（仅限框架内部使用，可用 Symbol 隐藏）
      if (prop === '__raw__') return obj

      const value = Reflect.get(obj, prop)
      const currentPath = path ? `${path}.${String(prop)}` : String(prop)

      // 自动给子对象也穿上护盾
      return createDeepShield(value, rootName, currentPath)
    },

    set(_obj, prop) {
      const currentPath = path ? `${path}.${String(prop)}` : String(prop)

      // 优雅地失败，并给出修复建议
      const errorMsg = [
        `\n[CCS DeepShield]`,
        `------------------------------------------------`,
        `Component: ${rootName}`,
        `Code: this.${rootName}.${currentPath}`,
        `Result: Rejected`,
        `Repair suggestion: Please use @ Project (${currentPath}) to create a projection in the Controller.`,
        `------------------------------------------------`
      ].join('\n')
      MessageWriter.error(new Error(errorMsg))
      return false
    },

    deleteProperty(_obj, prop) {
      MessageWriter.error(
        new Error(
          `[CCS DeepShield] Physical Protection: Prohibit Deletion of Component Attributes ${String(prop)}`
        )
      )
      return false
    },

    // 拦截 Object.defineProperty 等底层操作
    defineProperty() {
      MessageWriter.error(
        new Error(
          `[CCS DeepShield] Physical Protection: Prohibit redefining component attribute structure`
        )
      )
      return false
    }
  })
}
/**
 * 处理 @InstanceProject，实现自动注入并建立属性投影
 */
export function bindInstantProject(proto: any, instance: any) {
  const projects = Reflect.getMetadata(CCS_METADATA.INSTANT_PROJECT, proto)

  projects?.forEach(({ propertyKey, componentToken, selector }) => {
    // 1. 自动从 IOC 容器获取目标组件实例 (单例)
    const targetComponent = container.get(componentToken)

    // 2. 建立计算属性投影
    const c = computed({
      get: () => {
        // 执行选择器逻辑
        const value = selector(targetComponent)
        // 自动解包 ref，保持 API 一致性
        return isRef(value) ? value.value : value
      },
      set: (_val) => {
        MessageWriter.error(
          new Error(
            `[CCS InstantProject] No Modification：Attempted to set read-only InstanceProject property: ${propertyKey}`
          )
        )
      }
    })

    // 3. 挂载到 Controller 实例上
    Object.defineProperty(instance, propertyKey, {
      get: () => c.value,
      set: (val) => (c.value = val),
      enumerable: true,
      configurable: true
    })
  })
}

import { onMounted, onUnmounted, onUpdated } from 'vue'

/**
 * 解析 @OnHook 并将其绑定到 Vue 生命周期
 */
export function bindHooks(proto: any, instance: any) {
  const hooks = Reflect.getMetadata(CCS_METADATA.LIFE_CRICLE, proto)

  hooks?.forEach(({ hookName, methodName }) => {
    const fn = instance[methodName].bind(instance)

    switch (hookName) {
      case 'onMounted':
        onMounted(fn)
        break
      case 'onUnmounted':
        onUnmounted(fn)
        break
      case 'onUpdated':
        onUpdated(fn)
        break
      // 你可以根据需要扩展更多的钩子
    }
  })
}

/**
 * 执行并绑定万能 Hooks
 */
export function bindUseHooks(proto: any, instance: any) {
  const hooks = Reflect.getMetadata(CCS_METADATA.USE_HOOKS, proto)

  hooks?.forEach(({ propertyKey, hookFactory }) => {
    // 在 useController 运行期间执行 hookFactory()
    const hookResult = hookFactory()
    // 直接赋值给实例
    instance[propertyKey] = hookResult
  })
}

/**
 * @description: 为 Controller 实例绑定监听器并返回销毁函数列表
 **/
export function bindListener(proto: any, instance: any): (() => void)[] {
  // 从元数据中读取该类所有被 @Listener 标记的方法配置
  const listenerConfigs: any[] = Reflect.getMetadata(CCS_METADATA.CONTROLLER_LISTENERS, proto) || []
  const unbindFunctions: (() => void)[] = []

  listenerConfigs.forEach(({ propertyKey, eventClass, priority }) => {
    const originalMethod = instance[propertyKey]

    // 获取该方法的参数类型列表
    const types: any[] = Reflect.getMetadata('design:paramtypes', proto, propertyKey) || []
    // 获取参数中通过 @Event 标记的位置信息
    const readerConfigs: any[] = Reflect.getMetadata(CCS_METADATA.MESSAGE, proto, propertyKey) || []
    // 重新包装 System 函数
    const wrappedHandler = function () {
      const args = types.map((type: any, index: number) => {
        const config = readerConfigs.find((c: any) => c.index === index)
        if (config) return new MessageReader(config.eventClass)
        else {
          MessageWriter.error(
            new Error(`[CCS Listener] Listener Decorator: '${type}' connot be used as a parameter.`)
          )
          return
        }
      })

      // 使用 instance 作为 this 绑定执行
      const result = originalMethod.apply(instance, args)
      return result
    }

    // 注册到 MessageRegistry，并收集返回的卸载句柄
    const unregister = MessageRegistry.register(eventClass, wrappedHandler, priority)
    unbindFunctions.push(unregister)
  })

  return unbindFunctions
}
