import 'reflect-metadata'
export * from './init'
//启动
import { InitStarryMessage, bindComponents } from './init'
import { server } from './server'
import { createVirid } from '@virid/core'
import { MainPlugin } from '@virid/main'
import { ExpressPlugin } from '@virid/express'
import { app } from 'electron'

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  const virid = createVirid()
    .use(MainPlugin, { electronApp: app })
    .use(ExpressPlugin, { server: server })
  //绑定组件
  bindComponents(virid)
  //初始化整个App
  InitStarryMessage.send(1566)
}
