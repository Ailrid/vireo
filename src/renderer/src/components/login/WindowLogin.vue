<template>
  <div class="flex flex-col items-center justify-center space-y-6 py-2">
    <!-- 开头装饰 -->
    <div class="flex flex-col items-center space-y-2 text-center">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-900 shadow-sm"
      >
        <i class="ri- window-line text-2xl"></i>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-slate-600"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold">网页安全登录</h3>
        <p class="text-sm">通过网易云官方窗口完成身份验证</p>
      </div>
    </div>
    <!-- 提示 -->
    <div class="w-full max-w-72 space-y-3">
      <div class="flex items-start gap-3">
        <span class="prompt-text">1</span>
        <p class="text-xs leading-5">点击“去登录”，在弹出的官方页面完成登录操作</p>
      </div>
      <div class="flex items-start gap-3">
        <span class="prompt-text">2</span>
        <p class="text-xs leading-5">完成后窗口将自动关闭，若未关闭可以点击按钮手动关闭</p>
      </div>
    </div>
    <!-- 登录状态 -->
    <div
      class="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 transition-all duration-300"
      :class="{
        'border-slate-100 bg-slate-50 text-slate-400': wct.loginStatus === 'idle',
        'animate-pulse border-blue-100 bg-blue-50/50 text-blue-600': wct.loginStatus === 'waiting',
        'border-green-100 bg-green-50/50 text-green-600': wct.loginStatus === 'success',
        'border-red-100 bg-red-50/50 text-red-600': wct.loginStatus === 'error'
      }"
    >
      <span
        v-if="wct.loginStatus === 'waiting'"
        class="h-1.5 w-1.5 animate-ping rounded-full bg-blue-500"
      ></span>
      <span class="text-sm font-semibold tracking-wide uppercase">{{
        wct.loginInfo || '准备就绪'
      }}</span>
    </div>
    <!-- 按钮 -->
    <div class="flex w-full justify-around">
      <Button variant="outline" @click="wct.openWindow()"> 打开窗口 </Button>
      <Button
        variant="outline"
        :disabled="wct.loginStatus !== 'waiting'"
        @click="wct.closeWindow()"
      >
        确认登录
      </Button>
    </div>

    <p class="text-sm opacity-80">您的密码不会被存储，登录行为由官方环境保护</p>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { WindowLoginController } from './controllers'
import Button from '@/components/ui/Button.vue'

const wct = useController(WindowLoginController)
</script>

<style scoped>
@reference "@/assets/main.css";
.transition-all {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.prompt-text {
  @apply flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500;
}
</style>
