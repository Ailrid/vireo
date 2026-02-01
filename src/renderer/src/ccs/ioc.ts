/*
 * @Author: ShirahaYuki  shirhayuki2002@gmail.com
 * @Date: 2026-01-31 15:24:02
 * @LastEditors: ShirahaYuki  shirhayuki2002@gmail.com
 * @LastEditTime: 2026-02-01 17:05:26
 * @FilePath: /starry/src/renderer/src/ccs/ioc.ts
 * @Description:依赖注入容器
 *
 * Copyright (c) 2026 by ShirahaYuki, All Rights Reserved.
 */
import { Container, type BindInWhenOnFluentSyntax, type BindWhenOnFluentSyntax } from 'inversify'

export const container = new Container()

// 定义构造函数类型
export type Newable<T> = new (...args: any[]) => T

/**
 * 核心绑定逻辑：内部复用
 */
function bindBase<T>(identifier: Newable<T>) {
  return container.bind<T>(identifier).toSelf()
}

/**
 * 对 Controller 的绑定：默认推荐多例 (.inTransientScope)
 * 但返回绑定句柄，允许外部链式调用 .inSingletonScope()
 */
export function bindController<T>(identifier: Newable<T>): BindInWhenOnFluentSyntax<T> {
  return bindBase(identifier)
}

/**
 * 对 Component 的绑定：默认推荐单例
 * 但同样允许外部覆盖
 */
export function bindComponent<T>(identifier: Newable<T>): BindWhenOnFluentSyntax<T> {
  return bindBase(identifier).inSingletonScope()
}
