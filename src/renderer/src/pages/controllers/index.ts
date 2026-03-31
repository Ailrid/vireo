import { type ViridApp } from '@virid/core'
import { UserPlaylistPageController } from './user-playlist'
import { PlayerPageController } from './player'
import { HomePageController } from './home'
import { PlaylistPageController } from './playlist'
import { RecommendedPageController } from './recommended'
export function bindPageControllers(app: ViridApp) {
  app.bindController(UserPlaylistPageController)
  app.bindController(PlayerPageController)
  app.bindController(HomePageController)
  app.bindController(PlaylistPageController)
  app.bindController(RecommendedPageController)
}

export * from './user-playlist'
export * from './player'
export * from './home'
export * from './playlist'
export * from './recommended'
