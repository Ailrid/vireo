/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-02-01 15:31:35
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-02 15:42:58
 * @FilePath: /starry/src/renderer/src/ccs/constants.ts
 * @Description:字符串类型常量
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
/**
 * CCS 核心元数据键名
 */
export const CCS_METADATA = {
  PROJECT: 'ccs:project_metadata',
  WATCH: 'ccs:watch_metadata',
  SYSTEM: 'ccs:system_metadata',
  EVENT: 'ccs:event_configs',
  MESSAGE: 'ccs:message',
  RESPONSIVE: 'ccs:responsive',
  CONTROLLER: 'ccs:controller',
  COMPONENT: 'ccs:component'
} as const
