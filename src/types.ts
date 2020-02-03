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
  idPath: KeyPath
}

export type TraversalMethod = (
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  path?: KeyPath
) => void

export type Options = BaseOptions & {
  traversalMethod: TraversalMethod
}

export type Method = (
  options: Options,
  state: State,
  ...args: any[]
) => any

export type API<T extends Function> = {
  [k: string]: T
}
