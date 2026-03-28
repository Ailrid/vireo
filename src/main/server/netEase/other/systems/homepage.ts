import { createRequest, CryptoMode, getSongDetail } from '../../utils'
import { Body, Cookies, Headers, HttpSystem, InternalServerError, Ok } from '@virid/express'
import { HomepageRequestMessage } from '../message'
import { type HomepageRequest, type HomepagePlaylist, HomepageResponse } from '../types'

export class HomepageSystem {
  @HttpSystem({
    messageClass: HomepageRequestMessage
  })
  public static async getRecommendPlaylists(
    @Cookies() cookies: Record<string, string>,
    @Headers() headers: Record<string, string>,
    @Body() body: HomepageRequest
  ) {
    const answer = await createRequest(CryptoMode.eapi, {
      url: '/homepage/block/page',
      data: {
        refresh: body.refresh || false
      },
      cookies,
      headers
    })
    const res = answer.data as RawHomepageResponse

    if (!res.data?.blocks) return InternalServerError('Failed to fetch homepage data')

    const playlist = res.data.blocks.find(
      (block: HomepageResource) => block.blockCode === 'HOMEPAGE_BLOCK_PLAYLIST_RCMD'
    )!
    const songs = res.data.blocks.find(
      (block: HomepageResource) => block.blockCode === 'HOMEPAGE_BLOCK_STYLE_RCMD'
    )!
    const radar = res.data.blocks.find(
      (block: HomepageResource) => block.blockCode === 'HOMEPAGE_BLOCK_MGC_PLAYLIST'
    )!

    const playlistData = convertToHomepagePlaylist(playlist)
    const radarData = convertToHomepagePlaylist(radar)
    const songsIds = songs.resourceIdList.map(id => Number(id))
    const formattedSongs = await getSongDetail(songsIds, cookies, headers)
    const songData = songs.creatives.map((info, index) => {
      return {
        title: info.resources[0].uiElement.mainTitle.title,
        subTitle: info.resources[0].uiElement.subTitle?.title || '',
        detail: formattedSongs[index]
      }
    })

    return Ok({
      code: 200,
      data: {
        playlist: playlistData,
        songs: songData,
        radar: radarData
      }
    } as HomepageResponse)
  }
}

interface RawHomepageResponse {
  code: number
  data: {
    blocks: HomepageResource[]
    [key: string]: any
  }
}

type HomepageResource = PlaylistResource | SongResource | RadarResource

interface PlaylistResource {
  blockCode: 'HOMEPAGE_BLOCK_PLAYLIST_RCMD'
  uiElement: {
    subTitle: {
      title: string
    }
  }
  creatives: {
    creativeType: 'list'
    resources: {
      uiElement: {
        mainTitle: {
          title: string
        }
        subTitle: {
          title: string
        }
        image: {
          imageUrl: string
        }
        labelTexts: string[]
      }
      resourceType: 'list'
      resourceId: string
    }[]
  }[]
}

interface SongResource {
  blockCode: 'HOMEPAGE_BLOCK_STYLE_RCMD'
  uiElement: {
    subTitle: {
      title: string
    }
  }
  creatives: {
    creativeType: 'SONG_LIST_HOMEPAGE'
    resources: {
      uiElement: {
        mainTitle: {
          title: string
        }
        subTitle: {
          title: string
        }
        image: {
          imageUrl: string
        }
      }
      resourceType: 'song'
      resourceId: string
    }[]
  }[]
  resourceIdList: string[]
}

interface RadarResource {
  blockCode: 'HOMEPAGE_BLOCK_MGC_PLAYLIST'
  uiElement: {
    subTitle: {
      title: string
    }
  }
  creatives: {
    creativeType: 'list'
    resources: {
      uiElement: {
        mainTitle: {
          title: string
        }
        image: {
          imageUrl: string
        }
        labelTexts: string[]
      }
      resourceType: 'list'
      resourceId: string
    }[]
  }[]
}

function convertToHomepagePlaylist(resource: PlaylistResource | RadarResource): HomepagePlaylist {
  return {
    title: resource.uiElement.subTitle.title,
    playlist: resource.creatives.flatMap(creative =>
      creative.resources.map(res => {
        const ui = res.uiElement
        return {
          id: Number(res.resourceId),
          title: ui.mainTitle.title,
          subTitle: ui.subTitle?.title || '',
          cover: ui.image.imageUrl,
          labels: ui.labelTexts || []
        }
      })
    )
  }
}
