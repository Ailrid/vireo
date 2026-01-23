import { WindowMenu } from './menu'
import { type BrowserWindow } from 'electron'
export function windowIpc(mainWindow: BrowserWindow): void {
  new WindowMenu(mainWindow)
}
