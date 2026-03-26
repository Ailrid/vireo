import { Controller, SingleMessage } from '@virid/core'
import { Listener, Project, Responsive } from '@virid/vue'
//一个小局部变量，让player页面且回来的时候，sidebar能找到上次的正确的选项
let currentViewBackup = 'current-playlist'

export class TitleBarLeftControllerMessage extends SingleMessage {
  constructor(public event: WheelEvent) {
    super()
  }
}
type NameType = 'current-playlist' | 'playlist-manager' | 'recent-play'

@Controller()
export class TitleBarLeftController {
  public nameMap = {
    'current-playlist': '播放列表',
    'playlist-manager': '歌单列表',
    'recent-play': '最近播放'
  }
  public nameList = ['current-playlist', 'playlist-manager', 'recent-play']
  @Responsive()
  public currentView: string = currentViewBackup
  public changeView(name: NameType) {
    this.currentView = name
    currentViewBackup = name
  }
  @Project<TitleBarLeftController>()
  get currentViewName() {
    return this.nameMap[this.currentView]
  }
  @Listener({
    messageClass: TitleBarLeftControllerMessage
  })
  public onWheel(message: TitleBarLeftControllerMessage) {
    const { deltaY } = message.event
    let newName = ''
    if (deltaY > 0) {
      newName = this.nameList[(this.nameList.indexOf(this.currentView) + 1) % this.nameList.length]
    } else {
      newName =
        this.nameList[
          (this.nameList.indexOf(this.currentView) - 1 + this.nameList.length) %
            this.nameList.length
        ]
    }
    this.changeView(newName as NameType)
  }
}
