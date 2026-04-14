export * from './express'
export * from './cache'

import { System, MessageWriter, Message, EventMessage } from '@virid/core'
import { server } from './express'

export class InitServerMessage extends EventMessage {
  constructor(public port: number) {
    super()
  }
}
export class InitServerSystem {
  /*
   * 启动服务器
   */
  @System()
  static async initExpress(@Message(InitServerMessage) message: InitServerMessage) {
    console.log('-------------------------------------------------');
    let resolver: () => void
    const promise = new Promise<void>(res => {
      resolver = res
    })
    server.listen(message.port, 'localhost', () => {
      resolver()
      MessageWriter.info(
        `[InitServerSystem] Server Initialization Completed: Server listening on localhost:${message.port}`
      )
    })
    await promise
  }
}
