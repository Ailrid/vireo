import { type ViridApp } from '@virid/core'
import { VirtualListController } from './virtual-list'
import { ScrubberController } from './scrubber'

export function bindPublicControllers(app: ViridApp) {
  app.bindController(VirtualListController)
  app.bindController(ScrubberController)
}
export * from './virtual-list'
export * from './scrubber'
