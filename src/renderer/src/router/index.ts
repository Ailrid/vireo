import { createRouter, createWebHashHistory } from 'vue-router'
const routes = [
  {
    path: '/',
    component: () => import('@/layouts/Layout.vue'),
    redirect: '/main',
    children: [
      {
        path: '/player-layout',
        name: 'player-layout',
        redirect: '/player',
        component: () => import('@/layouts/PlayerLayout.vue'),
        children: [
          {
            path: '/player',
            name: 'player',
            component: () => import('@/pages/Player.vue')
          }
        ]
      },
      {
        path: '/main',
        name: 'main',
        redirect: '/home',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
          {
            path: '/account/:id',
            name: 'account',
            component: () => import('@/pages/Account.vue')
          },
          {
            path: '/album/:id',
            name: 'album',
            component: () => import('@/pages/Album.vue')
          },
          {
            path: '/artist/:id',
            name: 'artist',
            component: () => import('@/pages/Artist.vue')
          },
          {
            path: '/home',
            name: 'home',
            component: () => import('@/pages/Home.vue')
          },
          {
            path: '/user-playlist/:id',
            name: 'user-playlist',
            component: () => import('@/pages/UserPlaylist.vue')
          },
          {
            path: '/playlist/:id',
            name: 'playlist',
            component: () => import('@/pages/Playlist.vue')
          },
          {
            path: '/search/:keywords',
            name: 'search',
            component: () => import('@/pages/Search.vue')
          },
          {
            path: '/setting',
            name: 'setting',
            component: () => import('@/pages/Setting.vue')
          },
          {
            path: '/recommend',
            name: 'recommend',
            component: () => import('@/pages/Recommended.vue')
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router
