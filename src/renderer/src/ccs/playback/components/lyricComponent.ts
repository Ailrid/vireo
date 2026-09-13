import { Component } from '@virid/core'
import { Responsive } from '@virid/vue'
import { type LyricDetail } from '@/utils/server'

@Component()
export class LyricComponent {
  @Responsive()
  public lyric: LyricDetail | null = null
  @Responsive()
  public currentIndex: number = 0
  public destLyric: boolean = false
}
