import { List, Collection } from 'immutable'
export type KeyPath = List<string | number>
export type QuerySet = List<KeyPath>
export type State = Collection<any, any>
export type Node = Collection<any, any>

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
