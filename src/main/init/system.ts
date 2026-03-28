import { System, MessageWriter, Message, ErrorMessage, WarnMessage, InfoMessage } from '@virid/core'
import { CreateMainWindowMessage, BootStrapElectronMessage } from './message'
import { electronApp } from '@electron-toolkit/utils'
import { app, shell, net, BrowserWindow, protocol } from 'electron'
import { pathToFileURL } from 'url'
import { join, normalize, isAbsolute } from 'path'
import icon from '../../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'

export class InitSystem {
  static registerProtocols() {
    // 必须在 app ready 之前调用
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
  }
  /*
   *
   * 初始化electronApp
   */
  @System()
  static initApp(@Message(BootStrapElectronMessage) message: BootStrapElectronMessage) {
    // 处理协议的具体逻辑
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
        MessageWriter.error(e as Error, `[Main] Local File Protocol: Failed to load file.`)
        return new Response('File not found', { status: 404 })
      }
    })
    //配置设置
    electronApp.setAppUserModelId('starry')
    //创建窗口
    CreateMainWindowMessage.send(message.port)
    //mac用的东西
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) CreateMainWindowMessage.send(message.port)
    })
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    MessageWriter.info('[Main] Initialization: App Initialization completed.')
  }
  /*
   * 初始化主窗口
   */
  @System()
  static createMainWindow(@Message(CreateMainWindowMessage) message: CreateMainWindowMessage) {
    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900, // 保证最少能看清两列
      minHeight: 600, // 保证播放条不会遮挡内容
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

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    mainWindow.loadURL(`http://localhost:${message.port}`)
    MessageWriter.info('[Main] MainWindow: Initialize window and mount page completed.')
  }
}

export class LogSystem {
  private static logPath = path.join(app.getPath('userData'), 'app.log')

  private static write(level: string, context: string, detail?: any) {
    const time = new Date().toLocaleString()
    const logEntry = `[${time}] [${level}] [${context}]: ${JSON.stringify(detail || '')}\n`
    fs.appendFile(this.logPath, logEntry, err => {
      if (err) console.error('Failed to write log:', err)
    })
  }

  @System()
  static error(@Message(ErrorMessage) message: ErrorMessage) {
    this.write('ERROR', message.context || '', {
      message: message.error.message,
      stack: message.error.stack
    })
  }

  @System()
  static warn(@Message(WarnMessage) message: WarnMessage) {
    this.write('WARN', message.context, {})
  }

  @System()
  static info(@Message(InfoMessage) message: InfoMessage) {
    this.write('INFO', message.context, {})
  }
}
