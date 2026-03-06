import { type ViridApp } from '@virid/core'
import { ThemeController } from './theme'
export function bindSettingControllers(app: ViridApp) {
  app.bindController(ThemeController)
}
export * from './theme'
