// src/renderer/src/main.ts
import 'reflect-metadata'
import { createApp } from 'vue'
import log from 'electron-log/renderer'
import App from './App.vue'
// import router from '@/router'

const app = createApp(App)
// app.use(router)
/**
 * 全局错误处理
 */
app.config.errorHandler = (err, instance, info) => {
  // DI 错误
  if (err instanceof Error && err.message.includes('[DI Error]')) {
    log.error('核心依赖缺失，程序中断渲染:', {
      message: err.message,
      component: instance?.$options.name || '未知组件',
      lifecycle: info
    })
    return
  }

  // 其他类型的通用错误
  log.error('Vue 全局捕获:', err, info)
}

import { bootstrapDI } from './ccs/ioc.config'
bootstrapDI()

app.mount('#app')
