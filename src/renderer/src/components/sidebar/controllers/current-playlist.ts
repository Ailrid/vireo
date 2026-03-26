import { PlaylistComponent } from '@/ccs/playback'
import { SongDetail } from '@/utils/server'
import { Controller, SingleMessage } from '@virid/core'
import { Listener, Project, Use } from '@virid/vue'
import { useTemplateRef, type ShallowRef } from 'vue'

export class MoveToCurrentSongMessage extends SingleMessage {}

@Controller()
export class CurrentPlaylistController {
  @Project(PlaylistComponent, i => i.currentSong)
  public currentSong: SongDetail | null = null

  @Project(PlaylistComponent, i => i.currentList)
  public currentList: SongDetail[] = []
  @Use(() => useTemplateRef('current-playlist'))
  public currentPlaylistRef!: ShallowRef<any>
  @Listener({
    messageClass: MoveToCurrentSongMessage
  })
  scrollToCurrentSong() {
    if (this.currentSong && this.currentList && this.currentPlaylistRef.value) {
      const index = this.currentList.findIndex(item => item.id === this.currentSong!.id)
      if (index >= 0) {
        this.currentPlaylistRef.value.scrollTo(index)
      }
    }
  }
}
