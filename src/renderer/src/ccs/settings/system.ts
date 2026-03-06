import { System, Message, MessageWriter } from '@virid/core'
import { SettingComponent } from './component'
import { LoadSettingsMessage, SaveSettingsMessage } from './message'

export class SettingSystem {
  /**
   * *加载单个配置项
   */
  static loadConfig(key: keyof SettingComponent, settings: SettingComponent) {
    try {
      const saved = localStorage.getItem(`virid_setting_${String(key)}`)
      if (saved) {
        settings[key] = JSON.parse(saved)
      } else {
        localStorage.setItem(`virid_setting_${String(key)}`, JSON.stringify(settings[key]))
      }
    } catch (e) {
      MessageWriter.error(e as Error, `[Setting] LoadConfig Error: ${key} cannot be loaded`)
    }
  }

  /**
   * *保存单个配置项
   */
  static saveConfig(key: keyof SettingComponent, settings: SettingComponent) {
    try {
      localStorage.setItem(`virid_setting_${String(key)}`, JSON.stringify(settings[key]))
    } catch (e) {
      MessageWriter.error(e as Error, `[Setting System] SaveConfig Error: ${key} cannot be saved`)
    }
  }

  /**
   * *加载所有配置
   */
  @System({
    messageClass: LoadSettingsMessage
  })
  static LoadSetting(settings: SettingComponent) {
    ;(Object.keys(settings) as Array<keyof SettingComponent>).forEach((key) => {
      this.loadConfig(key, settings)
    })
    MessageWriter.info('[Setting System] LoadSetting: Load all settings completed')
  }

  /**
   * *修改并保存设置
   */
  @System()
  static SaveSetting(
    @Message(SaveSettingsMessage) msg: SaveSettingsMessage,
    settings: SettingComponent
  ) {
    msg.modify(settings)
    const keys = Object.keys(settings) as Array<keyof SettingComponent>
    keys.forEach((key) => {
      this.saveConfig(key, settings)
    })
  }
}
