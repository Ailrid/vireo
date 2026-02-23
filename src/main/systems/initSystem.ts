import { System, Message, MessageWriter } from '@virid/core'
import { InitializationMessage } from '@main/messages'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { server } from '@main/server'
import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import icon from '../../../resources/icon.png?asset'
import { DatabaseComponent } from '@main/components'
import Database from 'better-sqlite3'
import fs from 'fs'
import { activateDb } from '@main/server'

const PORT = '1566'

export class InitSystem {
  @System()
  static initApp(@Message(InitializationMessage) _message: InitializationMessage) {
    //启动服务器
    server.listen(PORT, () => {
      MessageWriter.info(`Server listening on port ${PORT}`)
    })
    //配置设置
    electronApp.setAppUserModelId('starry')
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    //创建窗口
    InitSystem.createMainWindow()
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) InitSystem.createMainWindow()
    })
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    MessageWriter.info('Initialization completed.')
  }
  @System(100)
  static initDatabase(
    @Message(InitializationMessage) _message: InitializationMessage,
    dbComp: DatabaseComponent
  ) {
    //获得文件夹路径
    const userDataPath = app.getPath('userData')
    const dbPath = join(userDataPath, 'music.db')
    const cacheFilesPath = join(userDataPath, 'cache_files')
    if (!fs.existsSync(cacheFilesPath)) {
      fs.mkdirSync(cacheFilesPath, { recursive: true })
    }

    // 绑定数据库
    dbComp.db = new Database(dbPath)
    dbComp.cachePath = cacheFilesPath

    // 初始化歌曲缓存表
    dbComp.db.exec(`
  CREATE TABLE IF NOT EXISTS song_cache (
    id INTEGER PRIMARY KEY,
    md5 TEXT,
    local_path TEXT,
    size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)
    //初始化歌词缓存表
    dbComp.db.exec(`
  CREATE TABLE IF NOT EXISTS lyric_cache (
    id INTEGER PRIMARY KEY,
    lyrics_json TEXT,       
    is_pure INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)
    activateDb(dbComp)
    MessageWriter.info('Database and Cache path bound successfully.')
  }
  static createMainWindow() {
    const mainWindow = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    mainWindow.loadURL(`http://localhost:${PORT}`)
    MessageWriter.info('Initialize window and mount page completed.')
  }
}
