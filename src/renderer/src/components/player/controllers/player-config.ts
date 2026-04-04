import { type PlayerConfig, SettingComponent } from '@/ccs/settings'
import { Controller } from '@virid/core'
import { OnHook, Project, Responsive, Watch } from '@virid/vue'
import { SaveSettingsMessage } from '@/ccs/settings'
@Controller()
export class PlayerConfigController {

  @Project(SettingComponent, i => i.player)
  public player!: PlayerConfig

  @Responsive()
  public setting!: PlayerConfig

  @OnHook('onSetup')
  init() {
    this.setting = JSON.parse(JSON.stringify(this.player))
  }

  /**
   * *只要setting变，那就发消息更新
   */
  @Watch<PlayerConfigController>(i => i.setting, { deep: true })
  public updatePlayer() {
    SaveSettingsMessage.send(settings => {
      settings.player = this.setting
    })
  }
}
