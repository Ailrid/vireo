export * from './messages'
export * from './components'
export * from './systems'
import { type ViridApp } from '@virid/core'
import { PlayerComponent, PlaylistComponent, LyricComponent } from './components'

export function bindPlayback(app: ViridApp) {
  app.bindComponent(PlayerComponent)
  app.bindComponent(PlaylistComponent)
  app.bindComponent(LyricComponent)
}
