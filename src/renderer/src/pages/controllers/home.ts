import { Controller, MessageWriter } from '@virid/core'
import {
  homepage,
  recommendSong,
  playlistDetail,
  getAccentRGB,
  type HomepagePlaylist,
  type HomepageSong,
  type SongDetail,
  type PlaylistDetail
} from '@/utils'
import { OnHook, Project, Responsive, Watch, Use } from '@virid/vue'
import { match } from 'ts-pattern'
import {
  LoadFMPlaylistMessage,
  LoadIntelligencePlaylistMessage,
  PlaylistComponent,
  SetPlayModeMessage
} from '@/ccs/playback'
import { UserComponent } from '@/ccs/user'
import { useRouter } from 'vue-router'

let _pageSong: HomepageSong[] = []
let _pagePlaylist: HomepagePlaylist | null = null
let _pageRadar: HomepagePlaylist | null = null
let _recommendSongs: SongDetail[] = []
let _personalRadar: PlaylistDetail | null = null

@Controller()
export class HomePageController {
  @Responsive()
  public pageSong: HomepageSong[] = _pageSong
  @Responsive()
  public pagePlaylist: HomepagePlaylist | null = _pagePlaylist
  @Responsive()
  public pageRadar: HomepagePlaylist | null = _pageRadar
  @Responsive()
  public recommendSongs: SongDetail[] = _recommendSongs
  @Responsive()
  public personalRadar: PlaylistDetail | null = _personalRadar

  @Responsive()
  public covers: Map<string, string> = new Map()

  @Responsive()
  public colors: Map<string, string> = new Map()

  //投影心动模式和fm的第一首歌用来展示
  @Project(PlaylistComponent, i => i.intelligenceList.at(0))
  public intelligenceSong: SongDetail | null = null

  @Project(PlaylistComponent, i => i.fmList.at(0))
  public fmSong: SongDetail | null = null

  @Use(() => useRouter())
  public router!: ReturnType<typeof useRouter>

  /**
   * * 加载时获取主页数据
   */
  @OnHook('onSetup')
  async getPageData(force: boolean = false) {
    if (!force && _pageSong.length && _pagePlaylist && _pageRadar) return
    const res = await homepage({ refresh: true })
    match(res)
      .with({ ok: true }, ({ val }) => {
        this.pageSong = val.data.songs
        this.pagePlaylist = val.data.playlist
        this.pageRadar = val.data.radar
        _pageSong = val.data.songs
        _pagePlaylist = val.data.playlist
        _pageRadar = val.data.radar
      })
      .with({ ok: false }, ({ val }) => {
        MessageWriter.error(new Error(val), '[HomePageController] Failed to fetch homepage data')
      })
      .exhaustive()
  }
  /**
   * * 加载时获取主页数据
   */
  @OnHook('onSetup')
  async getRecommendationSongs() {
    if (!_recommendSongs.length && _personalRadar) return
    const recommend = recommendSong()
    const personalRadar = playlistDetail({ id: 3136952023 })
    const [recommendRes, radarRes] = await Promise.all([recommend, personalRadar])
    match(recommendRes)
      .with({ ok: true }, ({ val }) => {
        this.recommendSongs = val.data
        _recommendSongs = val.data
      })
      .with({ ok: false }, ({ val: err }) => {
        MessageWriter.error(
          new Error(err),
          '[HomePageController] Failed to fetch recommendation songs'
        )
      })
    match(radarRes)
      .with({ ok: true }, ({ val }) => {
        this.personalRadar = val.playlist
        _personalRadar = val.playlist
      })
      .with({ ok: false }, ({ val: err }) => {
        MessageWriter.error(new Error(err), '[HomePageController] Failed to fetch personal radar')
      })
  }

  /**
   * * 账号信息初始化完成后，立刻加载一次FM和心动模式模式数据但是不播放
   */
  @Watch(UserComponent, i => i.initialize, { immediate: true })
  getIntelligenceAndFmData(newValue: boolean) {
    if (!newValue) return
    LoadFMPlaylistMessage.send()
    LoadIntelligencePlaylistMessage.send()
  }

  @Project()
  get discoverData() {
    // 拿到封面链接
    if (this.recommendSongs.at(0)?.album.cover)
      this.covers.set('recommend', this.recommendSongs.at(0)!.album.cover)
    if (this.personalRadar?.firstSongCover)
      this.covers.set('radar', this.personalRadar.firstSongCover)
    if (this.intelligenceSong?.album.cover)
      this.covers.set('intelligence', this.intelligenceSong.album.cover)
    if (this.fmSong?.album.cover) this.covers.set('fm', this.fmSong.album.cover)

    return {
      recommend: {
        cover: this.covers.get('recommend') || '',
        title: '01 每日推荐',
        subTitle: '探寻今日的宝物',
        click: () => {
          this.router.push({ name: 'recommend' })
        }
      },
      radar: {
        cover: this.covers.get('radar') || '',
        title: '02 私人雷达',
        subTitle: '反复聆听你喜欢的歌',
        click: () => {
          this.router.push({ name: 'playlist', params: { id: this.personalRadar?.id || 0 } })
        }
      },
      intelligence: {
        cover: this.covers.get('intelligence') || '',
        title: '03 心动模式',
        subTitle: '随心跳起伏',
        click: () => {
          SetPlayModeMessage.send('intelligence')
        }
      },
      fm: {
        cover: this.covers.get('fm') || '',
        title: '04 FM漫游',
        subTitle: '在音乐的世界里漫游',
        click: () => {
          SetPlayModeMessage.send('fm')
        }
      }
    }
  }

  /**
   * * 获取封面的accentRGB
   */
  @Watch<HomePageController>(i => i.covers, {
    deep: true
  })
  async getColors() {
    const c: ReturnType<typeof getAccentRGB>[] = []
    const indexes: string[] = []
    for (let cover of this.covers.entries()) {
      //每日推荐和私人雷达的封面不变就不重复获取颜色了
      if ((cover[0] == 'recommend' || cover[0] == 'radar') && this.colors.has(cover[0])) continue
      indexes.push(cover[0])
      c.push(getAccentRGB(cover[1]))
    }
    const res = await Promise.all(c)
    res.forEach((item, i) => {
      this.colors.set(
        indexes[i],
        `rgb(${item.avgColor[0]},${item.avgColor[1]},${item.avgColor[2]})`
      )
    })
  }

  /***
   * * 刷新主页数据，强制重新获取数据并更新FM和心动模式的歌单数据
   */
  refresh() {
    this.getPageData(true)
    this.getRecommendationSongs()
    LoadFMPlaylistMessage.send(false, true)
    LoadIntelligencePlaylistMessage.send(false, true)
  }
}
