import { TestComponent } from '@/logic/components/testComponent'
import { injectable } from 'inversify'
import { Watch, Project } from '@/ccs/decorators/vue'
import log from 'electron-log/renderer'

@injectable()
export class TestController {
  constructor(private service: TestComponent) {}
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
