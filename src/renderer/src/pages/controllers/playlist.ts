import { PlaySongMessage, SetPlaylistMessage } from '@/ccs/playback'
import { playlistDetail, songDetail, SongDetail, type PlaylistDetail } from '@/utils'
import { Controller, MessageWriter, SingleMessage } from '@virid/core'
import { Project, Responsive, Use, Listener, OnHook } from '@virid/vue'
import { match } from 'ts-pattern'
import { useRoute } from 'vue-router'
const PAGE_SIZE = 200
let _isSidebarOpen = true

export class PlaylistPageChangeMessage extends SingleMessage {
  constructor(public pageIndex: number) {
    super()
  }
}

@Controller()
export class PlaylistPageController {
  @Responsive()
  public isSidebarOpen: boolean = _isSidebarOpen

  public toggleSidebar() {
    _isSidebarOpen = !_isSidebarOpen
    this.isSidebarOpen = _isSidebarOpen
  }
  // 注入路由
  @Use(() => useRoute())
  public route!: ReturnType<typeof useRoute>

  // 歌单信息
  @Responsive()
  public playlistsDetail: PlaylistDetail | null = null
  // 歌单歌曲
  @Responsive()
  public playlistsSongs: Map<number, SongDetail[]> | null = null

  // 当前的页面
  @Responsive()
  public pageIndex: number = 0

  //当前的歌单id
  @Project()
  get playlistId(): number | null {
    const id = this.route.params.id
    return id ? Number(id) : null
  }
  @Project()
  get maxPageLength() {
    if (!this.playlistsDetail) return 0
    const count = this.playlistsDetail.songCount || 0
    return Math.ceil(count / 200) || 1
  }
  @Project()
  get currentPageSong(): SongDetail[] | null {
    if (!this.playlistsSongs?.has(this.pageIndex)) return null
    return this.playlistsSongs.get(this.pageIndex)!
  }

  /**
   * * 设置播放列表为此页
   */
  setPlaylist(song: SongDetail | null) {
    if (!this.playlistsDetail || !this.playlistsSongs || !song) return
    //替换歌单并播放第一首
    SetPlaylistMessage.send(this.playlistsSongs.get(this.pageIndex)!, this.playlistsDetail)
    PlaySongMessage.send(song)
  }
  /**
   * * 改变页面的时候获取新的数据
   */
  @Listener({
    messageClass: PlaylistPageChangeMessage
  })
  public onPageChange(message: PlaylistPageChangeMessage) {
    this.pageIndex = message.pageIndex
    this.getPlaylistSongs()
  }
  /**
   * * 页面加载时初始化
   */
  @OnHook('onSetup')
  public initPageData() {
    this.getPlaylistDetail().then(() => {
      this.getPlaylistSongs()
    })
  }
  /**
   * * 获取歌单信息
   */
  public async getPlaylistDetail() {
    const detail = await playlistDetail({
      id: this.playlistId!
    })
    match(detail)
      .with({ ok: true }, async ({ val }) => {
        this.playlistsDetail = val.playlist
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val), '[Playlist Page] Failed To Fetch User Playlist Detail')
      })
  }
  /**
   * * 获取页面歌曲
   */
  public async getPlaylistSongs() {
    if ((this.playlistsSongs && this.playlistsSongs.get(this.pageIndex)) || !this.playlistsDetail)
      return
    const songsIds = this.playlistsDetail.songsIds
    //计算这一页的开始索引和结束索引
    const startIndex = this.pageIndex * PAGE_SIZE
    const endIndex =
      startIndex + PAGE_SIZE > songsIds.length ? songsIds.length : startIndex + PAGE_SIZE
    const playlist = await songDetail({
      ids: songsIds.slice(startIndex, endIndex)
    })
    match(playlist)
      .with({ ok: true }, ({ val }) => {
        if (!this.playlistsSongs) {
          this.playlistsSongs = new Map()
        }
        this.playlistsSongs.set(this.pageIndex, val.songs)
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(
          new Error(val),
          `[Playlist Page] Failed To Fetch User Playlist Song: Page index: ${this.pageIndex}`
        )
      })
      .exhaustive()
  }
}
