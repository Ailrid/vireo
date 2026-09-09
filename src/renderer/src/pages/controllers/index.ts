import { type ViridApp } from '@virid/core'
import { UserPlaylistPageController } from './user-playlist'
import { PlayerPageController } from './player'
import { HomePageController } from './home'
import { PlaylistPageController } from './playlist'
import { RecommendedPageController } from './recommended'
import { AlbumPageController } from './album'
import { ArtistPageController } from './artist'
import { SearchController } from './search'
import { AccountController } from './account'
export function bindPageControllers(app: ViridApp) {
  app.bind(UserPlaylistPageController)
  app.bind(PlayerPageController)
  app.bind(HomePageController)
  app.bind(PlaylistPageController)
  app.bind(RecommendedPageController)
  app.bind(AlbumPageController)
  app.bind(ArtistPageController)
  app.bind(SearchController)
  app.bind(AccountController)
}

export * from './user-playlist'
export * from './player'
export * from './home'
export * from './playlist'
export * from './recommended'
export * from './album'
export * from './artist'
export * from './search'
export * from './account'
