<template>
  <div class="flex h-full w-full items-center justify-center">
    <div class="flex w-full flex-col gap-6">
      <div class="setting-card-title flex justify-between">
        <div></div>
        <span> Player Settings </span>
        <Button variant="icon" @click="SwitchViewMessage.send()" class="cursor-pointer">
          <Undo2 :size="18" />
        </Button>
      </div>
      <!-- Player -->
      <div class="setting-sheet">
        <span class="setting-sheet-title">背景 (Background)</span>
        <div class="grid grid-cols-2 gap-x-8 gap-y-4">
          <div class="space-y-3">
            <label class="setting-item-title block">封面背景 (Cover)</label>
            <Switch v-model="pct.setting.coverBackground" />
          </div>
          <div class="space-y-3">
            <div v-if="pct.setting.coverBackground" class="w-32">
              <label class="setting-item-title">模糊半径 (Blur)</label>
              <div class="flex items-center gap-2">
                <Input
                  v-model.number="pct.setting.blur"
                  type="number"
                  min="0"
                  max="100"
                  class="h-8 flex-1 border"
                />
                <span class="text-sm font-bold uppercase opacity-50">px</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 拓展面板 -->
        <Transition name="panel-slide">
          <div v-if="pct.setting.coverBackground" class="w-full">
            <div class="space-y-3">
              <div class="flex justify-between">
                <label class="setting-item-title">透明度 (Opacity)</label>
                <span class="text-primary font-mono"
                  >{{ (pct.setting.opacity * 100).toFixed(0) }}%</span
                >
              </div>
              <Slider v-model="pct.setting.opacity" :min="0" :max="1" :step="0.01" class="w-full" />
            </div>
          </div>
        </Transition>
      </div>
      <!-- 其他设置 -->
      <div class="setting-sheet">
        <span class="setting-sheet-title">颜色与特效 (Color & Effect)</span>
        <div class="grid grid-cols-2 gap-x-8 gap-y-4">
          <div class="space-y-3">
            <label class="setting-item-title block">自动颜色 (Scale)</label>
            <Switch v-model="pct.setting.autoColor" />
          </div>
          <div class="space-y-3">
            <label class="setting-item-title block">歌词遮罩 (Effect)</label>
            <Switch v-model="pct.setting.mask" />
          </div>
        </div>
        <span class="setting-sheet-title">其他 (Other)</span>
        <div class="grid grid-cols-2 gap-x-8 gap-y-4">
          <div class="space-y-3">
            <label class="setting-item-title block">歌词居中 (Center)</label>
            <Switch v-model="pct.setting.center" />
          </div>
          <div class="space-y-3">
            <label class="setting-item-title block">歌词模糊 (Blur)</label>
            <Switch v-model="pct.setting.lyricBlur" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { PlayerConfigController } from './controllers'
import Slider from '@/components/ui/Slider.vue'
import Input from '@/components/ui/Input.vue'
import Switch from '@/components/ui/Switch.vue'
import { SwitchViewMessage } from '@/pages/controllers'
import { Undo2 } from 'lucide-vue-next'
const pct = useController(PlayerConfigController)
</script>

<style scoped>
@import '@/assets/pages/setting.css';
@reference "@/assets/main.css";

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 100px;
  overflow: hidden;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
