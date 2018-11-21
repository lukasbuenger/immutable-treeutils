import { List } from 'immutable'
import { Node, KeyPath, Options, State, QuerySet } from './types'

type Stop = (v: any) => any

type Reducer<T> = (
  accumulator?: T,
  node?: Node,
  keyPath?: KeyPath,
  stop?: Stop
) => T

export function reduceTree<T extends any>(
  options: Options,
  state: State,
  reducer: Reducer<T>,
  initial?: T,
  path?: KeyPath
): T {
  let reduction = initial
  let stopped: Boolean = false
  const stop: Stop = value => {
    stopped = true
    return value
  }
  options.traversalMethod(
    options,
    state,
    (node, keyPath) => {
      reduction = reducer(reduction, node, keyPath, stop)
      if (stopped) {
        return false
      }
    },
    path
  )
  return reduction
}

export function nodes(
  options: Options,
  state: State,
  path?: KeyPath
): QuerySet {
  return <QuerySet>(
    reduceTree(
      options,
      state,
      (acc, _, keyPath) => acc.push(keyPath),
      List(),
      path
    )
  )
}

export function find(
  options: Options,
  state: State,
  comparator: (v: Node, k: KeyPath) => boolean,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  return <KeyPath | any>(
    reduceTree(
      options,
      state,
      (acc, node, keyPath, stop) =>
        comparator(node, keyPath) === true ? stop(keyPath) : acc,
      notSetValue,
      path
    )
  )
}

export function filter(
  options: Options,
  state: State,
  comparator: (v: Node, k: KeyPath) => boolean,
  path?: KeyPath
): QuerySet {
  return <QuerySet>(
    reduceTree(
      options,
      state,
      (acc, node, keyPath) =>
        comparator(node, keyPath) === true ? acc.push(keyPath) : acc,
      List(),
      path
    )
  )
}

export function findId(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  return List.isList(idOrKeyPath)
    ? idOrKeyPath
    : <KeyPath | any>(
        reduceTree(
          options,
          state,
          (acc, node, keyPath, stop) =>
            node.get(options.idKey) === idOrKeyPath
              ? stop(keyPath)
              : acc,
          notSetValue,
          path
        )
      )
}

export function getId(
  options: Options,
  state: State,
  keyPath: KeyPath,
  notSetValue?: any
): string {
  return state.getIn(keyPath.push(options.idKey), notSetValue)
}

export function nextSibling(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )
  if (keyPath === notSetValue) {
    return notSetValue
  }

  const index = Number(keyPath.last())
  const nextSiblingPath = keyPath.pop().push(index + 1)

  if (state.hasIn(nextSiblingPath)) {
    return nextSiblingPath
  }

  return notSetValue
}

export function previousSibling(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )
  if (keyPath === notSetValue) {
    return notSetValue
  }

  const index = Number(keyPath.last())
  if (index < 1) {
    return notSetValue
  }

  const previousSiblingPath = keyPath.pop().push(index - 1)

  if (state.hasIn(previousSiblingPath)) {
    return previousSiblingPath
  }
  return notSetValue
}

export function firstChild(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )
  if (keyPath === notSetValue) {
    return notSetValue
  }
  const firstChildPath = keyPath.push(options.childNodesKey, 0)

  if (state.hasIn(firstChildPath)) {
    return firstChildPath
  }
  return notSetValue
}

export function lastChild(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  const childNodesPath = keyPath.push(options.childNodesKey)

  const maybeChildNodes = state.getIn(childNodesPath)
  if (maybeChildNodes && maybeChildNodes.size > 0) {
    return keyPath.push(maybeChildNodes.size - 1)
  }
  return notSetValue
}

export function siblings(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): QuerySet {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  const index = Number(keyPath.last())
  const parentChildNodesPath = keyPath.pop()
  const parentChildNodes = state.getIn(parentChildNodesPath)

  if (!parentChildNodes) {
    return notSetValue
  }
  return parentChildNodes.reduce(
    (result, _, i) =>
      i !== index
        ? result.push(parentChildNodesPath.push(i))
        : result,
    List()
  )
}

export function childNodes(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): QuerySet {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const childNodesPath = keyPath.push(options.childNodesKey)
  const maybeChildNodes = state.getIn(childNodesPath)

  if (!maybeChildNodes) {
    return notSetValue
  }

  return maybeChildNodes.reduce(
    (acc, _, i) => acc.push(childNodesPath.push(i)),
    List()
  )
}

export function childAt(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  index: number,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  const childPath = keyPath.push(options.childNodesKey, index)

  if (state.hasIn(childPath)) {
    return childPath
  }
  return notSetValue
}

export function descendants(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): QuerySet {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  const id = getId(options, state, keyPath, notSetValue)

  if (id === notSetValue) {
    return notSetValue
  }
  return filter(
    options,
    state,
    n => n.get(options.idKey) !== id,
    keyPath
  )
}

export function childIndex(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): number {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  return Number(keyPath.last()) || notSetValue
}

export function hasChildNodes(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
): boolean {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return false
  }

  const childNodesPath = keyPath.push(options.childNodesKey)
  const maybeChildNodes = state.getIn(childNodesPath)
  return Boolean(
    maybeChildNodes &&
      maybeChildNodes.size &&
      maybeChildNodes.size > 0
  )
}

export function numChildNodes(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): number {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const childNodesPath = keyPath.push(options.childNodesKey)

  const maybeChildNodes = state.getIn(childNodesPath)
  return (maybeChildNodes && maybeChildNodes.size) || 0
}

export function parent(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  if (keyPath && keyPath.size) {
    return keyPath.slice(0, -2)
  }
  return notSetValue
}

export function ancestors(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): QuerySet {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  return keyPath.reduceRight(
    (acc, _, i) =>
      (i - options.rootPath.size) % 2 === 0 &&
      i >= options.rootPath.size
        ? acc.push(keyPath.take(i))
        : acc,
    List()
  )
}

export function depth(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): number {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  return Math.floor(keyPath.skip(options.rootPath.size).size / 2)
}

export function position(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): number {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  const order: string = keyPath.reduceRight(
    (memo, value, index) =>
      index >= options.rootPath.size && index % 2 === 0
        ? value.toString() + memo
        : memo,
    ''
  )
  return Number('1.'.concat(order.toString()))
}

export function right(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const l = options.rootPath.size

  const firstChildPath = firstChild(options, state, keyPath)

  if (firstChildPath) {
    return firstChildPath
  }

  const nextSiblingPath = nextSibling(options, state, keyPath)

  if (nextSiblingPath) {
    return nextSiblingPath
  }

  let parentPath = parent(options, state, keyPath)
  let nextSiblingOfParent

  while (parentPath && parentPath.size >= l) {
    nextSiblingOfParent = nextSibling(options, state, parentPath)
    if (nextSiblingOfParent) {
      return nextSiblingOfParent
    }
    parentPath = parent(options, state, parentPath)
  }
  return notSetValue
}

export function left(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  const keyPath = findId(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  let lastChildPath = previousSibling(options, state, keyPath)

  while (lastChildPath) {
    if (!hasChildNodes(options, state, lastChildPath)) {
      return lastChildPath
    }
    lastChildPath = lastChild(options, state, lastChildPath)
  }
  const parentPath = parent(options, state, keyPath)

  if (parentPath && parentPath.size >= options.rootPath.size) {
    return parentPath
  }

  return notSetValue
}

export const firstDescendant = firstChild

export function lastDescendant(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: any
): KeyPath {
  let keyPath = lastChild(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  while (keyPath && hasChildNodes(options, state, keyPath)) {
    keyPath = lastChild(options, state, keyPath)
  }
  return keyPath
}
