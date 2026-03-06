<template>
  <RouterView />
</template>

<script setup lang="ts"></script>

<style lang="css">
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-muted);
  user-select: none;
}
/* 滚动条整体轨道 */
::-webkit-scrollbar {
  width: 8px; /* 稍微窄一点更精致 */
  height: 8px;
}
/* 滚动条轨道 */
::-webkit-scrollbar-track {
  display: none;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  /* 使用你主题中的 muted-foreground (灰色文字色) */
  /* 在亮色模式下它是深灰，暗色下是浅灰，完美适配 */
  background: color-mix(in srgb, var(--muted-foreground), transparent 70%);

  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 10px;
}
/* 悬停时，使用强调色 (primary) */
::-webkit-scrollbar-thumb:hover {
  /* 直接用你主题定义的 primary 橙色/黑色 */
  background: color-mix(in srgb, var(--primary), transparent 40%);
}
</style>
