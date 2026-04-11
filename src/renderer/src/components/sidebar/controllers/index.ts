import { type ViridApp } from '@virid/core'
import { CurrentPlaylistController } from './current-playlist'
import { PlaylistManagerController } from './playlist-manager'
import { MenuAreaController } from './menu-area'
import { SideBarController } from './side-bar'

export function bindSidebarControllers(app: ViridApp) {
  app.bindController(CurrentPlaylistController)
  app.bindController(PlaylistManagerController)
  app.bindController(MenuAreaController)
  app.bindController(SideBarController)
}

export * from './current-playlist'
export * from './playlist-manager'
export * from './menu-area'
export * from './side-bar'
