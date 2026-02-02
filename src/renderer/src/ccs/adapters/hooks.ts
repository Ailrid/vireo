/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-31 16:01:12
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-02 18:33:27
 * @FilePath: /starry/src/renderer/src/ccs/adapters/hooks.ts
 * @Description:vue hooks 适配器，用于挂在各种vue魔法装饰器械
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import {
  onMounted,
  onUnmounted,
  watch,
  computed,
  type WatchStopHandle,
  isRef,
  ref,
  reactive
} from 'vue'
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
  // 1. 建立真身仓库 (此时 instance 里的 service 还是干净的原始对象)
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
  bindProject(proto, instance, rawDeps)
  const stops = bindWatch(proto, instance)
  // 4. 【最后一步】给 Controller 上的注入项套上护盾
  if (isController) {
    Object.keys(rawDeps).forEach((key) => {
      // 物理级替换：从这一刻起，直接访问 instance.service 就会报错
      ;(instance as any)[key] = createDeepShield(rawDeps[key], key, '')
    })
  }
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

function bindProject(proto: any, instance: any, rawDeps: Record<string, any>) {
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
      console.warn(`[CCS] Property ${propertyKey} @Project but missing logic/path.`)
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

/**
 * 递归处理依赖注入树中的所有 Component，将其标记属性变为响应式
 */
// @/ccs/adapters/hooks.ts
function bindResponsive(instance: any) {
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
      // 只要父级是 Service，或者你在 Controller 里明确标记了这是注入项
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
        `\n[CCS Security Violation]`,
        `------------------------------------------------`,
        `Component: ${rootName}`,
        `Code: this.${rootName}.${currentPath}`,
        `Result: Rejected`,
        `Repair suggestion: Please use @ Project (${currentPath}) to create a projection in the Controller.`,
        `------------------------------------------------`
      ].join('\n')

      throw new Error(errorMsg)
    },

    deleteProperty(_obj, prop) {
      throw new Error(
        `[CCS Security] Physical Protection: Prohibit Deletion of Component Attributes ${String(prop)}`
      )
    },

    // 拦截 Object.defineProperty 等底层操作
    defineProperty() {
      throw new Error(
        `[CCS Security] Physical Protection: Prohibit redefining component attribute structure`
      )
    }
  })
}
