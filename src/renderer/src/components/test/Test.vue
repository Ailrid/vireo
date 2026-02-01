<template>
  <div>{{ ctrl.volume }}</div>
  <div>{{ ctrl.isPlaying }}</div>
  <button @click="() => MessageWriter.write(new TestMessage())">增加音量</button>
  <button @click="() => MessageWriter.write(new PlayMessage())">播放停止</button>
</template>

<script setup lang="ts">
// import { useController } from '@/core/hooks'
import { TestMessage, PlayMessage } from '@/logic/systems/testSystem'
import { TestController } from '@/logic/controllers/testController'
import { MessageWriter } from '@/ccs/message'
import { useController } from '@/ccs/adapters/hooks'
const ctrl = useController<TestController>(TestController) // 内部处理所有 metadata 包装
</script>

<style lang="scss" scoped></style>
