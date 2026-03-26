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
      this.observer = new ResizeObserver(entries => {
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
  @Project()
  get actualStartIndex() {
    const start = Math.floor(this.scrollTop / this.itemHeight)
    return Math.max(0, start - this.buffer)
  }

  /**
   * *当前可视区域内的数据的结束索引
   */
  @Project()
  get actualEndIndex() {
    const visibleCount =
      Math.ceil((this.containerRef.value?.clientHeight || 0) / this.itemHeight) ||
      Math.ceil(parseInt(this.containerHeight.toString()) / this.itemHeight)

    const end = Math.floor(this.scrollTop / this.itemHeight) + visibleCount
    return Math.min(this.listData.length, end + this.buffer)
  }

  /**
   * *当前可视区域内的数据
   */
  @Project<VirtualListController<T>>(i => {
    return i.listData.slice(i.actualStartIndex, i.actualEndIndex)
  })
  public visibleData!: T[]

  /*
   * *计算当前的填充区域的padding高度
   */
  @Project()
  get wrapperStyle() {
    const paddingTop = this.actualStartIndex * this.itemHeight
    const paddingBottom = (this.listData.length - this.actualEndIndex) * this.itemHeight

    return {
      paddingTop: `${paddingTop}px`,
      paddingBottom: `${paddingBottom}px`,
      boxSizing: 'border-box' as const
    }
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
  public scrollTo(index: number) {
    const container = this.containerRef.value
    if (!container) return
    // 边界检查
    const targetIndex = Math.max(0, Math.min(index, this.listData.length - 1))
    // 计算位移：目标索引 * 每个条目的高度
    const targetTop = targetIndex * this.itemHeight
    container.scrollTop = targetTop
    container.scrollTo({ top: targetTop, behavior: 'smooth' });
  }
}
