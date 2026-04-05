import { PlaySongMessage, SetPlaylistMessage } from '@/ccs/playback'
import {
  type AlbumInfo,
  type ArtistInfo,
  type SongDetail,
  artistAlbum,
  artistDetail,
  artistSong
} from '@/utils'
import { Controller, MessageWriter, SingleMessage } from '@virid/core'
import { Responsive, OnHook, Use, Project, Listener } from '@virid/vue'
import { match } from 'ts-pattern'
import { useRoute } from 'vue-router'
let _isSidebarOpen = true
const PAGE_SIZE = 200
let _songs: Map<number, SongDetail[]> = new Map()
let _artist: ArtistInfo | null = null
let _albums: Map<number, AlbumInfo[]> = new Map()

export class ArtistPageChangeMessage extends SingleMessage {
  constructor(public pageIndex: number) {
    super()
  }
}

@Controller()
export class ArtistPageController {
  // 注入路由
  @Use(() => useRoute())
  public route!: ReturnType<typeof useRoute>
  //当前的歌单id
  @Project()
  get artistId(): number | null {
    const id = this.route.params.id
    return id ? Number(id) : null
  }

  @Responsive()
  public isSidebarOpen: boolean = _isSidebarOpen

  @Responsive()
  public isAlbum: boolean = false
  public toggleSidebar() {
    _isSidebarOpen = !_isSidebarOpen
    this.isSidebarOpen = _isSidebarOpen
  }

  @Responsive()
  public pageIndex: number = 0

  @Responsive()
  public songs: Map<number, SongDetail[]> = _songs

  @Responsive()
  public artist: ArtistInfo | null = _artist

  @Responsive()
  public albums: Map<number, AlbumInfo[]> = _albums
  /**
   * * 最大页数
   */
  @Project()
  get maxPageLength() {
    let total = this.artist?.songSize || 0
    if (this.isAlbum) {
      total = this.artist?.albumSize || 0
    }
    return Math.ceil(total / 200) || 1
  }
  /**
   * * 当前页数据
   */
  @Project()
  get currentPageSong(): SongDetail[] | null {
    if (!this.songs?.has(this.pageIndex)) return null
    return this.songs.get(this.pageIndex)!
  }
  @Project()
  get currentPageAlbum(): AlbumInfo[] | null {
    if (!this.albums?.has(this.pageIndex)) return null
    return this.albums.get(this.pageIndex)!
  }
  @Project()
  get firstIndex(): number {
    return this.pageIndex * PAGE_SIZE
  }
  @Project()
  get lastIndex(): number {
    if (!this.artist) return 0
    let total = this.artist.songSize
    if (this.isAlbum) total = this.artist.albumSize
    if ((this.pageIndex + 1) * PAGE_SIZE > total) return total - 1
    else return this.pageIndex * PAGE_SIZE + PAGE_SIZE - 1
  }

  @OnHook('onSetup')
  async initArtist() {
    if (!this.artistId) return
    // 有缓存直接切换
    if (this.artistId == this.artist?.id && this.songs.has(0) && this.albums.has(0)) return
    // 清空缓存
    this.clearCache()

    const detail = await artistDetail({
      id: this.artistId
    })

    match(detail)
      .with({ ok: true }, ({ val }) => {
        this.artist = val.artist
        _artist = val.artist
        this.getNewPageSongs()
        this.getNewPageAlbums()
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.write(new Error(val), '[ArtistPageController] Failed to fetch artist detail')
      })
  }
  /**
   * * 播放当前页面歌曲
   */
  setPlaylist(song: SongDetail | undefined | null) {
    if (!song || !this.songs.get(this.pageIndex) || !this.artist) return
    const pageData = this.songs.get(this.pageIndex)!
    SetPlaylistMessage.send(pageData, {
      id: -1,
      name: 'artist',
      cover: pageData[0].album.cover,
      creator: {
        name: '',
        id: -1,
        avatar: ''
      },
      description: this.artist.description ?? '',
      songCount: pageData.length,
      playCount: -1,
      createTime: -1,
      songsIds: pageData.map(song => song.id),
      firstSongCover: pageData[0].album.cover
    })
    PlaySongMessage.send(song)
  }

  /**
   * * 改变页面的时候获取新的数据
   */
  @Listener({
    messageClass: ArtistPageChangeMessage
  })
  public onPageChange(message: ArtistPageChangeMessage) {
    this.pageIndex = message.pageIndex
    if (!this.isAlbum) this.getNewPageSongs()
    else this.getNewPageAlbums()
  }

  public async getNewPageSongs() {
    if (!this.artistId || this.songs.has(this.pageIndex)) return
    const songs = await artistSong({
      id: this.artistId,
      limit: 200,
      offset: this.pageIndex * 200
    })

    match(songs)
      .with({ ok: true }, ({ val }) => {
        this.songs.set(this.pageIndex, val.songs)
        _songs.set(this.pageIndex, val.songs)
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.write(new Error(val), '[ArtistPageController] Failed to fetch artist songs')
      })
  }
  public async getNewPageAlbums() {
    if (!this.artistId || this.albums.has(this.pageIndex)) return
    const albums = await artistAlbum({
      id: this.artistId,
      limit: 200,
      offset: this.pageIndex * 200
    })

    match(albums)
      .with({ ok: true }, ({ val }) => {
        this.albums.set(this.pageIndex, val.hotAlbums)
        _albums.set(this.pageIndex, val.hotAlbums)
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.write(new Error(val), '[ArtistPageController] Failed to fetch artist albums')
      })
  }

  toggleAlbum(isAlbum: boolean) {
    this.isAlbum = isAlbum
    ArtistPageChangeMessage.send(0)
  }

  clearCache() {
    _songs = new Map()
    _albums = new Map()
    _artist = null
    this.songs = _songs
    this.albums = _albums
    this.artist = _artist
  }
}
