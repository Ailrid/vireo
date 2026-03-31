import { System, MessageWriter, Message, ErrorMessage, WarnMessage, InfoMessage } from '@virid/core'
import { CreateMainWindowMessage, BootStrapElectronMessage, CommandQueueMessage } from './message'
import { electronApp } from '@electron-toolkit/utils'
import { app, shell, net, BrowserWindow, protocol, clipboard } from 'electron'
import { pathToFileURL } from 'url'
import { join, normalize, isAbsolute } from 'path'
import icon from '../../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import { PlaySongMessage, SetPlaylistMessage } from '@main/windows'

export class InitSystem {
  public static mainWindow: BrowserWindow | null = null
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

  /**
   * * 注册各种协议
   */
  @System({
    messageClass: BootStrapElectronMessage,
    priority: 100
  })
  static protocols() {
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
    // 单例锁与二次启动监听
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit()
      return
    }
    // 监听热启动
    app.on('second-instance', (_event, commandLine) => {
      const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`))
      if (url) {
        this.processMusicCommand(url)
      }
      // 唤醒主窗口
      const windows = BrowserWindow.getAllWindows()
      if (windows.length > 0) {
        if (windows[0].isMinimized()) windows[0].restore()
        windows[0].focus()
      }
    })
    // 处理冷启动
    const startUrl = process.argv.find(arg => arg.startsWith(`${PROTOCOL}://`))
    if (startUrl) {
      this.processMusicCommand(startUrl)
    }
    // 处理mac上的协议
    if (process.platform === 'darwin') {
      app.on('open-url', (event, url) => {
        event.preventDefault()
        this.processMusicCommand(url)
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
        MessageWriter.error(e as Error, `[Main] Local File Protocol: Failed to load file.`)
        return new Response('File not found', { status: 404 })
      }
    })
  }

  /*
   *
   * 初始化electronApp
   */
  @System()
  static initApp(@Message(BootStrapElectronMessage) message: BootStrapElectronMessage) {
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
  private static lastHandledText = ''
  /*
   * 初始化主窗口
   */
  @System()
  static createMainWindow(@Message(CreateMainWindowMessage) message: CreateMainWindowMessage) {
    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
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
      mainWindow!.show()
      this.mainWindow = mainWindow
      CommandQueueMessage.send('mainWindow')
    })
    // 获得焦点时自动检查一遍剪切板
    mainWindow.on('focus', () => {
      const text = clipboard.readText().trim()
      if (text === this.lastHandledText) return // 跳过重复执行
      if (text.startsWith('orpheus://') || text.includes('music.163.com')) {
        this.lastHandledText = text
        this.processMusicCommand(text)
      }
    })

    mainWindow.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    mainWindow.loadURL(`http://localhost:${message.port}`)
    MessageWriter.info('[Main] MainWindow: Initialize window and mount page completed.')
  }

  private static commandQueue: Map<string, Array<() => void>> = new Map()
  @System()
  static mainWindowReady(@Message(CommandQueueMessage) message: CommandQueueMessage) {
    // 执行所有暂存的命令
    InitSystem.commandQueue.get(message.command)?.forEach(fn => fn())
  }

  /**
   * * 处理 orpheus://协议或者music.163.com的连接
   */
  private static processMusicCommand(rawUrl: string) {
    if (rawUrl.includes('music.163.com') && rawUrl.startsWith('https://')) {
      // 如果是网址，解析其中的song?id=xxx或者playlist?id=xxx参数
      const url = new URL(rawUrl.replace('/#/', '/'))
      const id = url.searchParams.get('id')
      const type = url.pathname.includes('playlist') ? 'playlist' : 'song'
      // 根据指令执行动作
      if (type && id) this.sendCommand(type, id)
    } else if (rawUrl.includes('orpheus://')) {
      try {
        // 去掉协议头 orpheus:// 和可能存在的冗余斜杠
        const base64Part = rawUrl.replace('orpheus://', '').replace(/^\/+/, '')
        if (!base64Part) return
        // Base64 解码
        const jsonStr = Buffer.from(base64Part, 'base64').toString('utf8')
        const data = JSON.parse(jsonStr)
        // 根据指令执行动作
        if (data.type && data.id) this.sendCommand(data.type, data.id)
      } catch (err) {
        MessageWriter.error(err as Error, `[Protocol] 解析指令失败: ${rawUrl}`)
      }
    }
  }

  /**
   * * 发射消息或者暂时缓存
   */
  private static sendCommand(type: 'song' | 'playlist', id: string) {
    const command = () => {
      if (type === 'song') PlaySongMessage.send(id)
      else if (type === 'playlist') SetPlaylistMessage.send(id)
    }

    // 如果窗口已经好了，直接发射消息
    if (this.mainWindow) {
      command()
    } else {
      // 否则暂时缓存起来
      const commandArray = this.commandQueue.get('mainWindow') || []
      commandArray.push(command)
      this.commandQueue.set('mainWindow', commandArray)
    }
  }
}

/**
 * * 错误处理和日志系统
 */
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
