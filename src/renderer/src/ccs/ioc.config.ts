import { createVirid } from '@virid/core'
import { VuePlugin } from '@virid/vue'
import { RenderPlugin } from '@virid/renderer'
import { bindPlayer, PlaySongMessage } from './player'
import { InitializationMessage } from './init'
const app = createVirid()
app.use(VuePlugin, {})
app.use(RenderPlugin, {
  windowId: 'renderer',
  messageMap: {}
})
/**
 * 所有的 Controller 和 Component 都在这里排队登记
 */
export function bootstrapDI() {
  bindPlayer(app)
  // 启动初始化
  InitializationMessage.send()
  setTimeout(() => {
    PlaySongMessage.send({
      // 核心标识
      id: 3318007487, // 框架全局 ID
      platformId: '3318007487', // 原始 ID (网易云的数字 ID 或本地文件的 MD5/路径)
      source: 'netease',
      name: 'ROCK IN!', // 歌名
      artists: [{ id: 58234922, name: 'Koseki Bijou' }],
      album: {
        id: 350436328,
        name: 'ROCK IN!',
        cover: 'http://p2.music.126.net/-xMsdc0MbIZ09x8COxx31g==/109951172283840080.jpg'
      },
      duration: 217, // 统一毫秒
      isAvailable: true // 是否有版权/文件是否存在
    })
  }, 1000)
}
