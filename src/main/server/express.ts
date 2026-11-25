import { System, MessageWriter, EventMessage, ViridApp, Component } from '@virid/core'
import { Express } from 'express'
import express from 'express'
import { join } from 'node:path'

export class InitServerMessage extends EventMessage {
  constructor(public port: number) {
    super()
  }
}

@Component()
export class Server {
  public server: Express
  constructor() {
    this.server = express()
    this.server.use(express.json())
    this.server.use(express.urlencoded({ extended: true }))
    this.server.use('/', express.static(join(__dirname, '../renderer')))
  }
}

export class InitServerSystem {
  /*
   * 启动服务器
   */
  @System()
  static async initExpress(message: InitServerMessage, express: Server) {
    let resolver: () => void
    const promise = new Promise<void>(res => {
      resolver = res
    })
    express.server.listen(message.port, 'localhost', () => {
      resolver()
      MessageWriter.info(
        `[InitServerSystem] Server Initialization Completed: Server listening on localhost:${message.port}`
      )
    })
    await promise
  }
}

export function registerExpressSystems(app: ViridApp) {
  app.register(InitServerSystem.initExpress)
}
