export type KeyPath = Array<string | number>
export type QuerySet = Array<KeyPath>
export type State = Record<any, any>
export type Node = Record<any, any>

export type BaseIterator = (
  node: Node,
  keyPath: KeyPath
) => boolean | void

export type BaseOptions = {
  rootPath: KeyPath
  childNodesPath: KeyPath
}

export type TraversalMethod = (
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  path?: KeyPath
) => void

export type Options = BaseOptions & {
  idPath: KeyPath
  traversalMethod: TraversalMethod
}

export type Apply<TMethod> = TMethod extends (
  v: any,
  ...args: infer U
) => infer O
  ? (...args: U) => O
  : never

export type Methods = Record<string, Function>

export type AppliedMethods<T extends Methods> = {
  [K in keyof T]: Apply<T[K]>
}
