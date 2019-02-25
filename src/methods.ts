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

export function find<T extends any>(
  options: Options,
  state: State,
  comparator: (v: Node, k: KeyPath) => boolean,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  return <KeyPath | T>(
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

export function findId<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  return List.isList(idOrKeyPath)
    ? idOrKeyPath
    : <KeyPath | T>(
        reduceTree(
          options,
          state,
          (acc, node, keyPath, stop) =>
            node.getIn(options.idPath) === idOrKeyPath
              ? stop(keyPath)
              : acc,
          notSetValue,
          path
        )
      )
}

export function getId<T extends any>(
  options: Options,
  state: State,
  keyPath: KeyPath,
  notSetValue?: T
): string | T {
  return state.getIn(keyPath.concat(options.idPath), notSetValue)
}

export function nextSibling<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  const keyPath = findId<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )
  if (keyPath === notSetValue) {
    return notSetValue
  }
  const safeKeyPath = <KeyPath>keyPath
  const index = Number(safeKeyPath.last())
  const nextSiblingPath = safeKeyPath.pop().push(index + 1)

  if (state.hasIn(nextSiblingPath)) {
    return nextSiblingPath
  }

  return notSetValue
}

export function previousSibling<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  const keyPath = findId<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )
  if (keyPath === notSetValue) {
    return notSetValue
  }
  const safeKeyPath = <KeyPath>keyPath
  const index = Number(safeKeyPath.last())
  if (index < 1) {
    return notSetValue
  }

  const previousSiblingPath = safeKeyPath.pop().push(index - 1)

  if (state.hasIn(previousSiblingPath)) {
    return previousSiblingPath
  }
  return notSetValue
}

export function firstChild<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
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
  const safeKeyPath = <KeyPath>keyPath
  const firstChildPath = safeKeyPath.concat(options.childNodesPath, 0)

  if (state.hasIn(firstChildPath)) {
    return firstChildPath
  }
  return notSetValue
}

export function lastChild<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
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
  const safeKeyPath = <KeyPath>keyPath
  const childNodesPath = safeKeyPath.concat(options.childNodesPath)

  const maybeChildNodes = state.getIn(childNodesPath)
  if (maybeChildNodes && maybeChildNodes.size > 0) {
    return childNodesPath.push(maybeChildNodes.size - 1)
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
    (result: List<KeyPath>, _: any, i: number): List<KeyPath> =>
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
  const childNodesPath = keyPath.concat(options.childNodesPath)
  const maybeChildNodes = state.getIn(childNodesPath)

  if (!maybeChildNodes) {
    return notSetValue
  }

  return maybeChildNodes.reduce(
    (acc: List<KeyPath>, _: any, i: number): List<KeyPath> =>
      acc.push(childNodesPath.push(i)),
    List()
  )
}

export function childAt<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  index: number,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
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
  const safeKeyPath = <KeyPath>keyPath
  const childPath = safeKeyPath.concat(options.childNodesPath, index)

  if (state.hasIn(childPath)) {
    return childPath
  }
  return notSetValue
}

export function descendants<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): QuerySet | T {
  const keyPath = findId<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const safeKeyPath = <KeyPath>keyPath
  const id = getId(options, state, safeKeyPath)

  if (!id) {
    return List()
  }
  return filter(
    options,
    state,
    n => n.getIn(options.idPath) !== id,
    safeKeyPath
  )
}

export function childIndex<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): number | T {
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
  const safeKeyPath = <KeyPath>keyPath
  return Number(safeKeyPath.last()) || notSetValue
}

export function hasChildNodes(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
): boolean {
  const keyPath = findId<undefined>(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return false
  }

  const childNodesPath = keyPath.concat(options.childNodesPath)
  const maybeChildNodes = state.getIn(childNodesPath)
  return Boolean(
    maybeChildNodes &&
      maybeChildNodes.size &&
      maybeChildNodes.size > 0
  )
}

export function numChildNodes<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): number | T {
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
  const safeKeyPath = <KeyPath>keyPath
  const childNodesPath = safeKeyPath.concat(options.childNodesPath)

  const maybeChildNodes = state.getIn(childNodesPath)
  return (maybeChildNodes && maybeChildNodes.size) || notSetValue
}

export function parent<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  const keyPath = findId<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const safeKeyPath = <KeyPath>keyPath
  const parentPath = safeKeyPath.slice(0, -2)
  if (parentPath.size >= options.rootPath.size) {
    return parentPath
  }
  return notSetValue
}

export function ancestors<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): QuerySet | T {
  const keyPath = findId<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const safeKeyPath = <KeyPath>keyPath
  return safeKeyPath.reduceRight(
    (acc: QuerySet, _: any, i: number) =>
      (i - options.rootPath.size) % 2 === 0 &&
      i >= options.rootPath.size
        ? acc.push(safeKeyPath.take(i))
        : acc,
    List()
  )
}

export function depth<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): number | T {
  const keyPath = findId<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const safeKeyPath = <KeyPath>keyPath
  return Math.floor(safeKeyPath.skip(options.rootPath.size).size / 2)
}

export function position<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): number | T {
  const keyPath = findId<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const safeKeyPath = <KeyPath>keyPath
  const order: string = safeKeyPath.reduceRight(
    (acc: string, value: string | number, index: number) =>
      index >= options.rootPath.size && index % 2 === 0
        ? value.toString() + acc
        : acc,
    ''
  )
  return Number('1.'.concat(order.toString()))
}

export function right<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  const keyPath = findId<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const safeKeyPath = <KeyPath>keyPath
  const l = options.rootPath.size

  const firstChildPath = firstChild<T>(options, state, safeKeyPath)

  if (firstChildPath) {
    return firstChildPath
  }

  const nextSiblingPath = nextSibling<T>(options, state, safeKeyPath)

  if (nextSiblingPath) {
    return nextSiblingPath
  }

  let parentPath = <KeyPath>parent<T>(options, state, safeKeyPath)
  let nextSiblingOfParent: KeyPath

  while (parentPath && parentPath.size >= l) {
    nextSiblingOfParent = nextSibling(options, state, parentPath)
    if (nextSiblingOfParent) {
      return nextSiblingOfParent
    }
    parentPath = parent(options, state, parentPath)
  }
  return notSetValue
}

export function left<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  const keyPath = findId<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }
  const safeKeyPath = <KeyPath>keyPath
  let lastChildPath = previousSibling(options, state, safeKeyPath)

  while (lastChildPath) {
    const safeLastChildPath = <KeyPath>lastChildPath
    if (!hasChildNodes(options, state, safeLastChildPath)) {
      return safeLastChildPath
    }
    lastChildPath = lastChild(options, state, safeLastChildPath)
  }
  const parentPath = <KeyPath>parent(options, state, safeKeyPath)

  if (parentPath && parentPath.size >= options.rootPath.size) {
    return parentPath
  }

  return notSetValue
}

export const firstDescendant = firstChild

export function lastDescendant<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  const keyPath = lastChild<T>(
    options,
    state,
    idOrKeyPath,
    path,
    notSetValue
  )

  if (keyPath === notSetValue) {
    return notSetValue
  }

  let safeKeyPath = <KeyPath>keyPath

  while (safeKeyPath && hasChildNodes(options, state, safeKeyPath)) {
    safeKeyPath = <KeyPath>lastChild<T>(options, state, safeKeyPath)
  }
  return keyPath
}
