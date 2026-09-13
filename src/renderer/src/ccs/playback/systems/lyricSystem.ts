import { System, type ViridApp } from '@virid/core'
import { PlayerComponent, LyricComponent } from '../components'

import { SyncLyricMessage } from '../message'
import { SettingComponent } from '../../settings'
import { _SyncLyricMessage, EnableLyricMessage } from '../../electron'

export class LyricSystems {
  @System({
    messageClass: SyncLyricMessage
  })
  static syncLyric(
    settingComponent: SettingComponent,
    playerComponent: PlayerComponent,
    lyricComponent: LyricComponent
  ) {
    // 同步窗口歌词
    if (lyricComponent.destLyric && lyricComponent.lyric) {
      // 同步歌词
      _SyncLyricMessage.send(
        JSON.parse(JSON.stringify(settingComponent.theme)),
        JSON.parse(JSON.stringify(lyricComponent.lyric.lyrics[lyricComponent.currentIndex])),
        playerComponent.player.isPlaying
      )
    }
  }
  @System()
  static enableLyric(msg: EnableLyricMessage, lyricComponent: LyricComponent) {
    // true 歌词窗口创建完成后发送EnableLyricMessage，告诉渲染进程现在可以同步消息了
    // false 歌词窗口关闭后发送EnableLyricMessage，告诉渲染进程停止同步
    lyricComponent.destLyric = msg.enable
  }
}

export function registerLyricSystems(app: ViridApp) {
  app.register(LyricSystems.syncLyric)
  app.register(LyricSystems.enableLyric)
}
