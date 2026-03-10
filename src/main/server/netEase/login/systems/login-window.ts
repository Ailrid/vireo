import { HttpSystem, Ok } from '@virid/express'
import { OpenLoginWindowRequestMessage, CloseLoginWindowRequestMessage } from '../message'
import { BrowserWindow } from 'electron'
import { Message } from '@virid/core'
import { type OpenLoginWindowResponse, type CloseLoginWindowResponse } from '../types'
import { ToRenderMessage } from '@virid/main'

let loginWindow: BrowserWindow | null = null
//发送登陆完成消息
class NeteaseWindowMessage extends ToRenderMessage {
  __virid_messageType: string = 'login-netease-window'
  __virid_target: string = 'renderer'
}

export class LoginCellphoneSystem {
  /**
   * 打开官方登录窗口 (黑盒模式)
   */
  @HttpSystem({
    messageClass: OpenLoginWindowRequestMessage
  })
  public static async open() {
    if (loginWindow && !loginWindow.isDestroyed()) {
      loginWindow.focus()
      return Ok({ code: 500, message: 'Window already exists' } as OpenLoginWindowResponse)
    }

    loginWindow = new BrowserWindow({
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
    loginWindow.webContents.setUserAgent(chromeUA)
    //删除原来的cookies
    await loginWindow.webContents.session.clearStorageData({
      storages: ['cookies']
    })
    // 加载官方登录入口
    loginWindow.loadURL('https://music.163.com/#/login')
    // 监听并绑定事件
    loginWindow.webContents.session.cookies.on(
      'changed',
      async (_event, _cookie, _cause, removed) => {
        if (removed || !loginWindow) return
        const allCookies = await loginWindow.webContents.session.cookies.get({})
        const hasCsrf = allCookies.find(c => c.name === '__csrf')
        const hasMusicU = allCookies.find(c => c.name === 'MUSIC_U')
        if (hasCsrf && hasMusicU) {
          NeteaseWindowMessage.send()
        }
      }
    )
    return Ok({ code: 200, message: 'Window created' } as OpenLoginWindowResponse)
  }

  /**
   * 抠出结果，关闭窗口，并 Set-Cookie
   */
  @HttpSystem()
  public static async close(
    @Message(CloseLoginWindowRequestMessage) message: CloseLoginWindowRequestMessage
  ) {
    if (!loginWindow || loginWindow.isDestroyed()) {
      //直接转发
      return new OpenLoginWindowRequestMessage(message.requestId)
    }
    // 获取核心域名的 Cookie
    const allCookies = await loginWindow.webContents.session.cookies.get({
      domain: '.music.163.com'
    })

    // 判定是否真的登录成功
    const hasCsrf = allCookies.find(c => c.name === '__csrf')
    const hasMusicU = allCookies.find(c => c.name === 'MUSIC_U')

    if (!hasCsrf || !hasMusicU) {
      return Ok({
        code: 500,
        message: '登录凭证不完整，请确保已在窗口内完成登录'
      } as CloseLoginWindowResponse)
    }

    // 核心字段白名单：加上 A_T 和 R_T 会更稳健
    const requiredKeys = ['__csrf', 'MUSIC_U', 'MUSIC_A_T', 'MUSIC_R_T']

    // 转换并注入生命周期
    const setCookieHeaders = allCookies
      .filter(c => requiredKeys.includes(c.name))
      .map(c => {
        let cookieStr = `${c.name}=${c.value}; Path=/;`

        // 处理过期时间：将 Unix 时间戳转换为 Max-Age
        if (c.expirationDate) {
          const maxAge = Math.floor(c.expirationDate - Date.now() / 1000)
          if (maxAge > 0) {
            cookieStr += ` Max-Age=${maxAge};`
          }
        } else {
          // 如果没有 expirationDate，手动给个一年，防止变成 Session Cookie
          cookieStr += ` Max-Age=31536000;`
        }

        // 安全与策略限制
        if (c.secure) cookieStr += ' Secure;'
        if (c.httpOnly) cookieStr += ' HttpOnly;'

        return cookieStr
      })
    loginWindow.close()
    loginWindow = null

    // 返回结果，Set-Cookie 会让前端浏览器层自动持久化
    return Ok({ code: 200, message: '登录成功' } as CloseLoginWindowResponse, {
      'Set-Cookie': setCookieHeaders
    })
  }
}
