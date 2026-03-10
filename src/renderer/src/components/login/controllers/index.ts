import { type ViridApp } from '@virid/core'
import { LoginDialogController } from './login-dialog'
import { QrLoginController } from './qr-login'
import { WindowLoginController } from './window-login'

export function bindLoginControllers(app: ViridApp) {
  app.bindController(LoginDialogController)
  app.bindController(QrLoginController)
  app.bindController(WindowLoginController)
}
export * from './login-dialog'
export * from './qr-login'
export * from './window-login'
