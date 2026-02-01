import { bindController, bindComponent } from '@/ccs/ioc'
import { TestController } from './controllers/testController'
import { TestComponent } from './components/testComponent'

/**
 * 所有的 Controller 和 Component 都在这里排队登记
 */
export function bootstrapDI() {
  bindComponent(TestComponent)
  bindController(TestController)
}
