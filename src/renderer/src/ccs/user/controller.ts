import { Controller } from '@virid/core'
import { UserComponent } from './component'
import { Project, Responsive, Watch } from '@virid/vue'
import { type UserProfile, type PlaylistInfo, type PlaylistDetail } from '@/utils/server'
import { getAccentRGB } from '@/utils'

@Controller()
export class UserController {
  //用户信息
  @Project(UserComponent, i => i.userProfile)
  userProfile: UserProfile | null = null
  // 用户歌单信息
  @Project(UserComponent, i => i.userPlaylists)
  userPlaylists: PlaylistInfo[] = []
  // 用户歌单详情(一开始为空，只有点开时缓存)
  @Project(UserComponent, i => i.userPlaylistsDetail)
  userPlaylistsDetail: Map<number, PlaylistDetail> = new Map()
  @Responsive()
  public songColor: string = ''

  @Watch(UserComponent, i => i.userProfile, { immediate: true })
  async getColor() {
    const { avgColor } = await getAccentRGB(this.userProfile!.avatar)
    this.songColor = `rgb(${avgColor[0]},${avgColor[1]},${avgColor[2]})`
  }
}
