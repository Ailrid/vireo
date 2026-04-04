<template>
  <div class="flex flex-col items-center justify-center space-y-6 py-4">
    <div class="group relative">
      <div
        class="qr-container h-52 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-500"
        :class="{
          'scale-95 opacity-20 blur-md grayscale': qct.currentStatus === '请在手机上确认登陆'
        }"
        v-html="qct.qrSvg"
      ></div>

      <Transition name="scale-fade">
        <div
          v-if="qct.currentStatus === '请在手机上确认登陆'"
          class="absolute inset-0 flex flex-col items-center justify-center text-green-600"
        >
          <div class="rounded-full bg-green-50 p-4 shadow-sm">
            <i class="ri-checkbox-circle-fill text-4xl"></i>
          </div>
        </div>
      </Transition>

      <div
        v-if="!qct.qrSvg"
        class="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-50"
      >
        <i class="ri-loader-5-line animate-spin text-3xl text-slate-300"></i>
      </div>
    </div>

    <div class="flex flex-col items-center space-y-1">
      <div class="flex items-center gap-2">
        <span
          v-if="qct.currentStatus === '请在手机上确认登陆'"
          class="flex h-2 w-2 animate-pulse rounded-full bg-green-500"
        ></span>
        <p class="text-sm font-semibold tracking-tight">
          {{ qct.currentStatus || '初始化安全连接...' }}
        </p>
      </div>
      <p class="text-sm">请打开网易云音乐 APP 扫码</p>
    </div>

    <Button
      variant="none"
      @click="qct.getQrSvg()"
      class="hover:text-primary cursor-pointer text-sm  underline underline-offset-4 transition-colors"
    >
      刷新二维码
    </Button>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { QrLoginController } from './controllers'
import Button from '../ui/Button.vue'
const qct = useController(QrLoginController)
</script>

<style scoped>
:deep(svg) {
  width: 100%;
  height: 100%;
  shape-rendering: crispedges;
}

/* 状态切换动画 */
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.scale-fade-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

.qr-container {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}
</style>
