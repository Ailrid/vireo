/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2025-07-07 12:13:17
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 19:12:40
 * @FilePath: /template/src/renderer/src/utils/setting/store.ts
 * @Description:初始化某个对象当对象更改时自动存储到localStorage
 *
 * Copyright (c) 2025 by ShirahaYuki, All Rights Reserved.
 */
import log from 'electron-log/renderer'
export function store<T extends object>(key: string, initialValue: T): T {
  // 尝试从 localStorage 中获取现有值，如果不存在则使用初始值
  const storageValue = localStorage.getItem(key)
  //合并或者使用初始值
  const data = storageValue ? Object.assign(initialValue, JSON.parse(storageValue)) : initialValue

  // 定义一个函数来更新 localStorage
  const updateLocalStorage = (valueToStore) => {
    try {
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (e) {
      log.error('Error saving to localStorage:', e)
    }
  }

  // 递归创建代理的内部函数
  const createDeepProxy = (target) => {
    // 确保 target 是一个对象，否则直接返回
    if (typeof target !== 'object' || target === null) {
      return target
    }

    const handler = {
      get(target, prop, receiver) {
        // 如果获取的是对象，则返回其代理
        const res = Reflect.get(target, prop, receiver)
        if (typeof res === 'object' && res !== null) {
          return createDeepProxy(res)
        }
        return res
      },
      set(target, prop, value, receiver) {
        // 只有当值发生变化时才更新
        if (Reflect.get(target, prop, receiver) === value) {
          return true
        }

        // 设置属性
        const success = Reflect.set(target, prop, value, receiver)
        if (success) {
          // 属性设置成功后，更新整个根数据到 localStorage
          updateLocalStorage(data) // 注意这里是 'data'，即最顶层的被代理对象
        }
        return success
      },
      deleteProperty(target, prop) {
        // 删除属性
        const success = Reflect.deleteProperty(target, prop)
        if (success) {
          // 属性删除成功后，更新整个根数据到 localStorage
          updateLocalStorage(data)
        }
        return success
      }
    }
    return new Proxy(target, handler)
  }

  // 首次加载时，确保初始值也被存入 localStorage
  updateLocalStorage(data)

  // 返回根代理
  return createDeepProxy(data)
}
