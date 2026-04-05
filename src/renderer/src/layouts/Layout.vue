<template>
  <div class="relative h-screen w-full overflow-hidden">
    <router-view v-slot="{ Component }">
      <Transition :name="lct.transitionName">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>
<script setup lang="ts">
import { useController } from '@virid/vue'
import { LayoutController } from './controllers'
import { RouterView } from 'vue-router'
const lct = useController(LayoutController)
</script>

<style lang="css">
.fly-up-enter-active,
.fly-up-leave-active,
.fly-down-enter-active,
.fly-down-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fly-up-enter-from {
  transform: translateY(100%);
}
.fly-up-leave-to {
  transform: translateY(-100%);
}

.fly-down-enter-from {
  transform: translateY(-100%);
}
.fly-down-leave-to {
  transform: translateY(100%);
}

.fly-up-enter-to,
.fly-down-enter-to,
.fly-up-leave-from,
.fly-down-leave-from {
  transform: translateY(0);
}
</style>
