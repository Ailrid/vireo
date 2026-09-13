import { System, type ViridApp } from '@virid/core'
import { type RendererPlugin } from '@virid/renderer'
import { SyncLyricMessage } from './message'
import { DestLyricComponent } from './component'

export class LyricSystems {
  @System()
  static async syncLyric(msg: SyncLyricMessage, lyricComponent: DestLyricComponent) {
    lyricComponent.lyric = msg.lyric
    lyricComponent.theme = msg.theme
    lyricComponent.isPlaying = msg.isPlaying
  }
}

export function registerLyricSystems(app: ViridApp, plugin: RendererPlugin) {
  plugin.bindRoute(SyncLyricMessage)
  app.register(LyricSystems.syncLyric)
}
