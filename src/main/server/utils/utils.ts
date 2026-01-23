/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-07 15:46:30
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-07 17:11:17
 * @FilePath: /server/src/utils/net_ease/utils.ts
 * @Description:一些通用的工具函数
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
/**
 * 将多种类型的值转换为布尔值
 */
export const toBoolean = (val: any): boolean | string => {
  if (typeof val === 'boolean') return val
  if (val === '') return val
  return val === 'true' || val == '1'
}

/**
 * 将 Cookie 字符串转换为 JSON 对象
 */
export const cookieToJson = (cookie: string): Record<string, string> => {
  if (!cookie) return {}
  const obj: Record<string, string> = {}
  const cookieArr = cookie.split(';')
  cookieArr.forEach(i => {
    const parts = i.split('=')
    if (parts.length >= 2) {
      const key = parts[0]!.trim() // 去掉可能的空格
      const value = parts.slice(1).join('=') // 防止 Value 中也包含等号
      obj[key] = value
    }
  })
  return obj
}

/**
 * 将 Cookie 对象转换为字符串格式
 */
export const cookieObjToString = (cookie: Record<string, any>): string => {
  return Object.keys(cookie)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(cookie[key])}`)
    .join('; ')
}

/**
 * 获取指定位数的随机整数
 * @param num 位数
 */
export const getRandom = (num: number): number => {
  const random = Math.floor(
    (Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, num - 1)
  )
  return random
}

/**
 * 生成随机整数
 */
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成随机 IP 段
 */
const generateIPSegment = (): number => {
  return getRandomInt(1, 255)
}

/**
 * 生成随机的中国区 IP 地址
 */
export const generateRandomChineseIP = (): string => {
  const chinaIPPrefixes = ['116.25', '116.76', '116.77', '116.78']
  const randomPrefix = chinaIPPrefixes[Math.floor(Math.random() * chinaIPPrefixes.length)]
  return `${randomPrefix}.${generateIPSegment()}.${generateIPSegment()}`
}
