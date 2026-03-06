import { EventMessage } from '@virid/core'
import { type SettingComponent } from './component'
export class LoadSettingsMessage extends EventMessage {}

export class SaveSettingsMessage extends EventMessage {
  constructor(public modify: (setting: SettingComponent) => void) {
    super()
  }
}
