import { Component } from '@virid/core'
import { Responsive } from '@virid/vue'

// 定义背景模式
export type BackgroundMode = 'light' | 'dark' | 'image' | 'shader'

export interface ThemeConfig {
  mode: BackgroundMode
  url: string // 图片地址
  opacity: number // 背景亮度/透明度控制
  blur: number // 模糊程度
  imgAvgColor: Array<number> | null //从图片中提取的主色调
  primaryColor: Array<number> | null //用户自定义的
  // 字体系统
  fontSizeScale: number // 字体缩放比例，控制全局 REM
  fontFamily: string // 字体名称或分类 (sans-serif, serif, mono)
  borderRadius: number // 全局圆角大小 (px)
  textColor: string | null // 文字颜色
}

@Component()
export class SettingComponent {
  @Responsive()
  public theme: ThemeConfig = {
    mode: 'light',
    url: '',
    opacity: 0.15, // 稍微降一点，配合背景色会有通透感
    blur: 0, // 默认给点模糊更高级
    imgAvgColor: null,
    primaryColor: null, // 默认一个蓝色的 accent
    fontSizeScale: 1, // 100% 缩放
    fontFamily: 'Inter, system-ui, sans-serif',
    textColor: null, // 为空时使用 Controller 逻辑自动计算
    borderRadius: 12 // 适中的圆角
  }
}
