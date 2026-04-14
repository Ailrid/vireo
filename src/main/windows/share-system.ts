import { clipboard, type BrowserWindow } from 'electron'
import {
  ShareMusicCommandMessage,
  PlaySongMessage,
  SetCommandQueueMessage,
  CheckClipboardMessage,
  SetPlaylistMessage
} from './message'
import { System, Message, MessageWriter } from '@virid/core'
import { WindowComponent } from './component'

/**
 * * 网易云分享系统
 */
export class MusicShareSystem {
  private static lastHandledText = ''

  @System({
    messageClass: CheckClipboardMessage
  })
  static checkClipboard() {
    const text = clipboard.readText().trim()
    if (text === this.lastHandledText) return // 跳过重复执行
    if (text.startsWith('orpheus://') || text.includes('music.163.com')) {
      this.lastHandledText = text
      // 处理url
      ShareMusicCommandMessage.send(text)
    }
  }

  /**
   * * 处理 orpheus://协议或者music.163.com的连接
   */
  @System()
  static processMusicCommand(
    @Message(ShareMusicCommandMessage) message: ShareMusicCommandMessage,
    windowComponent: WindowComponent
  ) {
    const rawUrl = message.url
    const mainWindow = windowComponent.windows.get('mainWindow')
    if (rawUrl.includes('music.163.com') && rawUrl.startsWith('https://')) {
      // 如果是网址，解析其中的song?id=xxx或者playlist?id=xxx参数
      const url = new URL(rawUrl.replace('/#/', '/'))
      const id = url.searchParams.get('id')
      const type = url.pathname.includes('playlist') ? 'playlist' : 'song'
      // 根据指令执行动作
      if (type && id) this.sendCommand(type, id, mainWindow)
    } else if (rawUrl.includes('orpheus://')) {
      try {
        // 去掉协议头 orpheus:// 和可能存在的冗余斜杠
        const base64Part = rawUrl.replace('orpheus://', '').replace(/^\/+/, '')
        if (!base64Part) return
        // Base64 解码
        const jsonStr = Buffer.from(base64Part, 'base64').toString('utf8')
        const data = JSON.parse(jsonStr)
        // 根据指令执行动作
        if (data.type && data.id) this.sendCommand(data.type, data.id, mainWindow)
      } catch (err) {
        MessageWriter.error(err as Error, `[MusicShareSystem] Unable to parse URL : ${rawUrl}`)
      }
    }
  }

  /**
   * * 发射消息或者暂时缓存
   */
  private static sendCommand(
    type: 'song' | 'playlist',
    id: string,
    window: BrowserWindow | undefined
  ) {
    const command = () => {
      if (type === 'song') PlaySongMessage.send(id)
      else if (type === 'playlist') SetPlaylistMessage.send(id)
    }

    // 如果窗口已经好了，直接发射消息
    if (window) command()
    else SetCommandQueueMessage.send('mainWindow', command) // 否则暂时缓存起来
  }
}
