import { AsyncQueueMessage } from './message'
import { Message, MessageWriter, System } from '@virid/core'
export class UtilSystem {
  //定义一个私有的静态锁（放在类外部或作为静态私有成员）
  static executionChain: Promise<any> = Promise.resolve()
  /**
   *
   * * 异步任务链
   */
  @System()
  static asyncQueue(@Message(AsyncQueueMessage) message: AsyncQueueMessage) {
    this.executionChain = this.executionChain
      .then(() => message.task())
      .catch(err => {
        MessageWriter.error(err, '[AsyncQueue] Failed When Executing Task')
      })
  }
}
