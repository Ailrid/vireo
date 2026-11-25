import { createVirid } from '@virid/core'
import { VuePlugin } from '@virid/vue'
import { RendererPlugin } from '@virid/renderer'
import { StdPlugin } from '@virid/std'

import { settingBunch } from './settings'
import { playbackBunch } from './playback'
import { userBunch } from './user'
import { registerElectronSystems } from './electron'

import { bindLoginControllers } from '@/components/login/controllers'
import { bindPublicControllers } from '@/components/public/controllers'
import { bindSettingThemeControllers } from '@/components/setting/controllers'
import { bindPlayerControllers } from '@/components/player/controllers'
import { bindSidebarControllers } from '@/components/sidebar/controllers'
import { bindLayoutControllers } from '@/layouts/controllers'
import { bindPageControllers } from '@/pages/controllers'
import { InitializationMessage, registerInitSystems } from './init'
export * from './electron'

const app = createVirid()
const stdPlugin = new StdPlugin()
const vuePlugin = new VuePlugin()
const rendererPlugin = new RendererPlugin()

app.use(stdPlugin, null).use(vuePlugin, { disableBorrowChecker: false }).use(rendererPlugin, {
  windowId: 'renderer'
})

export function bootstrapVirid() {
  registerElectronSystems(app, rendererPlugin)
  registerInitSystems(app)
  settingBunch(app)
  playbackBunch(app)
  userBunch(app)
  bindLoginControllers(app)
  bindPublicControllers(app, rendererPlugin)
  bindSettingThemeControllers(app)
  bindPlayerControllers(app)
  bindLayoutControllers(app)
  bindSidebarControllers(app)
  bindPageControllers(app)

  InitializationMessage.send()
  return app
}
