import { UserComponent } from '@/ccs/user'
import { type PlaylistInfo } from '@/utils'
import { Controller } from '@virid/core'
import { Project, Responsive, Use, Watch } from '@virid/vue'
import { useRoute } from 'vue-router'
@Controller()
export class PlaylistManagerController {
  // 从 UserComponent 投影歌单列表
  @Project(UserComponent, i => i.userPlaylists)
  public playlists: PlaylistInfo[] = []

  // 注入路由钩子
  @Use(() => useRoute())
  public route!: ReturnType<typeof useRoute>
  @Responsive()
  public currentPlaylistId: number | null = null

  @Watch<PlaylistManagerController>(i => i.route.fullPath, { immediate: true })
  onRouteChange() {
    if (this.route.name !== 'playlist') this.currentPlaylistId = null
    const id = this.route.params.id
    this.currentPlaylistId = id ? Number(id) : null
  }
}
