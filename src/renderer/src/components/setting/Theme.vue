<template>
  <div
    class="backdrop-blur-md flex flex-col gap-4 p-4 border border-black/5 dark:border-white/10 shadow-sm rounded-lg bg-card"
  >
    <div class="flex items-center gap-4 p-2">
      <div class="w-1 h-3 bg-primary rounded-full"></div>
      <span class="text-base font-bold uppercase tracking-wider"> Theme Settings </span>
    </div>
    <!-- Theme -->
    <div class="flex flex-col w-full gap-4 p-2 backdrop-blur-md">
      <span class="text-base font-bold uppercase tracking-wider opacity-50"
        >主题与壁纸 (Theme & Background)</span
      >

      <div class="flex items-center">
        <div class="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            class="relative cursor-pointer hover:bg-accent/50 transition-all duration-300 group"
            :class="{
              'bg-accent text-accent-foreground shadow-sm': thc.themeSetting.mode === 'light'
            }"
            @click="thc.toggleTheme('light')"
          >
            <Sun
              class="h-4 w-4 transition-transform duration-500 ease-in-out"
              :class="{ 'rotate-180': thc.activeBtn === 'light' }"
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            class="relative cursor-pointer hover:bg-accent/50 transition-all duration-300 group"
            :class="{
              'bg-accent text-accent-foreground shadow-sm': thc.themeSetting.mode === 'dark'
            }"
            @click="thc.toggleTheme('dark')"
          >
            <Moon
              class="h-4 w-4 transition-all duration-500"
              :class="{ 'scale-110 -rotate-12': thc.activeBtn === 'dark' }"
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            class="relative cursor-pointer hover:bg-accent/50 transition-all duration-300 group"
            :class="{
              'bg-accent text-accent-foreground shadow-sm': thc.themeSetting.mode === 'image'
            }"
            @click="thc.toggleTheme('image')"
          >
            <ImageIcon
              class="h-4 w-4 transition-transform duration-500"
              :class="{ '-translate-y-0.5': thc.activeBtn === 'image' }"
            />
          </Button>
        </div>
        <div class="flex-1"></div>
        <div
          v-if="thc.setting.url"
          class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/30 hover:bg-accent/50 border border-border/50 transition-all cursor-pointer group w-fit"
          @click="thc.openDialog"
        >
          <span class="text-sm font-mono truncate opacity-70 group-hover:opacity-100">
            {{ thc.setting.url.split('/').pop() }}
          </span>
        </div>
      </div>

      <!-- Image Settings -->
      <Transition name="panel-slide">
        <div v-if="thc.themeSetting.mode === 'image'" class="overflow-hidden">
          <div class="flex flex-row items-center gap-6">
            <div class="flex-1 space-y-2">
              <div class="flex justify-between text-sm font-medium opacity-70">
                <label>透明度 (Opacity)</label>
                <span class="font-mono text-primary"
                  >{{ (thc.setting.opacity * 100).toFixed(0) }}%</span
                >
              </div>
              <Slider v-model="thc.opacityArray" :min="0" :max="1" :step="0.01" class="w-full" />
            </div>
            <div class="h-8 w-px bg-black/5 dark:bg-white/10 self-end mb-1"></div>
            <div class="w-40 space-y-2">
              <label class="text-sm font-medium opacity-70">模糊半径 (Blur)</label>
              <div class="flex items-center gap-2">
                <Input
                  v-model.number="thc.setting.blur"
                  type="number"
                  min="0"
                  max="100"
                  class="h-8 flex-1 border"
                />
                <span class="text-sm uppercase opacity-50 font-bold">px</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- General Settings -->
    <div class="flex flex-col gap-4 p-2">
      <div class="flex items-center gap-2 opacity-50">
        <span class="text-base font-bold uppercase tracking-wider">颜色与字体 (Color & Font)</span>
      </div>

      <div class="grid grid-cols-2 gap-x-8 gap-y-6">
        <div class="space-y-3">
          <div class="flex justify-between text-sm font-medium opacity-70">
            <label>UI缩放 (Scale)</label>
            <span class="font-mono text-primary"
              >{{ (thc.setting.fontSizeScale * 100).toFixed(0) }}%</span
            >
          </div>
          <Slider
            v-model="thc.fontSizeScaleArray"
            :min="0.5"
            :max="1.5"
            :step="0.01"
            class="w-full"
          />
        </div>

        <div class="space-y-3">
          <div class="flex justify-between text-sm font-medium opacity-70">
            <label>全局圆角 (Radius)</label>
            <span class="font-mono text-primary">{{ thc.setting.borderRadius }}px</span>
          </div>
          <Slider v-model="thc.borderRadiusArray" :min="0" :max="24" :step="2" class="w-full" />
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium opacity-70">字体族 (Family)</label>
          </div>
          <div class="flex gap-2">
            <Select @update:model-value="(v) => (thc.setting.fontFamily = v as string)">
              <SelectTrigger
                class="cursor-pointer h-8 w-25 bg-card text-sm border-black/5 dark:border-white/10 shrink-0"
              >
                <span class="opacity-70">预设</span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ui-sans-serif, system-ui, sans-serif">默认无衬线</SelectItem>
                  <SelectItem value="ui-monospace, Consolas, monospace">工业等宽</SelectItem>
                  <SelectItem value="'Microsoft YaHei', sans-serif">微软雅黑</SelectItem>
                  <SelectItem value="'PingFang SC', sans-serif">苹方 (Mac)</SelectItem>
                  <SelectItem value="'STKaiti', 'KaiTi', serif">楷体 (书写)</SelectItem>
                  <SelectItem value="'STZhongsong', serif">中宋 (古典)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div class="relative flex-1">
              <Input
                v-model="thc.setting.fontFamily"
                placeholder="手动输入字体名..."
                class="h-8 w-full pr-8 text-sm font-medium"
              />
              <div
                class="absolute right-2 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity cursor-help"
              >
                <component :is="FontIcon" class="w-3 h-3" />
              </div>
            </div>
          </div>
          <p class="text-xs opacity-40 italic">提示：输入系统中已安装的字体名后回车</p>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium opacity-70">文本对比度 (Text Contrast)</label>
          </div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              class="flex-1 h-9 gap-2 transition-all cursor-pointer"
              @click="thc.setting.textColor = 'black'"
            >
              <div class="h-3 w-3 rounded-full bg-black border border-white/20"></div>
              <span class="text-xs">深色文字</span>
            </Button>
            <Button
              variant="outline"
              class="flex-1 h-9 gap-2 transition-all cursor-pointer"
              @click="thc.setting.textColor = 'white'"
            >
              <div class="h-3 w-3 rounded-full bg-white border border-black/10"></div>
              <span class="text-xs">浅色文字</span>
            </Button>
          </div>

          <p class="text-xs opacity-40 leading-relaxed italic">
            提示：使用图片背景时，手动选择字体色来保持可读性
          </p>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium opacity-70">强调色 (Primary)</label>
          </div>

          <Popover>
            <PopoverTrigger as-child>
              <div class="w-full flex items-center">
                <div
                  class="h-8 w-16 rounded-md border border-black/10 dark:border-white/20 cursor-pointer shadow-inner transition-transform hover:scale-105 active:scale-95"
                  :style="{
                    backgroundColor: thc.setting.primaryColor
                      ? `rgb(${thc.setting.primaryColor.join(',')})`
                      : 'var(--primary)'
                  }"
                ></div>
                <div class="flex-1"></div>

                <Button
                  variant="outline"
                  class="flex-1 h-9 gap-2 transition-all cursor-pointer"
                  @click="thc.setting.primaryColor = thc.setting.imgAvgColor"
                >
                  <span class="text-xs">提取背景色</span>
                </Button>
              </div>
            </PopoverTrigger>

            <PopoverContent class="p-3">
              <div class="space-y-3">
                <div class="text-xs font-medium opacity-50 flex justify-between items-center">
                  <span>选择强调色</span>
                </div>
                <div class="grid grid-cols-6 gap-2">
                  <Button
                    v-for="(rgb, name) in thc.colors"
                    :key="name"
                    variant="outline"
                    class="cursor-pointer h-8 w-8 rounded-full transition-all hover:scale-110 active:scale-90 flex items-center justify-center"
                    :style="{ backgroundColor: `rgb(${rgb.join(',')})` }"
                    @click="thc.setting.primaryColor = rgb"
                  >
                    <Check
                      v-if="thc.setting.primaryColor === rgb"
                      class="h-4 w-4 text-white mix-blend-difference"
                    />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { ThemeController } from './controllers'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup
} from '@/components/ui/select'
import { Sun, Moon, Image as ImageIcon, Type as FontIcon } from 'lucide-vue-next'
const thc = useController(ThemeController)
</script>

<style scoped>
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
</style>
