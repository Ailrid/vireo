import { createVirid } from '@virid/core'
import { VuePlugin } from '@virid/vue'
import { RenderPlugin } from '@virid/renderer'
import { StdPlugin } from '@virid/std'
import { bindPlayback } from './playback'
import { bindSetting } from './settings'
import { bindUser } from './user'
import { bindLoginControllers } from '@/components/login/controllers'
import { bindPublicControllers } from '@/components/public/controllers'
import { bindSettingThemeControllers } from '@/components/setting/controllers'
import { bindPlayerControllers } from '@/components/player/controllers'
import { bindSidebarControllers } from '@/components/sidebar/controllers'
import { bindLayoutControllers } from '@/layouts/controllers'
import { bindPageControllers } from '@/pages/controllers'
import { InitializationMessage } from './init'
export * from './electron'
const app = createVirid()
app.use(StdPlugin, {}).use(VuePlugin, undefined).use(RenderPlugin, {
  windowId: 'renderer'
})
/**
 * *所有的 Controller 和 Component 都在这里排队登记
 */
export function bootstrapVirid() {
  //绑定component
  bindSetting(app)
  bindUser(app)
  bindPlayback(app)
  //绑定各种组件的controller
  bindLoginControllers(app)
  bindPublicControllers(app)
  bindSettingThemeControllers(app)
  bindPlayerControllers(app)
  bindLayoutControllers(app)
  bindSidebarControllers(app)
  bindPageControllers(app)
  // 启动初始化
  InitializationMessage.send()
}
