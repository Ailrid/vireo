import { createVirid } from '@virid/core'
import { VuePlugin } from '@virid/vue'
import { RendererPlugin } from '@virid/renderer'
import { bindLyricControllers } from '../components/controllers'
import { registerLyricSystems } from './system'
import { bindDestLyricComponent } from './component'
import { registerFromMainMessage } from './message'
const app = createVirid()
const vuePlugin = new VuePlugin()
const renderPlugin = new RendererPlugin()

app.use(vuePlugin, {})
app.use(renderPlugin, {
  windowId: 'lyric'
})
export function bootstrapVirid() {
  registerFromMainMessage(renderPlugin)
  bindDestLyricComponent(app)
  registerLyricSystems(app, renderPlugin)
  bindLyricControllers(app)

  return app
}

export * from './message'
export * from './component'
