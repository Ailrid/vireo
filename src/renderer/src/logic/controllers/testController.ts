import { TestComponent } from '@/logic/components/testComponent'
import { Watch, Project, Responsive, InstantProject, OnHook, Use } from '@/ccs/decorators/vue'
import { Listener, Event } from '@/ccs/decorators/ccs'
import { ControllerMessage } from '@/ccs/message'
import { Controller } from '@/ccs/decorators/ccs'
import log from 'electron-log/renderer'
import { useRouter, type Router } from 'vue-router'

class TestControllerMessage extends ControllerMessage {}

@Controller()
export class TestController {
  @Responsive()
  public self_value: number = 999
  constructor(private test: TestComponent) {}

  changeSelfValue() {
    this.self_value += 1
    console.log('自增后的 self_value:', this.self_value)
  }
  @Use(() => useRouter())
  public router!: Router

  @Project('test.state.volume')
  public volume!: number

  @Project()
  public get isPlaying(): boolean {
    return this.test.state.isPlaying
  }
  public set isPlaying(value: boolean) {
    this.test.state.isPlaying = value
  }

  @InstantProject(TestComponent, (i) => i.state.name)
  public name!: string

  @Watch('test.state.volume', { immediate: true })
  public watchVolume() {
    log.info('volume:', this.test.state.volume)
  }
  @Watch((i) => i.isPlaying, { immediate: true })
  public watchIsPlaying() {
    log.info('isPlaying:', this.test.state.isPlaying)
  }
  @Listener(TestControllerMessage)
  testListener(@Event(TestControllerMessage) _message: TestControllerMessage) {
    log.info('testListener:')
  }
  @OnHook('onMounted')
  onMounted() {
    log.info('TestController 挂载成功，test 自动注入！')
  }
}
