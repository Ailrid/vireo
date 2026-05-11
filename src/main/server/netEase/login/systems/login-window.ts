import { HttpSystem, NotFound, Ok } from '@virid/express'
import {
  OpenLoginWindowRequestMessage,
  CloseLoginWindowRequestMessage,
  FetchCookiesRequestMessage
} from '../message'
import { BrowserWindow } from 'electron'
import { Message, SingleMessage, System } from '@virid/core'
import { type OpenLoginWindowResponse, type CloseLoginWindowResponse } from '../types'
import { ToRendererMessage } from '@virid/main'
import { DatabaseComponent } from '@main/persistence'

//发送登陆完成消息
class NeteaseWindowMessage extends ToRendererMessage {
  __virid_messageType: string = 'login-netease-window'
  __virid_target: string = 'login'
}

class LoginWindowMessage extends SingleMessage {}

export class LoginCellphoneSystem {
  static loginWindow: BrowserWindow | null = null
  @System({
    messageClass: LoginWindowMessage
  })
  static async createWindow() {
    this.loginWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: '网易云官网登录',
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false
      }
    })
    const chromeUA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    this.loginWindow.webContents.setUserAgent(chromeUA)
    //删除原来的cookies
    await this.loginWindow.webContents.session.clearStorageData({
      storages: ['cookies']
    })
    // 加载官方登录入口
    this.loginWindow.loadURL('https://music.163.com/#/login')
    this.loginWindow.on('closed', () => {})
    // 监听并绑定事件
    let key = false
    this.loginWindow.webContents.session.cookies.on('changed', async () => {
      if (key) return
      key = true
      const allCookies = await this.loginWindow!.webContents.session.cookies.get({
        domain: '.music.163.com'
      })
      const hasCsrf = allCookies.find(c => c.name === '__csrf')
      const hasMusicU = allCookies.find(c => c.name === 'MUSIC_U')
      if (hasCsrf && hasMusicU) {
        NeteaseWindowMessage.send()
      } else {
        key = false
      }
    })
  }
  /**
   * * 打开官方登录窗口
   */
  @HttpSystem({
    messageClass: OpenLoginWindowRequestMessage
  })
  public static async open() {
    if (this.loginWindow && !this.loginWindow.isDestroyed()) {
      this.loginWindow.focus()
      return Ok({ code: 500, message: 'Window already exists' } as OpenLoginWindowResponse)
    }
    LoginWindowMessage.send()
    return Ok({ code: 200, message: 'Window created' } as OpenLoginWindowResponse)
  }

  /**
   * * 抠出结果，关闭窗口，并 Set-Cookie
   */
  @HttpSystem()
  public static async close(
    @Message(CloseLoginWindowRequestMessage) _message: CloseLoginWindowRequestMessage
  ) {
    if (!this.loginWindow || this.loginWindow.isDestroyed()) {
      LoginWindowMessage.send()
      //直接转发
      return NotFound('Window not found')
    }
    // 获取核心域名的 Cookie
    const allCookies = await this.loginWindow.webContents.session.cookies.get({
      domain: '.music.163.com'
    })
    // 清除cookie
    await this.loginWindow.webContents.session.clearStorageData({
      storages: ['cookies']
    })

    // 判定是否真的登录成功
    const hasCsrf = allCookies.find(c => c.name === '__csrf')
    const hasMusicU = allCookies.find(c => c.name === 'MUSIC_U')

    if (!hasCsrf || !hasMusicU) {
      return Ok({
        code: 500,
        message: 'Cookies not complete'
      } as CloseLoginWindowResponse)
    }

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
    this.loginWindow.close()
    this.loginWindow = null

    // 返回结果，Set-Cookie 会让前端浏览器层自动持久化
    return Ok({ code: 200, message: 'success' } as CloseLoginWindowResponse, {
      'Set-Cookie': setCookieHeaders
    })
  }
  /**
   * * 直接从数据库里尝试扣cookie出来
   */
  @HttpSystem()
  public static async cookies(
    @Message(FetchCookiesRequestMessage) _message: FetchCookiesRequestMessage,
    dbComponent: DatabaseComponent
  ) {
    const cookiesStr = dbComponent.db.getCookies()
    if (cookiesStr) {
      const setCookieHeaders = cookiesStr.split('\n')
      return Ok(
        { code: 200, message: 'success' },
        {
          'Set-Cookie': setCookieHeaders
        }
      )
    }
    return NotFound('Cookies not found')
  }
}
