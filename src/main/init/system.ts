import fs from 'fs'
import path from 'path'
import { System, MessageWriter, Message, ErrorMessage, WarnMessage, InfoMessage } from '@virid/core'
import {
  BootStrapElectronMessage,
  InitVireoMessage,
  RegisterProtocolMessage,
  RendererErrorMessage,
  RendererInfoMessage,
  RendererWarnMessage
} from './message'
import { electronApp } from '@electron-toolkit/utils'
import { app, net, BrowserWindow, protocol } from 'electron'
import { pathToFileURL } from 'url'
import { normalize, isAbsolute, join } from 'path'
import {
  CreateLoginWindowMessage,
  CreateMainWindowMessage,
  ShareMusicCommandMessage
} from '@main/windows'
import { DatabaseComponent, InitDatabaseMessage } from '@main/persistence'
import { InitServerMessage } from '@main/server'
import { ElectronComponent } from './component'
import { executeGroup, nextTick } from '@virid/std'
// 注册文件协议
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-file',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true
    }
  }
])

/**
 * * 应用初始化
 */
export class InitVireoSystem {
  @System()
  static async initVireo(
    @Message(InitVireoMessage) message: InitVireoMessage,
    electronComponent: ElectronComponent
  ) {
    electronComponent.port = message.port
    // 获得文件夹路径
    const userDataPath = app.getPath('userData')
    const dbPath = join(userDataPath, 'music.db')
    const cacheFilesPath = join(userDataPath, 'cache_files')
    // 触发初始化流程，连续执行四条消息
    const res = await executeGroup([
      new InitDatabaseMessage(dbPath, cacheFilesPath),
      new InitServerMessage(message.port),
      new RegisterProtocolMessage(),
      new BootStrapElectronMessage()
    ])
    if (res) {
      MessageWriter.info(
        '[InitVireoSystem] App Initialization Successful: All initialization work has been completed.'
      )
    } else {
      MessageWriter.error(
        new Error(
          `[InitVireoSystem] App Initialization Failed: Due to an error during the process, initialization has stopped and the app has exited`
        )
      )
      nextTick(() => {
        app.quit()
      })
    }
  }
}

export class InitElectronSystem {
  /**
   * * 注册各种协议
   */
  @System({
    messageClass: RegisterProtocolMessage
  })
  static async protocols() {
    await app.whenReady()
    /**
     * * 处理网易云协议
     */
    const PROTOCOL = 'orpheus'
    // 注册协议
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
      }
    } else {
      app.setAsDefaultProtocolClient(PROTOCOL)
    }

    // 监听热启动
    app.on('second-instance', (_event, commandLine) => {
      const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`))
      if (url) ShareMusicCommandMessage.send(url)
      // 唤醒主窗口
      const windows = BrowserWindow.getAllWindows()
      if (windows.length > 0) {
        const win = windows[0]
        if (win.isMinimized()) win.restore()
        win.show()
        win.focus()
      }
    })
    // 处理冷启动
    const startUrl = process.argv.find(arg => arg.startsWith(`${PROTOCOL}://`))
    if (startUrl) ShareMusicCommandMessage.send(startUrl)
    // 处理mac上的协议
    if (process.platform === 'darwin') {
      app.on('open-url', (event, url) => {
        event.preventDefault()
        ShareMusicCommandMessage.send(url)
      })
    }

    /**
     * * 处理本地文件协议
     */
    protocol.handle('local-file', request => {
      // 去掉协议头
      const rawPath = request.url.replace('local-file://', '')
      // 对路径进行解码
      const decodedPath = decodeURIComponent(rawPath)
      // 转换为标准平台路径并转为 file:// 格式
      try {
        const absolutePath = isAbsolute(decodedPath) ? decodedPath : `/${decodedPath}`
        const fileUrl = pathToFileURL(normalize(absolutePath)).toString()
        return net.fetch(fileUrl)
      } catch (e) {
        MessageWriter.error(
          e as Error,
          `[InitElectronSystem] Local File Protocol: Failed to load file.`
        )
        return new Response('File not found', { status: 404 })
      }
    })
    MessageWriter.info(
      '[InitElectronSystem] Protocol Registration Completed: Protocol Initialization completed.'
    )
  }

  /*
   *
   * 初始化electronApp
   */
  @System({
    messageClass: BootStrapElectronMessage
  })
  static async initApp(dbComponent: DatabaseComponent) {
    await app.whenReady()
    //配置设置
    electronApp.setAppUserModelId('com.ailrid.vireo')
    if (dbComponent.db.getCookies()) {
      CreateMainWindowMessage.send()
    } else {
      CreateLoginWindowMessage.send()
    }
    //mac用的东西
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0 && dbComponent.db.getCookies()) {
        CreateMainWindowMessage.send()
      }
    })
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    MessageWriter.info(
      '[InitElectronSystem] Electron Initialization Completed: Ready to create windows.'
    )
  }
}

/**
 * * 错误处理和日志系统
 */
export class LogSystem {
  private static logPath = path.join(app.getPath('userData'), 'app.log')

  private static write(level: string, context: string, detail?: any) {
    const time = new Date().toLocaleString()
    let logEntry = `[${time}] [${level}]\nContext: ${context}\n`
    if (detail) logEntry += `Detail: ${JSON.stringify(detail)}\n`
    fs.appendFile(this.logPath, logEntry, err => {
      if (err) console.error('Failed to write log:', err)
    })
  }

  @System()
  static error(@Message(ErrorMessage) message: ErrorMessage) {
    this.write('MAIN ERROR', message.context || '', {
      message: message.error.message,
      stack: message.error.stack
    })
  }

  @System()
  static warn(@Message(WarnMessage) message: WarnMessage) {
    this.write('MAIN WARN', message.context)
  }

  @System()
  static info(@Message(InfoMessage) message: InfoMessage) {
    this.write('MAIN INFO', message.context)
  }

  @System()
  static rendererError(@Message(RendererErrorMessage) message: RendererErrorMessage) {
    this.write(`${message.__virid_source.toLocaleUpperCase()} ERROR`, message.context || '', {
      message: message.message
    })
  }

  @System()
  static rendererWarn(@Message(RendererWarnMessage) message: RendererWarnMessage) {
    this.write(`${message.__virid_source.toLocaleUpperCase()} WARN`, message.context)
  }

  @System()
  static rendererInfo(@Message(RendererInfoMessage) message: RendererInfoMessage) {
    this.write(`${message.__virid_source.toLocaleUpperCase()} INFO`, message.context)
  }
}
