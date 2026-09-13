import { Controller } from '@virid/core'
import { useRouter } from 'vue-router'
import { Project, Use } from '@virid/vue'
import { PlaylistComponent } from '@/ccs/playback'
import { UserComponent } from '@/ccs/user'

import { type SongDetail } from '@/utils'
import { CreateLyricWindowMessage } from '@/ccs/electron'
@Controller()
export class MenuAreaController {
  @Use(() => useRouter())
  public router!: ReturnType<typeof useRouter>

  @Project(PlaylistComponent, i => i.currentSong)
  public currentSong!: SongDetail | null

  @Project(UserComponent, i => i.userProfile?.userId)
  public uid!: number | null

  goHome() {
    this.router.push({ name: 'home' })
  }

  goPlayer() {
    if (!this.currentSong) return
    this.router.push({ name: 'player' })
  }

  goAccount() {
    if (!this.uid) return
    this.router.push({ name: 'account', params: { id: this.uid } })
  }
  goDownload() {
    // TODO
  }
  goDeskLyric() {
    CreateLyricWindowMessage.send()
  }
}
