import 'reflect-metadata'
//注册system
export * from './init'
export * from './server'
export * from './windows'
//启动
import { InitStarryMessage, InitSystem } from './init'
import { server } from './utils'
import { createVirid } from '@virid/core'
import { MainPlugin } from '@virid/main'
import { ExpressPlugin } from '@virid/express'
import { app } from 'electron'
import { bindComponents } from './server'
const virid = createVirid()
  .use(MainPlugin, { electronApp: app })
  .use(ExpressPlugin, { server: server })
//绑定组件
bindComponents(virid)

//注册协议
InitSystem.registerProtocols()
// 初始化完成，点火
app.whenReady().then(() => {
  InitStarryMessage.send(server, 1566)
})
