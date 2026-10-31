import { System, type ViridApp } from '@virid/core'
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

export function registerLyricSystems(app: ViridApp) {
  app.register(LyricSystems.syncLyric)
}
