import { type ViridApp } from '@virid/core'
import { LyricController } from './lyric'

export function bindLyricControllers(app: ViridApp) {
  app.bind(LyricController)
}
export * from './lyric'
