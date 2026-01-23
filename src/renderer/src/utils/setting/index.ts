/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2025-07-07 12:14:49
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-01-22 18:45:03
 * @FilePath: /template/src/renderer/src/utils/setting/index.ts
 * @Description: 初始化生成设置对象
 *
 * Copyright (c) 2025 by ShirahaYuki, All Rights Reserved.
 */
import { store } from './store'

const initialValue = {
  window: {
    //点击关闭按钮时候是否直接关闭
    closeWhenClose: false,
    //是否询问是否关闭
    askWhenClose: true
  }
}

export const setting = store<typeof initialValue>('setting', initialValue)
