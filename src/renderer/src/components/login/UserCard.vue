<template>
  <div
    class="animation flex w-96 flex-col shadow-2xl"
    :style="{
      backgroundColor: uct.songColor
    }"
  >
    <!-- 背景图片 -->
    <div class="relative h-36 w-full overflow-hidden">
      <Img
        v-if="uct.userProfile?.avatar"
        :cover="uct.userProfile.avatar"
        class="object-cover object-top opacity-60 transition-transform duration-1000 group-hover:scale-105"
      />
      <div class="absolute inset-0"></div>
      <div class="absolute inset-0 bg-linear-to-t via-transparent to-transparent"></div>
    </div>
    <!-- 用户信息 -->
    <div class="relative w-full px-8 pb-8">
      <div class="absolute -top-10 left-8">
        <div class="bg-card rounded-full border-4 shadow-xl">
          <Img
            v-if="uct.userProfile?.avatar"
            :cover="uct.userProfile?.avatar"
            class="h-20! w-20! rounded-full object-cover transition-transform hover:rotate-6"
          />
        </div>
      </div>
      <div class="pt-14">
        <div class="flex items-center gap-3">
          <h3 class="text-2xl font-bold tracking-tight brightness-50 contrast-150">
            {{ uct.userProfile?.nickname }}
          </h3>
          <span
            class="bg-primary rounded-md border px-2 py-0.5 text-xs font-black italic brightness-50 contrast-150"
          >
            Lv.{{ uct.userProfile?.level }}
          </span>
        </div>
        <p
          class="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed brightness-50 contrast-150"
        >
          {{ uct.userProfile?.signature || '音乐是灵魂的避风港...' }}
        </p>
      </div>
      <!-- 用户数据 -->
      <div class="mt-8 flex items-center justify-around rounded-2xl py-4">
        <div class="animation flex items-center">
          <p class="card-info-text-number">{{ uct.userProfile?.follows || 0 }}</p>
          <p class="card-info-text-meaning">关注</p>
        </div>
        <div class="h-6 w-px"></div>
        <div class="animation flex items-center">
          <p class="card-info-text-number">{{ uct.userProfile?.followeds || 0 }}</p>
          <p class="card-info-text-meaning">粉丝</p>
        </div>
        <div class="h-6 w-px"></div>
        <div class="animation flex items-center">
          <p class="card-info-text-number">{{ uct.userProfile?.listenSongs || 0 }}</p>
          <p class="card-info-text-meaning">听歌</p>
        </div>
      </div>
    </div>
    <!-- 退出登录 -->
    <div class="flex w-full items-center justify-between px-8 py-5">
      <div class="card-info-text-meaning flex items-center gap-2">
        <div class="bg-primary h-2 w-2 rounded-full brightness-50 contrast-150"></div>
        已加入网易云 {{ uct.userProfile?.createDays || 0 }} 天
      </div>
      <Button
        variant="outline"
        @click="
          async () => {
            await logout()
            CloseWindowMessage.send()
          }
        "
      >
        <i class="ri-logout-box-r-line mr-1 text-base brightness-50 contrast-150"> 退出登录</i>
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useController } from '@virid/vue'
import { UserController } from '@/ccs/user'
import Button from '../ui/Button.vue'
import Img from '../public/Img.vue'
import { CloseWindowMessage } from '@/ccs'
import { logout } from '@/utils'
const uct = useController(UserController)
</script>

<style scoped>
@reference '@/assets/main.css';
.animation {
  animation: slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.card-info-text-number {
  @apply text-lg font-bold brightness-50 contrast-150;
}
.card-info-text-meaning {
  @apply text-sm font-medium brightness-50 contrast-150;
}
</style>
