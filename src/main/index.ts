import 'reflect-metadata'
export * from './init'
//启动
import { InitVireoMessage, bindComponents } from './init'
import { server } from './server'
import { createVirid } from '@virid/core'
import { MainPlugin } from '@virid/main'
import { ExpressPlugin } from '@virid/express'
import { StdPlugin } from '@virid/std'
import { app } from 'electron'

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  const virid = createVirid()
    .use(StdPlugin, {})
    .use(MainPlugin, { electronApp: app })
    .use(ExpressPlugin, { server: server })
  //绑定组件
  bindComponents(virid)
  //初始化整个App
  InitVireoMessage.send(1566)
}
