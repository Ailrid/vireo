import { type ViridApp } from '@virid/core'
import { VirtualListController } from './virtual-list'
import { ScrubberController } from './scrubber'
import { ShareDialogController, MainPlaySongMessage, MainPlayPlaylistMessage } from './share-dialog'
import { type RendererPlugin } from '@virid/renderer'

export function bindPublicControllers(app: ViridApp, plugin: RendererPlugin) {
  app.bind(VirtualListController)
  app.bind(ScrubberController)
  app.bind(ShareDialogController)
  plugin.bindRoute(MainPlaySongMessage)
  plugin.bindRoute(MainPlayPlaylistMessage)
}
export * from './virtual-list'
export * from './scrubber'
export * from './share-dialog'
