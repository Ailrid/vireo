import { bindWindowComponents } from './component'
import { bindWindowMessages } from './message'
import { type ViridApp } from '@virid/core'
import { type MainPlugin } from '@virid/main'
import { registerWindowSystems } from './window-system'
import { registerTraySystems } from './tray-system'
import { registerShareSystems } from './share-system'
import { registerMainWindowSystems } from './main-window'
import { registerLoginWindowSystems } from './login-window'
import { registerLyricWindowSystems } from './lyric-window'

export * from './component'
export * from './message'

export function windowSystemsBunch(app: ViridApp, plugin: MainPlugin) {
  registerWindowSystems(app)
  registerTraySystems(app)
  registerShareSystems(app)
  registerMainWindowSystems(app)
  registerLoginWindowSystems(app)
  registerLyricWindowSystems(app)
  bindWindowComponents(app)
  bindWindowMessages(plugin)
}
