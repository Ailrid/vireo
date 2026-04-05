import { PlaySongMessage, SetPlaylistMessage } from '@/ccs/playback'
import { recommendSong, SongDetail, getAccentRGB } from '@/utils'
import { Controller, MessageWriter } from '@virid/core'
import { Responsive, OnHook } from '@virid/vue'
import { match } from 'ts-pattern'
let _isSidebarOpen = true

let _songs: SongDetail[] | null = null

let _colors: Map<number, string> = new Map()

@Controller()
export class RecommendedPageController {
  @Responsive()
  public isSidebarOpen: boolean = _isSidebarOpen
  public toggleSidebar() {
    _isSidebarOpen = !_isSidebarOpen
    this.isSidebarOpen = _isSidebarOpen
  }

  @Responsive()
  public songs: SongDetail[] | null = _songs

  @Responsive()
  public colors: Map<number, string> = _colors

  @OnHook('onSetup')
  async initRecommended() {
    if (this.songs) return
    const res = await recommendSong()
    match(res)
      .with({ ok: true }, ({ val }) => {
        this.songs = val.data
        _songs = val.data
        val.data.forEach(song => this.getColor(song))
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.write(
          new Error(val),
          '[RecommendedPageController] Failed to fetch recommended songs'
        )
      })
  }

  async getColor(song: SongDetail) {
    if (this.colors.has(song.id)) return
    const coverUrl = song.album.cover + '?param=64y64'
    const { avgColor } = await getAccentRGB(coverUrl)
    this.colors.set(song.id, `rgb(${avgColor[0]}, ${avgColor[1]}, ${avgColor[2]})`)
    _colors.set(song.id, `rgb(${avgColor[0]}, ${avgColor[1]}, ${avgColor[2]})`)
  }

  setPlaylist(song: SongDetail) {
    if (!this.songs) return
    SetPlaylistMessage.send(this.songs, {
      id: -1,
      name: 'recommended',
      cover: this.songs[0].album.cover,
      creator: {
        name: '',
        id: -1,
        avatar: ''
      },
      description: '每日推荐',
      songCount: this.songs.length,
      playCount: -1,
      createTime: 0,
      songsIds: this.songs.map(song => song.id),
      firstSongCover: this.songs[0].album.cover
    })
    PlaySongMessage.send(song)
  }

  /**
   * * 获取当前的月份和日期
   */
  getMonthAndDate() {
    const date = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }
  clearCache() {
    this.songs = null
    this.colors = new Map()
    _songs = null
    _colors = new Map()
  }
}
