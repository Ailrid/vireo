import { EventMessage } from '@virid/core'

import { type Express } from 'express'
export class BootStrapElectronMessage extends EventMessage {
  constructor(public port: number) {
    super()
  }
}
export class CreateMainWindowMessage extends EventMessage {
  constructor(public port: number) {
    super()
  }
}

export class CommandQueueMessage extends EventMessage {
  constructor(public command: string) {
    super()
  }
}

export class InitStarryMessage extends EventMessage {
  constructor(
    public server: Express,
    public port: number
  ) {
    super()
  }
}
