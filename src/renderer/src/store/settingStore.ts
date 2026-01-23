/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2025-07-07 13:07:48
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 18:45:16
 * @FilePath: /template/src/renderer/src/store/settingStore.ts
 * @Description:设置的store
 *
 * Copyright (c) 2025 by ShirahaYuki, All Rights Reserved.
 */
import { defineStore } from 'pinia'
import { setting } from '@renderer/utils/setting'
export const useSettingStore = defineStore('setting', {
  state: () => ({
    setting: setting
  })
})
