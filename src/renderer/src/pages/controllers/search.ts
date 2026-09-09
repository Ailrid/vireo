import { Controller, MessageWriter } from '@virid/core'
import { Project, Responsive, Use, Watch } from '@virid/vue'
import { match } from 'ts-pattern'
import { useRoute } from 'vue-router'
import {
  search,
  SearchType,
  SearchResultMap,
} from '@/utils/server'

export const categoryMap = {
  song: '歌曲',
  album: '专辑',
  artist: '艺人',
  playlist: '歌单',
  user: '用户',
  mv: '视频',
  lyric: '歌词'
} as const

let _song: SearchResultMap[SearchType.Song] | null = null

let _artist: SearchResultMap[SearchType.Artist] | null = null

let _album: SearchResultMap[SearchType.Album] | null = null

let _playlist: SearchResultMap[SearchType.Playlist] | null = null

let _user: SearchResultMap[SearchType.User] | null = null
let _mv: SearchResultMap[SearchType.Mv] | null = null

let _lyric: SearchResultMap[SearchType.Lyric] | null = null

const keywordsHistory = {
  song: '',
  album: '',
  artist: '',
  playlist: '',
  user: '',
  mv: '',
  lyric: ''
}

const categoryList = ['song', 'album', 'artist', 'playlist', 'user', 'mv', 'lyric']
export type CategoryKey = keyof typeof categoryMap
export type CategoryValue = (typeof categoryMap)[CategoryKey]

@Controller()
export class SearchController {
  @Use(() => useRoute())
  public route!: ReturnType<typeof useRoute>

  @Project()
  get keywords(): string {
    return this.route.params.keywords as string
  }

  @Responsive()
  public isSidebarOpen: Boolean = true

  @Responsive()
  public song: SearchResultMap[SearchType.Song] | null = _song
  @Responsive()
  public artist: SearchResultMap[SearchType.Artist] | null = _artist
  @Responsive()
  public album: SearchResultMap[SearchType.Album] | null = _album
  @Responsive()
  public playlist: SearchResultMap[SearchType.Playlist] | null = _playlist
  @Responsive()
  public user: SearchResultMap[SearchType.User] | null = _user
  @Responsive()
  public mv: SearchResultMap[SearchType.Mv] | null = _mv
  @Responsive()
  public lyric: SearchResultMap[SearchType.Lyric] | null = _lyric

  @Responsive()
  public currentView: CategoryKey = 'song'
  @Project()
  public get categoryName() {
    return categoryMap[this.currentView]
  }

  @Watch<SearchController>(i => i.currentView, { immediate: true })
  _getSearchResult() {
    if (keywordsHistory[this.currentView] === this.keywords) {
      return
    }
    match(this.currentView)
      .with('song', () => {
        this.searchGeneral(this.keywords, SearchType.Song, val => {
          this.song = val
          _song = val
        })
      })
      .with('album', () => {
        this.searchGeneral(this.keywords, SearchType.Album, val => {
          this.album = val
          _album = val
        })
      })
      .with('artist', () => {
        this.searchGeneral(this.keywords, SearchType.Artist, val => {
          this.artist = val
          _artist = val
        })
      })
      .with('playlist', () => {
        this.searchGeneral(this.keywords, SearchType.Playlist, val => {
          this.playlist = val
          _playlist = val
        })
      })
      .with('user', () => {
        this.searchGeneral(this.keywords, SearchType.User, val => {
          this.user = val
          _user = val
        })
      })
      .with('mv', () => {
        this.searchGeneral(this.keywords, SearchType.Mv, val => {
          this.mv = val
          _mv = val
        })
      })
      .with('lyric', () => {
        this.searchGeneral(this.keywords, SearchType.Lyric, val => {
          this.lyric = val
          _lyric = val
        })
      })
      .exhaustive()
    keywordsHistory[this.currentView] = this.keywords
  }

  async searchGeneral<T extends SearchType>(
    keywords: string,
    type: T,

    callback: (val: SearchResultMap[T]) => void
  ) {
    const searchSong = await search({
      keywords,
      type
    })
    match(searchSong)
      .with({ ok: true }, ({ val }) => {
        callback(val)
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val))
      })
      .exhaustive()
  }

  public onWheel(event: WheelEvent) {
    const { deltaY } = event
    let newName = ''
    if (deltaY > 0) {
      newName = categoryList[(categoryList.indexOf(this.currentView) + 1) % categoryList.length]
    } else {
      newName =
        categoryList[
          (categoryList.indexOf(this.currentView) - 1 + categoryList.length) % categoryList.length
        ]
    }
    this.currentView = newName as CategoryKey
  }
}
