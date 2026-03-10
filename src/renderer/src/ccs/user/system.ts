import { System, MessageWriter } from '@virid/core'
import { UserComponent } from './component'
import { FetchUserAccountMessage, FetchUserPlaylistMessage, LogoutMessage } from './message'
import { match } from 'ts-pattern'
import { userAccount, userPlaylist, logout } from '@/utils/server'
export class UserSystem {
  /**
   * * 获取用户信息
   */
  @System({
    messageClass: FetchUserAccountMessage
  })
  static async fetchUserInfo(userComponent: UserComponent) {
    const profile = await userAccount()
    match(profile)
      .with({ ok: true }, ({ val }) => {
        if (val.profile) {
          userComponent.userProfile = val.profile
          //获取歌单
          FetchUserPlaylistMessage.send()
        } else {
          MessageWriter.error(
            new Error('[User System] Failed To Fetch User Information: Got empty profile')
          )
        }
      })
      .with({ ok: false }, ({ val }) => {
        ;(MessageWriter.error(new Error(val)), '[User System] Failed To Fetch User Information')
      })
      .exhaustive()
  }
  /**
   * * 获取用户歌单
   */
  @System({
    messageClass: FetchUserPlaylistMessage
  })
  static async fetchUserPlaylist(userComponent: UserComponent) {
    if (!userComponent.userProfile) {
      MessageWriter.warn('[User System] Fetch User Playlist: Not login in')
      return
    }
    const playlist = await userPlaylist({
      uid: userComponent.userProfile.userId,
      limit: 100,
      offset: 0
    })
    match(playlist)
      .with({ ok: true }, ({ val }) => {
        userComponent.userPlaylists = val.playlists
      })
      .with({ ok: false }, ({ val }) => {
        ;(MessageWriter.error(new Error(val)), '[User System] Failed To Fetch User Playlist')
      })
      .exhaustive()
  }
  /**
   * * 登出
   */
  @System({
    messageClass: LogoutMessage
  })
  static async logoutNetease(userComponent: UserComponent) {
    logout()
    userComponent.userPlaylists = []
    userComponent.userProfile = null
  }
}
