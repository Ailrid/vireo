import { SettingComponent } from './component'
import { SettingController } from './controller'
import { type ViridApp } from '@virid/core'
export * from './component'
export * from './controller'
export * from './system'
export * from './message'
export function bindSetting(app: ViridApp) {
  app.bindComponent(SettingComponent)
  app.bindController(SettingController)
}
