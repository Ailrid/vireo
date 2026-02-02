import { Responsive } from '@/ccs/decorators/vue'
import { Component } from '@/ccs/decorators/ccs'
@Component()
export class TestComponent {
  // 响应式状态
  @Responsive()
  public counter = 0
  @Responsive()
  public state = {
    name: 'Default Track',
    isPlaying: false,
    volume: 0.8
  }
}
