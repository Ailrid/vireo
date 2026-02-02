import { TestComponent } from '@/logic/components/testComponent'
import { Watch, Project, Responsive } from '@/ccs/decorators/vue'
import { Controller } from '@/ccs/decorators/ccs'
import log from 'electron-log/renderer'

@Controller()
export class TestController {
  @Responsive()
  public self_value: number = 999
  constructor(private service: TestComponent) {}

  changeSelfValue() {
    this.self_value += 1
    console.log('自增后的 self_value:', this.self_value)
  }

  @Project('service.state.volume')
  public volume!: number
  // @Project()
  // public get volume(): number {
  //   return this.service.state.volume
  // }
  @Project()
  public get isPlaying(): boolean {
    return this.service.state.isPlaying
  }

  @Watch('service.state.volume', { immediate: true })
  public watchVolume() {
    log.info('volume:', this.service.state.volume)
  }
  @Watch((i) => i.isPlaying, { immediate: true })
  public watchIsPlaying() {
    log.info('isPlaying:', this.service.state.isPlaying)
  }

  onMounted() {
    log.info('TestController 挂载成功，Service 自动注入！')
  }
}
