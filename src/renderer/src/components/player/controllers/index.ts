import { type ViridApp } from '@virid/core'
import { ButtonController } from './button'
import { SliderController } from './slider'
import { VolumeController } from './volume'
import { SongCardController } from './song-card'
export function bindPlayerControllers(app: ViridApp) {
  app.bindController(ButtonController)
  app.bindController(SliderController)
  app.bindController(VolumeController)
  app.bindController(SongCardController)
}
export * from './button'
export * from './slider'
export * from './volume'
export * from './song-card'
