import { registerMediaSessionSystems } from './mediaSessionSystem'
import { registerPlayerSystems } from './playerSystem'
import { registerPlaylistSystems } from './playlistSystem'
import { registerLyricSystems } from './lyricSystem'
import { type ViridApp } from '@virid/core'
export function registerPlaybackBunch(app: ViridApp) {
  registerMediaSessionSystems(app)
  registerPlayerSystems(app)
  registerPlaylistSystems(app)
  registerLyricSystems(app)
}
