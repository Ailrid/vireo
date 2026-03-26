import { Controller } from '@virid/core'
import { TitleBarLeftController } from '@/layouts/controllers'
import { Inherit } from '@virid/vue'

@Controller()
export class SideBarController {
  //从title-bar-left继承这个属性
  @Inherit(TitleBarLeftController, 'title-bar-left', i => i.currentView)
  public currentView: string = 'current-playlist'
}
