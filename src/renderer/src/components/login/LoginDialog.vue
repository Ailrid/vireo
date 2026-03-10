<template>
  <Dialog>
    <DialogTrigger as-child>
      <div class="cursor-pointer transition-transform hover:scale-105 active:scale-95">
        <template v-if="lct.userProfile">
          <img
            :src="lct.userProfile.avatar"
            class="h-9 w-9 rounded-full border border-slate-200/50 shadow-sm"
          />
        </template>
        <Button v-else variant="outline">登录</Button>
      </div>
    </DialogTrigger>
    <DialogContent class="overflow-hidden p-0 sm:max-w-96">
      <div class="flex flex-col" :style="sct.rootStyle">
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
            <div class="flex justify-center border-t border-slate-50 bg-slate-50/30 py-4">
              <button
                @click="lct.currentLoginMode = lct.currentLoginMode === 'qr' ? 'window' : 'qr'"
                class="text-xs font-medium text-slate-400 transition-colors hover:text-slate-900"
              >
                {{ lct.switchText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useController } from '@virid/vue'
import { LoginDialogController } from './controllers'
import { SettingController } from '@/ccs/settings'
import QrLogin from './QrLogin.vue'
import UserCard from './UserCard.vue'
import WindowLogin from './WindowLogin.vue'
const lct = useController(LoginDialogController)
const sct = useController(SettingController)
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
