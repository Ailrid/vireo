import { Watch, Responsive, Use, Project } from '@/ccs/decorators/vue'
import { Controller } from '@/ccs/decorators/ccs'
import { useRouter, type Router } from 'vue-router'
import { PlayerPlayOrPauseMessage } from '../systems/testSystem'
import { PlaylistComponent, Song } from '../components/testComponent'
@Controller()
export class HomePageConrtoller {
  //拿到路由器
  @Use(() => useRouter())
  public router!: Router

  @Responsive()
  public isPlaying: boolean = false
  //用于控制播放与暂停
  changePlayingState() {
    this.isPlaying = !this.isPlaying
    PlayerPlayOrPauseMessage.send(this.isPlaying)
  }
  //用于跳转路由
  goToPage(to: { name: string; params?: object }) {
    //可以做一些别的操作
    this.router.push(to as any)
  }
  //创建一个投影，从component中映射数据
  @Project(PlaylistComponent, (i) => i.currentSong)
  public currentSong!: Song
  //创建一个投影，从component中映射数据
  @Project(PlaylistComponent, (i) => i.playlist)
  public playlist!: Song[]
  //观测当前歌曲，如果变了就触发某些操作
  @Watch(PlaylistComponent, (i) => i.currentSong, {})
  watchCurrentSong() {
    console.log('监听到当前歌曲改变PlaylistComponent：', this.currentSong)
  }
  @Watch<HomePageConrtoller>((i) => i.currentSong, {})
  watchSelfSong() {
    console.log('监听到当前歌曲改变HomePageConrtoller：', this.currentSong)
  }
}
