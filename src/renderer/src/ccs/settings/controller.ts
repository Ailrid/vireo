import { Controller } from '@virid/core'
import { SettingComponent } from './component'
import { Project } from '@virid/vue'
// 辅助函数：将 [r, g, b] 转换为 "rgb(r, g, b)"
const toRgb = (arr: number[]) => `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`

@Controller()
export class SettingController {
  @Project(SettingComponent, (i) => {
    return i
  })
  public setting!: SettingComponent

  /**
   * *计算根部样式
   */
  @Project<SettingController>()
  get rootStyle() {
    const config = this.setting.theme
    const styles: Record<string, string | number> = {
      borderColor: 'var(--window-border)',
      boxShadow: 'inset 0 0 4px var(--window-inset-shadow)'
    }

    // 字体与圆角
    // styles['font-size'] = `${config.fontSizeScale * 16}px`
    document.documentElement.style.fontSize = `${config.fontSizeScale * 16}px`
    styles['--radius'] = `${config.borderRadius}px`
    styles['font-family'] = config.fontFamily

    // 颜色映射：必须转换为字符串格式
    if (config.textColor && Array.isArray(config.textColor)) {
      styles['--foreground'] = toRgb(config.textColor)
    }
    if (config.primaryColor && Array.isArray(config.primaryColor)) {
      styles['--primary'] = toRgb(config.primaryColor)
    }
    if (config.imgAvgColor && Array.isArray(config.imgAvgColor)) {
      styles['--avg-color'] = toRgb(config.imgAvgColor)
    }
    //配置边框颜色
    if (config.mode === 'light') {
      styles['--window-border'] = '#CFCFCF'
      styles['--window-inset-shadow'] = '#CFCFCF'
      styles['color'] = 'var(--foreground)'
    } else if (config.mode === 'dark') {
      styles['--window-border'] = '#141414'
      styles['--window-inset-shadow'] = '#141414'
      styles['color'] = 'var(--foreground)'
    } else if (config.primaryColor) {
      const color = toRgb(config.primaryColor)
      styles['--window-border'] = color
      styles['--window-inset-shadow'] = color
      styles['color'] = config.textColor ? config.textColor : 'var(--foreground)'
    }

    // 模式逻辑
    if (config.mode === 'image') {
      styles['--background'] = 'transparent'
      styles['--sidebar'] = 'transparent'
      styles['--card'] = 'transparent'
      styles['--bg-image'] = `url("${config.url}")`
    }
    return styles
  }

  /**
   * *返回 Tailwind 需要的 class
   */
  @Project<SettingController>()
  get themeClasses() {
    const mode = this.setting.theme.mode
    return {
      dark: mode === 'dark'
    }
  }

  /**
   * *控制遮罩的opacity和blur
   */
  @Project<SettingController>()
  get maskStyle() {
    return {
      backgroundColor: `rgba(0, 0, 0, ${this.setting.theme.opacity})`,
      backdropFilter: `blur(${this.setting.theme.blur}px)`,
      webkitBackdropFilter: `blur(${this.setting.theme.blur}px)` // 为了更好的兼容性
    }
  }
}
