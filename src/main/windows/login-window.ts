import { BrowserWindow, shell } from 'electron'
import {
  CreateLoginWindowMessage,
  SetCommandQueueMessage,
  CheckClipboardMessage,
  NeteaseLoginSuccessMessage,
  CreateMainWindowMessage
} from './message'
import { System, MessageWriter, SingleMessage } from '@virid/core'
import { join } from 'path'
import icon from '../../../resources/icon.png?asset'
import { WindowComponent } from './component'
import { ElectronComponent } from '@main/init'
import { DatabaseComponent } from '@main/persistence'
class FetchCookieMessage extends SingleMessage {}

export class LoginWindowSystem {
  /*
   * 创建登陆窗口
   */
  @System({
    messageClass: CreateLoginWindowMessage
  })
  static createLoginWindow(windowComponent: WindowComponent, electronComponent: ElectronComponent) {
    if (windowComponent.windows.has('loginWindow')) return
    const loginWindow = new BrowserWindow({
      width: 350,
      height: 500,
      minWidth: 350,
      minHeight: 500,
      show: false,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: false,
      backgroundColor: '#00000000',
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })
    // 注册自己
    windowComponent.windows.set('loginWindow', loginWindow)
    loginWindow.on('closed', () => {
      windowComponent.windows.delete('loginWindow')
    })
    loginWindow.on('ready-to-show', () => {
      loginWindow.show()
    })

    // 获得焦点时自动检查一遍剪切板
    loginWindow.on('focus', () => {
      CheckClipboardMessage.send()
    })
    loginWindow.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    // 先清空cookie，确保每次登录都是新的会话
    loginWindow.webContents.session.clearStorageData({
      storages: ['cookies']
    })
    // 当检测到需要的cookie之后，发送一个获取cookie消息
    let key = false
    loginWindow.webContents.session.cookies.on('changed', async () => {
      if (key) return
      key = true
      const allCookies = await loginWindow!.webContents.session.cookies.get({
        domain: 'localhost'
      })
      const hasCsrf = allCookies.find(c => c.name === '__csrf')
      const hasMusicU = allCookies.find(c => c.name === 'MUSIC_U')
      if (hasCsrf && hasMusicU) {
        FetchCookieMessage.send()
      } else {
        key = false
      }
    })
    loginWindow.loadURL(`http://localhost:${electronComponent.port}/login.html`)

    MessageWriter.info(
      '[LoginWindowSystem] Created LoginWindow: Initialize window and mount page completed.'
    )
  }

  /**
   * 抠出结果，关闭窗口，并 Set-Cookie
   */
  @System({
    messageClass: FetchCookieMessage
  })
  static async fetchCookie(windowComponent: WindowComponent, dbComponent: DatabaseComponent) {
    const loginWindow = windowComponent.windows.get('loginWindow')
    // 要是没有窗口就重新去发送一下
    if (!loginWindow || loginWindow.isDestroyed()) {
      CreateLoginWindowMessage.send()
      return
    }
    const setCookieHeaders = await tryGetCookies(loginWindow)
    if (!setCookieHeaders) return
    // 关闭窗口然后发送一个消息给主窗口，让他过来拿cookie
    loginWindow.close()
    dbComponent.db.setCookies(setCookieHeaders.join('\n'))
    // 添加一个命令，打开主窗口的时候让主窗口来拿cookies
    SetCommandQueueMessage.send('mainWindow', () => {
      NeteaseLoginSuccessMessage.send()
    })
    CreateMainWindowMessage.send()
  }
}

async function tryGetCookies(window: BrowserWindow): Promise<string[] | null> {
  const allCookies = await window.webContents.session.cookies.get({
    domain: 'localhost'
  })

  // 判定是否真的登录成功
  const hasCsrf = allCookies.find(c => c.name === '__csrf')
  const hasMusicU = allCookies.find(c => c.name === 'MUSIC_U')

  if (!hasCsrf || !hasMusicU) {
    MessageWriter.error(
      new Error('[BrowserWindowSystem] Cookies Not Found: Login failed, please try again.')
    )
    return null
  }
  // 清除cookie
  await window.webContents.session.clearStorageData({
    storages: ['cookies']
  })
  const requiredKeys = ['__csrf', 'MUSIC_U', 'MUSIC_A_T', 'MUSIC_R_T']

  // 转换并注入生命周期
  const setCookieHeaders = allCookies
    .filter(c => requiredKeys.includes(c.name))
    .map(c => {
      let cookieStr = `${c.name}=${c.value}; Path=/;domain=localhost;`

      // 处理过期时间：将 Unix 时间戳转换为 Max-Age
      if (c.expirationDate) {
        const maxAge = Math.floor(c.expirationDate - Date.now() / 1000)
        if (maxAge > 0) {
          cookieStr += ` Max-Age=${maxAge};`
        }
      } else {
        cookieStr += ` Max-Age=31536000;`
      }
      if (c.secure) cookieStr += ' Secure;'
      return cookieStr
    })
  return setCookieHeaders
}
