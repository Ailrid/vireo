/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-22 22:02:04
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 22:18:39
 * @FilePath: /template/src/main/env.ts
 * @Description:创建全局数据库和缓存文件目录给其他程序使用
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { app } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import os from 'os'

/**
 * 环境变量对象，存放全局路径
 */
export const env = {
  cacheRoot: '',
  dbPath: ''
}

/**
 * 初始化环境路径
 * 应该在 app.whenReady() 之后立即调用
 */
export function initEnv(): void {
  if (process.platform === 'linux') {
    const xdgCache = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache')
    env.cacheRoot = path.join(xdgCache, 'starry')
  } else if (process.platform === 'darwin') {
    env.cacheRoot = path.join(os.homedir(), 'Library', 'Caches', 'starry')
  } else {
    // Windows: 放在 LocalAppData 下
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    env.cacheRoot = path.join(localAppData, 'starry', 'Cache')
  }

  // 计算 dbPath
  env.dbPath = path.join(app.getPath('userData'), 'database', 'app.db')

  fs.ensureDirSync(env.cacheRoot)
  fs.ensureDirSync(path.dirname(env.dbPath))

  console.log(`[Env Init] Cache Root: ${env.cacheRoot}`)
  console.log(`[Env Init] DB Path: ${env.dbPath}`)
}
