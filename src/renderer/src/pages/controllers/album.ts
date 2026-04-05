import { PlaySongMessage, SetPlaylistMessage } from '@/ccs/playback'
import { SongDetail, albumDetail, type AlbumDetail } from '@/utils'
import { Controller, MessageWriter } from '@virid/core'
import { Responsive, OnHook, Use, Project } from '@virid/vue'
import { match } from 'ts-pattern'
import { useRoute } from 'vue-router'
let _isSidebarOpen = true
let songs: SongDetail[] | null = null
let album: AlbumDetail | null = null

@Controller()
export class AlbumPageController {
  // 注入路由
  @Use(() => useRoute())
  public route!: ReturnType<typeof useRoute>
  //当前的歌单id
  @Project()
  get albumId(): number | null {
    const id = this.route.params.id
    return id ? Number(id) : null
  }

  @Responsive()
  public isSidebarOpen: boolean = _isSidebarOpen
  public toggleSidebar() {
    _isSidebarOpen = !_isSidebarOpen
    this.isSidebarOpen = _isSidebarOpen
  }

  @Responsive()
  public songs: SongDetail[] | null = songs
  @Responsive()
  public album: AlbumDetail | null = album

  @OnHook('onSetup')
  async initAlbum() {
    if (!this.albumId) return
    // 只缓存上次的内容，如果缓存的id和当前id一致，则不重新请求
    if (this.albumId == this.album?.id && this.album) return
    this.clearCache()
    const res = await albumDetail({
      id: this.albumId
    })
    match(res)
      .with({ ok: true }, ({ val }) => {
        this.album = val.album
        this.songs = val.songs
        songs = val.songs
        album = val.album
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.write(new Error(val), '[AlbumPageController] Failed to fetch album detail')
      })
  }

  setPlaylist(song: SongDetail) {
    if (!this.songs || !this.album) return
    SetPlaylistMessage.send(this.songs, {
      id: -1,
      name: 'album',
      cover: this.songs[0].album.cover,
      creator: {
        name: '',
        id: -1,
        avatar: ''
      },
      description: this.album.description ?? '',
      songCount: this.songs.length,
      playCount: this.album.shareCount || -1,
      createTime: this.album.publishTime,
      songsIds: this.songs.map(song => song.id),
      firstSongCover: this.songs[0].album.cover
    })
    PlaySongMessage.send(song)
  }
  clearCache() {
    this.songs = null
    this.album = null
    songs = null
    album = null
  }
}
