import { TestComponent } from '@/logic/components/testComponent'

import { System, Event } from '@/ccs/decorators/ccs'
import { BaseMessage, MessageReader } from '@/ccs/message'
export class TestMessage extends BaseMessage {}
export class PlayMessage extends BaseMessage {}

export class TestSystem {
  @System()
  static increaseVoloum(
    @Event(TestMessage) _messageReader: MessageReader<TestMessage>,
    test: TestComponent
  ) {
    test.state.volume += 10
  }
  @System()
  static playOrPause(
    @Event(PlayMessage) _messageReader: MessageReader<PlayMessage>,
    test: TestComponent
  ) {
    test.state.isPlaying = !test.state.isPlaying
  }
}
