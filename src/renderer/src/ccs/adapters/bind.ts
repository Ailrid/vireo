/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-03 11:05:48
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-05 16:29:08
 * @FilePath: /starry/src/renderer/src/ccs/adapters/bind.ts
 * @Description: hook绑定适配器，用于处理各种魔法装饰器的绑定逻辑
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { CCS_METADATA } from '../constants'
import {
  watch,
  computed,
  type WatchStopHandle,
  isRef,
  ref,
  shallowReactive,
  onMounted,
  onUnmounted,
  onUpdated,
  onActivated,
  onDeactivated,
  shallowRef
} from 'vue'
import { container } from '../ioc'
import { CCSSystemContext, MessageRegistry, MessageWriter } from '../message'
// controller注册表
export class GlobalRegistry {
  private static globalRegistry = shallowReactive(new Map<string, any>())
  static set(id: string, instance: any): () => boolean {
    if (!this.globalRegistry.has(id)) {
      this.globalRegistry.set(id, instance)
      //返回卸载函数
      return () => {
        this.globalRegistry.delete(id)
        return true
      }
    } else {
      MessageWriter.error(
        new Error(`[CCS UseController] Duplicate ID: Controller ${id} already exists`)
      )
      return () => false
    }
  }
  static get(id: string): any {
    //如果找不见，直接报错
    if (!this.globalRegistry.has(id)) {
      MessageWriter.error(
        new Error(`[CCS UseController] ID Not Found: No Controller found with ID: ${id}`)
      )
      return null
    }
    return this.globalRegistry.get(id)
  }
}
/**
 * @Project 连接component，只读一个component的值
 */
export function bindProject(proto: any, instance: any, rawDeps: Record<string, any>) {
  const projects = Reflect.getMetadata(CCS_METADATA.PROJECT, proto)

  projects?.forEach((config) => {
    const { propertyKey, isAccessor, type, componentClass, source } = config
    let c: any
    let setter: (val: any) => void = () => {
      MessageWriter.error(
        new Error(
          `[CCS Shield] Property "${propertyKey}" is read-only. ` +
            `If you need to mutate, define an explicit setter and ensure the dependency is injected.`
        )
      )
    }
    // 获取目标对象（确保它是已经 bindResponsive 过的）
    const getTarget = () => {
      const target = type === 'component' ? container.get(componentClass) : instance
      if (target && !target.__ccs_processed__) {
        // 兜底：如果没处理过，现场处理（虽然最好在外部流转中处理好）
        bindResponsive(target)
      }
      return target
    }

    // 手写 get/set (支持提权写入)
    if (isAccessor) {
      const rawDescriptor = Object.getOwnPropertyDescriptor(proto, propertyKey)

      //如果有set，就警告
      if (rawDescriptor?.set) {
        MessageWriter.warn(
          `[CCS Project] Possible Implicit Modification: Manual Set on "${propertyKey}".` +
            `If this is not intentional, please do not use set.`
        )
        setter = (val) => {
          // 只有在这里，我们允许绕过 Shield
          const elevatedContext = new Proxy(instance, {
            get(target, key) {
              if (typeof key === 'string' && rawDeps[key]) {
                return rawDeps[key] // 返回未经 Proxy 劫持的原始对象
              }
              return Reflect.get(target, key)
            }
          })
          // 执行用户手写的 setter
          rawDescriptor?.set?.call(elevatedContext, val)
        }
      }
      c = computed({
        get: () => {
          // 这里的 this 绑定必须非常明确
          return rawDescriptor?.get?.call(instance)
        },
        set: setter
      })
    }
    // 函数式投影 (只读契约)
    else {
      // 处理普通的函数式投影
      c = computed(() => {
        const target = getTarget()
        // 调试用：console.log(`[Project Debug] Tracking ${propertyKey} from`, target);
        return source(target)
      })
    }

    const currentDescriptor = Object.getOwnPropertyDescriptor(instance, propertyKey)
    if (currentDescriptor && currentDescriptor.configurable === false) return

    Object.defineProperty(instance, propertyKey, {
      get: () => c.value,
      set: (val) => (c.value = val), // computed 如果没设 setter，这里赋值会报错，符合你 read-only 的预期
      enumerable: true,
      configurable: true
    })
  })
}
/**
 * @Watch 自动把函数变成watch
 */

export function bindWatch(proto: any, instance: any) {
  const watches: any[] = Reflect.getMetadata(CCS_METADATA.WATCH, proto) || []
  const stops: WatchStopHandle[] = []

  watches.forEach((config) => {
    const { type, source, methodName, options, componentClass } = config

    // 获取目标实例
    const target = type === 'component' ? container.get(componentClass) : instance
    // 确保目标实例已经过响应式处理
    if (target && !target.__ccs_processed__) {
      bindResponsive(target)
    }
    // 封装 getter
    const getter = () => {
      try {
        return source(target)
      } catch (e) {
        MessageWriter.error(e as Error, `[CCS Watch] Getter error in ${methodName}`)
        return undefined
      }
    }
    // 使用 bind 确保回调函数内部的 this 指向当前的 Controller/Instance
    const callback = (instance[methodName] as any).bind(instance)
    // 执行监听
    const stop = watch(
      getter,
      (newVal, oldVal) => {
        callback(newVal, oldVal)
      },
      {
        ...options
      }
    )
    stops.push(stop)
  })

  return stops
}

/**
 * @Responsive 递归处理依赖注入树中的所有 Component，将其标记属性变为响应式
 */

export function bindResponsive(instance: any) {
  if (!instance || typeof instance !== 'object') return
  if (Object.prototype.hasOwnProperty.call(instance, '__ccs_processed__')) return
  Object.defineProperty(instance, '__ccs_processed__', { value: true, enumerable: false })

  // 偷梁换柱
  const props = Reflect.getMetadata(CCS_METADATA.RESPONSIVE, instance) || []
  // 先将当前层级的所有属性Ref化
  props.forEach((config: any) => {
    const key = config.propertyKey
    const rawValue = instance[key]

    // 如果该属性已经是 getter/setter 了（可能被重复调用），跳过
    const descriptor = Object.getOwnPropertyDescriptor(instance, key)
    if (descriptor && descriptor.get) return

    const internalState = config.shallow ? shallowRef(rawValue) : ref(rawValue)

    Object.defineProperty(instance, key, {
      get: () => internalState.value,
      set: (val) => {
        internalState.value = val
      },
      enumerable: true,
      configurable: true
    })
  })

  // 只针对已经“Ref化”的对象或普通属性进行深度处理
  // 使用 Reflect.ownKeys 获取所有属性，包括不可枚举的
  Reflect.ownKeys(instance).forEach((key) => {
    if (key === '__ccs_processed__') return
    const val = instance[key] // 这里会触发上面定义的 get()
    if (val && typeof val === 'object' && !isRef(val)) {
      // 递归处理子对象
      bindResponsive(val)
    }
  })
}

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
      case 'onActivated':
        onActivated(fn)
        break
      case 'onDeactivated':
        onDeactivated(fn)
        break
      case 'onSetup':
        fn()
        break
      // 可以根据需要扩展更多的钩子
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
 * @description: 启动@Listener 为 Controller 实例绑定监听器并返回销毁函数列表
 **/
export function bindListener(proto: any, instance: any): (() => void)[] {
  const listenerConfigs: any[] = Reflect.getMetadata(CCS_METADATA.CONTROLLER_LISTENERS, proto) || []
  const unbindFunctions: (() => void)[] = []

  listenerConfigs.forEach(({ propertyKey, eventClass, priority, single }) => {
    const originalMethod = instance[propertyKey]

    // 强制只能接受一个参数且是 SingleMessage
    const wrappedHandler = function (msgs) {
      // 只有当确实有消息时才触发，没消息不空跑
      const message = single && Array.isArray(msgs) ? msgs[msgs.length - 1] : msgs
      if (msgs.length > 0) {
        // 直接注入快照数组副本，实现所有权转移
        originalMethod.apply(instance, [message])
      }
    }

    // 给包装后的函数挂载上下文信息（供 Dispatcher 读取）
    const taskContext: CCSSystemContext = {
      params: eventClass,
      targetClass: instance.constructor,
      methodName: propertyKey,
      originalMethod: originalMethod
    }
    ;(wrappedHandler as any).ccsContext = taskContext

    const unregister = MessageRegistry.register(eventClass, wrappedHandler, priority)
    unbindFunctions.push(unregister)
  })

  return unbindFunctions
}

/**
 * @description: 启动@Inherit 使能够只读其他的controller
 **/
export function bindInherit(proto: any, instance: any) {
  const inherits = Reflect.getMetadata(CCS_METADATA.INHERIT, proto)
  if (!inherits) return

  // @ts-ignore : token
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  inherits.forEach(({ propertyKey, token, id, selector }) => {
    // 为每个继承属性创建一个私有的 computed 引用
    // 这个 computed 就像一个隧道，一头连着 Registry，一头连着子组件
    const tunnel = computed(() => {
      const target = GlobalRegistry.get(id) // 自动依赖 Registry 的增删
      if (!target) {
        MessageWriter.warn(`[CCS Inherit] Warning: Inherit target not found: ${id}`)
        return null
      }
      // 这里的 selector(target) 也会触发依赖收集
      // 如果 target.state.count 变了，这个 computed 也会感知到
      return selector ? selector(target) : target
    })

    Object.defineProperty(instance, propertyKey, {
      get: () => {
        const val = tunnel.value // 访问 computed.value
        // 返回时依然套上护盾，确保“弱引用”也是“只读引用”
        return val ? createDeepShield(val, propertyKey, '') : null
      },
      set: () => {
        MessageWriter.error(
          new Error(
            `[CCS Inherit] No Modification：Attempted to set read-only Inherit property: ${propertyKey}`
          )
        )
      },
      enumerable: true,
      configurable: true
    })
  })
}
