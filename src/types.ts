export type KeyPath = Array<string | number>
export type QuerySet = Array<KeyPath>
export type State = Record<any, any>
export type TreeNode = Record<any, any>

export type BaseIterator = (
  node: TreeNode,
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

export type StateReducer<T extends Methods, R> = (api: T) => R

declare function withState<TMethods extends Methods, TResult>(
  methods: TMethods,
  state: State,
  reducer: StateReducer<AppliedMethods<TMethods>, TResult>
): TResult

export type API<T extends Methods> = AppliedMethods<T> & {
  withState: Apply<typeof withState>
}

/**
 * Signature of the function passed to a [[TreeReducer]] to immediately abort a [[reduceTree]] procedure and return `T`.
 *
 * @typeparam T The type the stop function should abort with. Inferred.
 */
export type Stop<T> = (v: T) => T

/**
 * Signature of functions that want to act as reducers to [[reduceTree]]
 *
 * @typeparam T Inherited by type `T` cast on the higher-order [[reduceTree]] function.
 */
export type TreeReducer<T> = (
  accumulator: T,
  node: TreeNode,
  keyPath: KeyPath,
  stop: Stop<T>
) => T
