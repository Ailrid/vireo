import { Controller, MessageWriter } from '@virid/core'
import { OnHook, Project, Responsive, Use } from '@virid/vue'
import { match } from 'ts-pattern'
import { useRoute } from 'vue-router'
import {
  userPlaylist,
  userDetail,
  userRecord,
  UserProfile,
  PlaylistInfo,
  PlayRecord
} from '@/utils/server'
let _isSidebarOpen = true
let _profile: UserProfile | null = null
let _playlist: PlaylistInfo[] = []
let _recordWeek: PlayRecord[] = []
let _recordAll: PlayRecord[] = []
let _uid: number | null = null

@Controller()
export class AccountController {
  // 注入路由
  @Use(() => useRoute())
  public route!: ReturnType<typeof useRoute>
  @Responsive()
  public isSidebarOpen: boolean = _isSidebarOpen
  @Responsive()
  public isPlaylist: boolean = true
  @Responsive()
  public isWeek: boolean = true
  public toggleSidebar() {
    _isSidebarOpen = !_isSidebarOpen
    this.isSidebarOpen = _isSidebarOpen
  }
  @Responsive()
  public profile: UserProfile | null = _profile
  @Responsive()
  public playlist: PlaylistInfo[] = _playlist
  @Responsive()
  public recordWeek: PlayRecord[] = _recordWeek
  @Responsive()
  public recordAll: PlayRecord[] = _recordAll

  @Project()
  get uid(): number | null {
    const id = this.route.params.id
    return id ? Number(id) : null
  }

  @OnHook('onSetup')
  async setup() {
    if (!this.uid || this.uid == _uid) return

    const [profile, playlist, recordWeek, recordAll] = await Promise.all([
      userDetail({ uid: this.uid }),
      userPlaylist({ uid: this.uid, limit: 1000, offset: 0 }),
      userRecord({ uid: this.uid, type: 1 }),
      userRecord({ uid: this.uid, type: 0 })
    ])

    match([profile, playlist, recordWeek, recordAll])
      .with(
        [{ ok: true }, { ok: true }, { ok: true }, { ok: true }],
        ([profile, playlist, recordWeek, recordAll]) => {
          this.profile = profile.val.profile
          _profile = profile.val.profile
          this.playlist = playlist.val.playlists
          _playlist = playlist.val.playlists
          this.recordWeek = recordWeek.val.weekData
          _recordWeek = recordWeek.val.weekData
          this.recordAll = recordAll.val.allData
          _recordAll = recordAll.val.allData

          _uid = this.uid
        }
      )
      .otherwise(() => {
        MessageWriter.error(new Error('[AccountController] Failed To Fetch User Detail'))
      })
  }
  @Project()
  get record() {
    return this.isWeek ? this.recordWeek : this.recordAll
  }
}
