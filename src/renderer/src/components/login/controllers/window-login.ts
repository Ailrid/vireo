import { Controller, MessageWriter } from '@virid/core'
import { openLoginWindow, closeLoginWindow } from '@/utils/server'
import { match } from 'ts-pattern'
import { Listener, Responsive } from '@virid/vue'
import { FetchUserAccountMessage } from '@/ccs/user'
import { FromIpc, FromMainMessage } from '@virid/renderer'
//监听主进程发来的消息，一旦登陆完成，获取cookies
@FromIpc('login-netease-window')
class NeteaseWindowMessage extends FromMainMessage {}

@Controller()
export class WindowLoginController {
  @Responsive()
  public loginStatus: 'idle' | 'waiting' | 'success' | 'error' = 'idle'

  @Responsive()
  public loginInfo: string = '待登录'

  /**
   * *唤起网易云官方登录窗口
   */
  public async openWindow() {
    this.loginStatus = 'waiting'
    this.loginInfo = '正在呼叫官方登录窗口...'

    const res = await openLoginWindow()
    match(res)
      .with({ ok: true }, ({ val }) => {
        if (val.code === 200) {
          this.loginInfo = '窗口已打开，请在其中完成登录'
        } else {
          this.loginInfo = '登录窗口已经在任务栏闪烁'
        }
      })
      .with({ ok: false }, ({ val }) => {
        this.loginStatus = 'error'
        this.loginInfo = '无法打开窗口，请检查网络或重启'
        MessageWriter.error(new Error(val), '[Login Window] Open Failed')
      })
      .otherwise(() => {})
  }

  /**
   * *收割 Cookie 并关闭窗口
   */
  public async closeWindow() {
    this.loginInfo = '正在验证登录状态...'
    const res = await closeLoginWindow()

    match(res)
      .with({ ok: true }, ({ val }) => {
        if (val.code === 200) {
          this.loginStatus = 'success'
          this.loginInfo = '身份认证成功，欢迎回来'
          // 这里的 Cookie 已经被 HttpSystem 自动 Set-Cookie 了
          // 直接触发账号信息拉取即可
          FetchUserAccountMessage.send()
        } else {
          this.loginStatus = 'error'
          this.loginInfo = '未检测到登录成功，请重新尝试'
        }
      })
      .with({ ok: false }, ({ val }) => {
        this.loginStatus = 'error'
        this.loginInfo = '收割 Cookie 失败'
        MessageWriter.error(new Error(val), '[Login Window] Close Failed')
      })
      .otherwise(() => {})
  }
  /**
   * *监听登录窗口消息
   */
  @Listener(NeteaseWindowMessage)
  public onNeteaseWindowMessage() {
    this.closeWindow()
  }
}
