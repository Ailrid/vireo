<template>
  <Dialog>
    <template #trigger="{ open }">
      <div
        class="cursor-pointer transition-transform hover:scale-105 active:scale-95"
        @click="open"
      >
        <Img
          v-if="lct.userProfile"
          :cover="lct.userProfile.avatar"
          class="h-7! w-7! rounded-full border shadow-sm"
        />
        <Button v-else variant="none">
          <User :size="18"></User>
        </Button>
      </div>
    </template>
    <template #context="{ close }">
      <div class="relative flex flex-col border">
        <Button
          @click="close"
          variant="icon"
          class="hover:text-primary absolute top-2 right-2 z-10000 h-10 w-10 active:opacity-50"
          :size="18"
        >
          <X :size="18" :stroke-width="1.2" />
        </Button>

        <Transition name="fade-slide" mode="out-in">
          <!-- 登录成功显示信息 -->
          <div v-if="lct.userProfile" :key="'user'">
            <UserCard />
          </div>
          <div v-else :key="'auth'" class="flex flex-col">
            <!-- 未登陆要显示登录方式 -->
            <div class="px-8 pt-10 pb-4">
              <QrLogin v-if="lct.currentLoginMode === 'qr'" />
              <WindowLogin v-else />
            </div>
            <div class="flex justify-center py-4">
              <Button
                variant="none"
                @click="lct.currentLoginMode = lct.currentLoginMode === 'qr' ? 'window' : 'qr'"
                class="hover:text-primary text-xs font-medium transition-colors"
              >
                {{ lct.switchText }}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from '../ui/dialog/Dialog.vue'
import Button from '@/components/ui/Button.vue'
import { useController } from '@virid/vue'
import { LoginDialogController } from './controllers'
import QrLogin from './QrLogin.vue'
import UserCard from './UserCard.vue'
import WindowLogin from './WindowLogin.vue'
import Img from '../public/Img.vue'
import { X, User } from 'lucide-vue-next'
const lct = useController(LoginDialogController)
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
