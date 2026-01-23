/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-22 19:57:22
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 21:33:02
 * @FilePath: /template/src/renderer/src/utils/server/request.ts
 * @Description:请求封装，把所有请求转换为Result
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Ok, Err, type Result } from 'ts-results'

export async function request<T, P>(url: string, params: P): Promise<Result<T, string>> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    // 处理非 2xx 状态码
    if (!response.ok) {
      const errorText = await response.text()
      return Err(`HTTP Error ${response.status}: ${errorText}`)
    }

    // 解析 JSON
    const data = (await response.json()) as T
    return Ok(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return Err(message)
  }
}
