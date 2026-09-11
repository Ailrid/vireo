<template>
  <div class="setting-card">
    <div class="setting-card-title">
      <div></div>
      <span> Audio Settings </span>
    </div>
    <!-- General Settings -->
    <div class="setting-sheet">
      <span class="setting-sheet-title">低音增强 (BASS)</span>
      <div class="grid grid-cols-2 gap-x-8 gap-y-4">
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">开关 (Switch)</label>
          </div>
          <Switch v-model="pct.setting.bass_switch" />
        </div>
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">增益倍数 (Gain)</label>
          </div>
          <Input
            v-model="pct.setting.bass_gain"
            type="number"
            :min="0"
            :max="3"
            :step="0.1"
            class="h-8 flex-1 border"
          />
        </div>
      </div>
      <span class="setting-sheet-title">音质晶化 (CRYSTALLIZATION)</span>
      <div class="grid grid-cols-2 gap-x-8 gap-y-4">
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">开关 (Switch)</label>
          </div>
          <Switch v-model="pct.setting.crystallization_switch" />
        </div>
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">增益倍数 (Gain)</label>
          </div>
          <Input
            v-model="pct.setting.crystallization_gain"
            type="number"
            :min="0"
            :max="3"
            :step="0.1"
            class="h-8 flex-1 border"
          />
        </div>
      </div>
      <span class="setting-sheet-title">立体声 (STEREO)</span>
      <div class="grid grid-cols-2 gap-x-8 gap-y-4">
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">开关 (Switch)</label>
          </div>
          <Switch v-model="pct.setting.stereo_switch" />
        </div>
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">增益倍数 (Gain)</label>
          </div>
          <Input
            v-model="pct.setting.stereo_gain"
            type="number"
            :min="0"
            :max="3"
            :step="0.1"
            class="h-8 flex-1 border"
          />
        </div>
      </div>
      <span class="setting-sheet-title">限幅器 (LIMITER)</span>
      <div class="grid grid-cols-2 gap-x-8 gap-y-4">
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">开关 (Switch)</label>
          </div>
          <Switch v-model="pct.setting.limiter_switch" />
        </div>
        <div class="space-y-3">
          <div class="flex justify-between">
            <label class="setting-item-title">增益倍数 (Gain)</label>
          </div>
          <Input
            v-model="pct.setting.limiter_gain"
            type="number"
            :min="0"
            :max="3"
            :step="0.1"
            class="h-8 flex-1 border"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { PipelineController } from './controllers'
import Input from '@/components/ui/Input.vue'
import Switch from '@/components/ui/Switch.vue'

const pct = useController(PipelineController)
</script>

<style scoped>
@import '@/assets/pages/setting.css';
@reference "@/assets/main.css";
</style>
