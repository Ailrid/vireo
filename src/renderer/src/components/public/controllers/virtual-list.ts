import { Responsive, Env, Project, Use, OnHook } from '@virid/vue'
import { Controller } from '@virid/core'
import { useTemplateRef, type ShallowRef } from 'vue'
@Controller()
export class VirtualListController<T> {
  @Responsive()
  public scrollTop = 0
  @Responsive()
  public listData: T[] = []
  @Responsive()
  public containerHeight: number = 0

  @Env()
  public itemHeight!: number
  @Env()
  public buffer!: number
  @Env()
  public keyField: keyof T | null = null
  @Use(() => {
    return useTemplateRef<HTMLDivElement>('container')
  })
  public containerRef!: Readonly<ShallowRef<HTMLDivElement | null>>

  private observer: ResizeObserver | null = null
  /**
   * *挂载时开启监听
   */
  @OnHook('onMounted')
  public setupResizeObserver() {
    if (this.containerRef.value) {
      // 初始计算高度
      this.containerHeight = this.containerRef.value.clientHeight
      // 容器尺寸变化时，自动更新 containerHeight
      this.observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          this.containerHeight = entry.contentRect.height
        }
      })
      this.observer.observe(this.containerRef.value)
    }
  }

  /**
   * *卸载时销毁监听
   */
  @OnHook('onUnmounted')
  public cleanup() {
    this.observer?.disconnect()
    this.observer = null
  }
  /**
   * *当前可视区域内的数据的开始索引
   */
  @Project<VirtualListController<T>>((i) => {
    const start = Math.floor(i.scrollTop / i.itemHeight)
    return Math.max(0, start - i.buffer)
  })
  public actualStartIndex!: number

  /**
   * *当前可视区域内的数据的结束索引
   */
  @Project<VirtualListController<T>>((i) => {
    const visibleCount =
      Math.ceil((i.containerRef.value?.clientHeight || 0) / i.itemHeight) ||
      Math.ceil(parseInt(i.containerHeight.toString()) / i.itemHeight)

    const end = Math.floor(i.scrollTop / i.itemHeight) + visibleCount
    return Math.min(i.listData.length, end + i.buffer)
  })
  public actualEndIndex!: number

  /**
   * *当前可视区域内的数据
   */
  @Project<VirtualListController<T>>((i) => {
    return i.listData.slice(i.actualStartIndex, i.actualEndIndex)
  })
  public visibleData!: T[]

  /*
   * *计算当前的填充区域的padding高度
   */
  @Project<VirtualListController<T>>((i) => {
    const paddingTop = i.actualStartIndex * i.itemHeight
    const paddingBottom = (i.listData.length - i.actualEndIndex) * i.itemHeight

    return {
      paddingTop: `${paddingTop}px`,
      paddingBottom: `${paddingBottom}px`,
      boxSizing: 'border-box' as const
    }
  })
  public wrapperStyle!: {
    paddingTop: string
    paddingBottom: string
    boxSizing: 'border-box'
  }

  /**
   * *更新当前高度
   */
  public onScroll(e: Event) {
    this.scrollTop = (e.target as HTMLElement).scrollTop
  }

  /**
   * *获得当前item的key
   */
  public getItemKey(item: T, index: number) {
    if (this.keyField) return (item as any)[this.keyField]
    return this.actualStartIndex + index
  }
}
