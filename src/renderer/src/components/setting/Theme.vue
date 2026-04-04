<template>
  <div class="setting-card">
    <div class="setting-card-title">
      <div></div>
      <span> Theme Settings </span>
    </div>
    <!-- Theme -->
    <div class="setting-sheet">
      <span class="setting-sheet-title">主题与壁纸 (Theme & Background)</span>
      <div class="flex items-center">
        <div class="flex items-center gap-1">
          <Button
            v-for="item in [
              { mode: 'light', icon: Sun, effect: 'rotate-180' },
              { mode: 'dark', icon: Moon, effect: 'scale-110 -rotate-12' },
              { mode: 'image', icon: ImageIcon, effect: '-translate-y-0.5' }
            ] as const"
            :key="item.mode"
            variant="icon"
            class="theme-toggle-btn h-8 w-8"
            :class="tch.activatedBtnClass(item.mode)"
            @click="tch.toggleTheme(item.mode)"
          >
            <component
              :is="item.icon"
              class="h-4 w-4 transition-transform duration-300"
              :class="tch.activeBtn === item.mode ? item.effect : 'opacity-50'"
            />
          </Button>
        </div>
        <div class="flex-1"></div>
        <div v-if="tch.setting.url" class="prompt-text path-line" @click="tch.openDialog">
          {{ tch.setting.url.split('/').pop() }}
        </div>
      </div>
      <!-- Image Settings -->
      <Transition name="panel-slide">
        <div v-if="tch.themeSetting.mode === 'image'" class="flex flex-row items-center gap-4">
          <div class="flex-1 space-y-2">
            <div class="flex justify-between">
              <label class="setting-item-title">透明度 (Opacity)</label>
              <span class="text-primary font-mono"
                >{{ (tch.setting.opacity * 100).toFixed(0) }}%</span
              >
            </div>
            <Slider v-model="tch.setting.opacity" :min="0" :max="1" :step="0.01" class="w-full" />
          </div>
          <div class="w-40 space-y-2">
            <label class="setting-item-title">模糊半径 (Blur)</label>
            <div class="flex items-center gap-2">
              <Input
                v-model.number="tch.setting.blur"
                type="number"
                min="0"
                max="100"
                class="h-8 flex-1 border"
              />
              <span class="text-sm font-bold uppercase opacity-50">px</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <!-- General Settings -->
    <div class="setting-sheet">
      <span class="setting-sheet-title">颜色与字体 (Color & Font)</span>
      <div class="grid grid-cols-2 gap-x-8 gap-y-4">
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">UI缩放 (Scale)</label>
            <span class="text-primary font-mono"
              >{{ (tch.setting.fontSizeScale * 100).toFixed(0) }}%</span
            >
          </div>
          <Slider
            v-model="tch.setting.fontSizeScale"
            :min="0.5"
            :max="1.5"
            :step="0.01"
            class="w-full"
          />
        </div>
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">全局圆角 (Radius)</label>
            <span class="text-primary font-mono">{{ tch.setting.borderRadius }}px</span>
          </div>
          <Slider v-model="tch.setting.borderRadius" :min="0" :max="24" :step="2" class="w-full" />
        </div>
        <div class="space-y-3">
          <label class="setting-item-title block">字体族 (Family)</label>
          <div class="flex gap-2">
            <Select
              v-model="tch.setting.fontFamily"
              :options="[
                { label: '默认无衬线', value: 'ui-sans-serif, system-ui, sans-serif' },
                { label: '工业等宽', value: 'ui-monospace, Consolas, monospace' },
                { label: '微软雅黑', value: '\'Microsoft YaHei\', sans-serif' },
                { label: '苹方 (Mac)', value: '\'PingFang SC\', sans-serif' },
                { label: '楷体 (书写)', value: '\'STKaiti\', \'KaiTi\', serif' },
                { label: '中宋 (古典)', value: '\'STZhongsong\', serif' }
              ]"
              class="w-48"
            />
            <div class="relative flex-1">
              <Input
                v-model="tch.setting.fontFamily"
                placeholder="手动输入字体名..."
                class="h-8 w-full pr-8 text-sm font-medium"
              />
              <div
                class="absolute top-1/2 right-2 -translate-y-1/2 cursor-help opacity-20 transition-opacity hover:opacity-100"
              >
                <FontIcon class="h-3 w-3" />
              </div>
            </div>
          </div>
          <p class="prompt-text">提示：输入系统中已安装的字体名后回车</p>
        </div>
        <div class="space-y-3">
          <label class="setting-item-title block">文本对比度 (Text Contrast)</label>
          <div class="flex gap-2">
            <Button
              variant="outline"
              class="font-color-btn bg-white shadow"
              @click="tch.setting.textColor = 'black'"
            >
              <span class="text-xs text-black">深色文字</span>
            </Button>
            <Button
              variant="outline"
              class="font-color-btn bg-black shadow hover:bg-zinc-900"
              @click="tch.setting.textColor = 'white'"
            >
              <span class="text-xs text-white">浅色文字</span>
            </Button>
          </div>
          <p class="prompt-text">提示：使用图片背景时，手动选择字体色来保持可读性</p>
        </div>
        <div class="space-y-3">
          <label class="setting-item-title block">强调色 (Primary)</label>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div
                class="h-8 w-16 rounded-md border border-black/10 shadow-inner transition-transform dark:border-white/20"
                :style="{
                  backgroundColor: tch.setting.primaryColor
                    ? `rgb(${tch.setting.primaryColor.join(',')})`
                    : 'var(--primary)'
                }"
              ></div>

              <span class="font-mono text-xs opacity-50">Current</span>

              <Button
                variant="outline"
                class="h-8 flex-1 cursor-pointer gap-2 border-dashed"
                @click="tch.setting.primaryColor = tch.setting.imgAccentColor"
              >
                <span class="text-xs">提取背景色</span>
              </Button>
            </div>
            <div class="space-y-2">
              <label class="prompt-text block">Palette</label>
              <div class="grid grid-cols-8 gap-2">
                <button
                  v-for="(rgb, name) in tch.colors"
                  :key="name"
                  type="button"
                  class="palette-item"
                  :style="{ backgroundColor: `rgb(${rgb.join(',')})` }"
                  @click="tch.setting.primaryColor = rgb"
                ></button>
              </div>
            </div>
          </div>
        </div>
        <div class="space-y-3">
          <div class="grid w-full grid-cols-2 gap-x-8 gap-y-4">
            <div class="space-y-3">
              <label class="setting-item-title block">自动音频色 (Wave Color)</label>
              <Switch v-model="tch.setting.enableSliderAutoColor" />
            </div>
            <div class="space-y-3">
              <label class="setting-item-title block">沉浸模式 (Immersive)</label>
              <div class="flex items-center justify-between">
                <Switch v-model="tch.setting.immersiveMode" />
                <p class="prompt-text">仅图像模式下有效</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { ThemeController } from './controllers'
import Button from '@/components/ui/Button.vue'
import Slider from '@/components/ui/Slider.vue'
import Input from '@/components/ui/Input.vue'
import Switch from '@/components/ui/Switch.vue'
import Select from '@/components/ui/Select.vue'

import { Sun, Moon, Image as ImageIcon, Type as FontIcon } from 'lucide-vue-next'
const tch = useController(ThemeController)
</script>

<style scoped>
@import '@/assets/pages/setting.css';
@reference "@/assets/main.css";
/* 定义动画：进入和离开的过程 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 100px; /* 给一个足够大的高度供动画平滑过渡 */
  overflow: hidden;
}

/* 定义初始和结束状态 */
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.theme-toggle-btn {
  @apply hover:bg-accent/50 relative cursor-pointer transition-all duration-300;
}
.theme-toggle-icon {
  @apply h-4 w-4 transition-all duration-500;
}
.font-color-btn {
  @apply h-8 flex-1 cursor-pointer gap-2 border-dashed transition-all;
}
.select-trigger {
  @apply bg-card h-8 w-25 shrink-0 cursor-pointer border-black/10 text-sm dark:border-white/10;
}
.palette-item {
  @apply relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-black/10 transition-all hover:scale-110 active:scale-90 dark:border-white/10;
}
.path-line {
  @apply from-primary cursor-pointer bg-linear-to-r to-transparent bg-size-[100%_3px] bg-bottom bg-no-repeat pb-1 text-xs transition-opacity hover:opacity-80;
}
.shadow {
  @apply shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)];
}
</style>
