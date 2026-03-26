import { Component } from '@virid/core'
import { Responsive } from '@virid/vue'
import { type PlaylistDetail, type SongDetail } from '@/utils/server'
@Component()
export class PlaylistComponent {
  // 当前播放列表的信息
  @Responsive()
  public playlistDetail: PlaylistDetail | null = null
  // 当前播放列表的歌曲
  @Responsive()
  public currentList: SongDetail[] = []
  // 当前播放的歌曲的索引
  @Responsive()
  public currentIndex: number = 0
  // 当前播放的歌曲详情
  @Responsive()
  public currentSong: SongDetail | null = null

  // 暂存列表
  public stagingList: SongDetail[] = []
  // fm和心动模式的缓冲列表
  public fmList: SongDetail[] = []
  public intelligenceList: SongDetail[] = []
}
