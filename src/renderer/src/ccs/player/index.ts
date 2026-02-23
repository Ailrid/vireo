export * from './interface'
export * from './messages'
export * from './componets'
export * from './systems'
import { type ViridApp } from '@virid/core'
import { PlayerComponent, PlaylistComponent, LyricComponent } from './componets'

export function bindPlayer(app: ViridApp) {
  app.bindComponent(PlayerComponent)
  app.bindComponent(PlaylistComponent)
  app.bindComponent(LyricComponent)
}
