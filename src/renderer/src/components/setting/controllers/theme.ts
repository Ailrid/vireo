import { Controller } from '@virid/core'
import { SettingComponent, type ThemeConfig } from '@/ccs/settings'
import { Listener, Project, Responsive, OnHook, Watch } from '@virid/vue'
import { getAverageRGB } from '@/utils'
import { SaveSettingsMessage } from '@/ccs/settings/message'
import { FromIpc, FromMainMessage, ToMainMessage } from '@virid/renderer'
// 获得选择的文件的路径
@FromIpc('file-dialog')
class ChooseBgImageMessage extends FromMainMessage {
  constructor(public path: string) {
    super()
  }
}
//打开文件选择框
class OpenDialogMessage extends ToMainMessage {
  __virid_target: string = 'main'
  __virid_messageType: string = 'open-dialog'
  constructor(
    public options: {
      title?: string
      filters?: Array<{ name: string; extensions: string[] }>
      properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>
    }
  ) {
    super()
  }
}

@Controller()
export class ThemeController {
  @Project(SettingComponent, (setting) => setting.theme)
  public themeSetting!: ThemeConfig

  public get opacityArray(): number[] {
    return [this.setting.opacity]
  }

  public set opacityArray(val: number[]) {
    this.setting.opacity = val[0]
  }
  public get fontSizeScaleArray(): number[] {
    return [this.setting.fontSizeScale]
  }

  public set fontSizeScaleArray(val: number[]) {
    this.setting.fontSizeScale = val[0]
  }
  public get borderRadiusArray(): number[] {
    return [this.setting.borderRadius]
  }
  public set borderRadiusArray(val: number[]) {
    this.setting.borderRadius = val[0]
  }
  @Responsive()
  public setting!: ThemeConfig
  @Responsive()
  public activeBtn!: string
  @OnHook('onSetup')
  public setup() {
    this.setting = JSON.parse(JSON.stringify(this.themeSetting))
  }
  @Watch<ThemeController>((i) => i.setting, { deep: true })
  public updateTheme() {
    //切换到图片主题
    SaveSettingsMessage.send((settings) => {
      settings.theme = this.setting
    })
  }
  /**
   * *切换主题模式
   */
  public async toggleTheme(mode: 'light' | 'dark' | 'image') {
    this.setting.mode = mode
    this.activeBtn = mode
    setTimeout(() => {
      this.activeBtn = ''
    }, 500)
    //亮色和暗色主题
    if (mode === 'light' || mode === 'dark') {
      return SaveSettingsMessage.send((settings) => {
        settings.theme.mode = mode
      })
    }
    //图片主题
    if (mode === 'image') {
      if (!this.setting.url) {
        //没有图像，先打开对话框选择
        this.openDialog()
        return
      }
      SaveSettingsMessage.send((settings) => {
        settings.theme = this.setting
      })
    }
  }
  //监听选择对话框的消息，并调整自己的路径
  @Listener(ChooseBgImageMessage)
  public async chooseBgImageListener(message: ChooseBgImageMessage) {
    //更新路径
    this.setting.url = 'local-file://' + message.path
    const rgb = await getAverageRGB(this.setting.url)
    this.setting.imgAvgColor = rgb
  }
  /**
   * *  打开文件选择框
   */
  public openDialog() {
    OpenDialogMessage.send({
      title: '选择背景图片',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] }]
    })
  }
  @Responsive()
  public colors = {
    // --- 基础中性色 (5个) ---
    white: [255, 255, 255],
    lightGray: [212, 212, 216], // Zinc-300 级别
    neutral: [115, 115, 115], // Neutral-500
    darkGray: [63, 63, 70], // Zinc-700
    black: [0, 0, 0],

    // --- HSL 循环光谱 (19个) ---
    // 按照 Hue 每隔 ~19° 取样，饱和度 85%，亮度根据视觉感官微调
    red: [239, 68, 68], // 0°
    roseRed: [225, 29, 72], // 340°
    pink: [244, 114, 182], // 330°
    fuchsia: [192, 38, 211], // 290°
    purple: [147, 51, 234], // 270°
    indigo: [79, 70, 229], // 240°
    blue: [37, 99, 235], // 210°
    sky: [14, 165, 233], // 195°
    cyan: [6, 182, 212], // 180°
    teal: [13, 148, 136], // 170°
    emerald: [16, 185, 129], // 160°
    green: [34, 197, 94], // 140°
    lime: [101, 163, 13], // 80°
    yellow: [234, 179, 8], // 45° (调低了亮度以防看不见)
    amber: [245, 158, 11], // 35°
    orange: [249, 115, 22], // 25°
    warmOrange: [234, 88, 12], // 20°
    deepOrange: [194, 65, 12], // 15°
    bloodRed: [153, 27, 27] // 5°
  }
}
