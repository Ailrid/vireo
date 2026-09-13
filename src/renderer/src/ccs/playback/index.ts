export * from './message'
export * from './components'
export * from './systems'
import { type ViridApp } from '@virid/core'
import { PlayerComponent, PlaylistComponent, LyricComponent } from './components'
import { registerPlaybackBunch } from './systems'
export function playbackBunch(app: ViridApp) {
  app.bind(PlayerComponent)
  app.bind(PlaylistComponent)
  app.bind(LyricComponent)
  registerPlaybackBunch(app)
}
