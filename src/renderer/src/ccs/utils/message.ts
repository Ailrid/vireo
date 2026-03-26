import { EventMessage } from '@virid/core'

export class AsyncQueueMessage extends EventMessage {
  constructor(public task: () => Promise<any>) {
    super()
  }
}
