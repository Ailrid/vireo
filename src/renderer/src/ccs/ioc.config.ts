import { createVirid } from '@virid/core'
import { VuePlugin } from '@virid/vue'
import { RenderPlugin } from '@virid/renderer'
import { bindPlayback } from './playback'
import { bindSetting } from './settings'
import { bindUser } from './user'
import { bindPublicControllers } from '@/components/public/controllers'
import { bindSettingControllers } from '@/components/setting/controllers'
import { bindPlayerControllers } from '@/components/player/controllers'
import { bindLoginControllers } from '@/components/login/controllers'
import { bindSidebarControllers } from '@/components/sidebar/controllers'
import { bindLayoutControllers } from '@/layouts/controllers'
import { bindPageControllers } from '@/pages/controllers'
import { InitializationMessage } from './init'
import * as _ from './utils'
const app = createVirid()
app.use(VuePlugin, {})
app.use(RenderPlugin, {
  windowId: 'renderer'
})
/**
 * *所有的 Controller 和 Component 都在这里排队登记
 */
export function bootstrapDI() {
  //绑定component
  bindSetting(app)
  bindUser(app)
  bindPlayback(app)
  //绑定各种组件的controller
  bindPublicControllers(app)
  bindSettingControllers(app)
  bindPlayerControllers(app)
  bindLayoutControllers(app)
  bindLoginControllers(app)
  bindSidebarControllers(app)
  bindPageControllers(app)
  // 启动初始化
  InitializationMessage.send()
}
