import { PlaySongMessage, SetPlaylistMessage } from '@/ccs/playback'
import { FetchUserPlaylistSongMessage, UserComponent } from '@/ccs/user'
import { SongDetail, type PlaylistDetail } from '@/utils'
import { Controller, SingleMessage } from '@virid/core'
import { Project, Responsive, Use, Listener, OnHook } from '@virid/vue'
import { useRoute } from 'vue-router'
const PAGE_SIZE = 200
let _isSidebarOpen = true

export class UserPlaylistPageChangeMessage extends SingleMessage {
  constructor(public pageIndex: number) {
    super()
  }
}

@Controller()
export class UserPlaylistPageController {
  @Responsive()
  public isSidebarOpen: boolean = _isSidebarOpen

  public toggleSidebar() {
    _isSidebarOpen = !_isSidebarOpen
    this.isSidebarOpen = _isSidebarOpen
  }
  // 注入路由
  @Use(() => useRoute())
  public route!: ReturnType<typeof useRoute>
  // 用户全部的歌单信息
  @Project(UserComponent, i => i.userPlaylistsDetail)
  public userPlaylistsDetail!: Map<number, PlaylistDetail>
  // 用户全部的歌单歌曲
  @Project(UserComponent, i => i.userPlaylistsSongs)
  public userPlaylistsSongs!: Map<number, Map<number, SongDetail[]>>
  // 当前的页面
  @Responsive()
  public pageIndex: number = 0

  //当前的歌单id
  @Project()
  get currentPlaylistId(): number | null {
    const id = this.route.params.id
    return id ? Number(id) : null
  }
  //当前歌单信息从userPlaylistsDetail里投影
  @Project()
  get currentPlaylist(): PlaylistDetail | null {
    const id = this.currentPlaylistId
    if (!id) return null
    return this.userPlaylistsDetail.get(id) || null
  }
  //当前歌单里的歌曲从userPlaylistsSongs里投影
  @Project()
  get currentPageSong(): SongDetail[] | null {
    const playlistId = this.currentPlaylistId
    const pageIndex = this.pageIndex
    return playlistId && this.userPlaylistsSongs.get(playlistId)?.get(pageIndex)
      ? this.userPlaylistsSongs.get(playlistId)!.get(pageIndex)!
      : null
  }
  @Project()
  get maxPageLength() {
    const count = this.currentPlaylist?.songCount || 0
    return Math.ceil(count / 200) || 1
  }

  @Project()
  get firstIndex(): number {
    return this.pageIndex * PAGE_SIZE
  }
  @Project()
  get lastIndex(): number {
    if (!this.currentPageSong || !this.currentPlaylist) return 0
    if ((this.pageIndex + 1) * PAGE_SIZE > this.currentPlaylist.songCount)
      return this.currentPlaylist.songCount - 1
    else return this.pageIndex * PAGE_SIZE + PAGE_SIZE - 1
  }
  /**
   * * 设置播放列表为此页
   */
  setPlaylist(song: SongDetail | null) {
    if (!this.currentPageSong || !this.currentPlaylist || !song) return
    //替换歌单并播放第一首
    SetPlaylistMessage.send(this.currentPageSong, this.currentPlaylist)
    PlaySongMessage.send(song)
  }
  /**
   * * 改变页面的时候获取新的数据
   */
  @Listener({
    messageClass: UserPlaylistPageChangeMessage
  })
  public onPageChange(message: UserPlaylistPageChangeMessage) {
    this.pageIndex = message.pageIndex
    //顺便拉取一下新的页面数据
    this.initPageData()
  }
  /**
   * * 页面加载时获得第一首
   */
  @OnHook('onSetup')
  public initPageData() {
    if (!this.currentPlaylistId) return
    FetchUserPlaylistSongMessage.send(this.currentPlaylistId, this.pageIndex)
  }
}
