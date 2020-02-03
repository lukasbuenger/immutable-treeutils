import { get, last } from 'lodash'
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
  let stopped = false
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
  return reduceTree(
    options,
    state,
    (acc, _, keyPath) => acc.concat(keyPath),
    [],
    path
  ) as QuerySet
}

export function find<T extends any>(
  options: Options,
  state: State,
  comparator: (v: Node, k: KeyPath) => boolean,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  return reduceTree(
    options,
    state,
    (acc, node, keyPath, stop) =>
      comparator(node, keyPath) === true ? stop(keyPath) : acc,
    notSetValue,
    path
  ) as KeyPath | T
}

export function filter(
  options: Options,
  state: State,
  comparator: (v: Node, k: KeyPath) => boolean,
  path?: KeyPath
): QuerySet {
  return reduceTree(
    options,
    state,
    (acc, node, keyPath) =>
      comparator(node, keyPath) === true
        ? acc.concat([keyPath])
        : acc,
    [],
    path
  ) as QuerySet
}

export function findId<T extends any>(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath,
  notSetValue?: T
): KeyPath | T {
  return Array.isArray(idOrKeyPath)
    ? idOrKeyPath
    : (reduceTree(
        options,
        state,
        (acc, node, keyPath, stop) =>
          get(node, options.idPath) === idOrKeyPath
            ? stop(keyPath)
            : acc,
        notSetValue,
        path
      ) as KeyPath | T)
}

export function getId<T extends any>(
  options: Options,
  state: State,
  keyPath: KeyPath,
  notSetValue?: T
): string | T {
  return get(state, keyPath.concat(options.idPath), notSetValue)
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
  const safeKeyPath = keyPath as KeyPath
  const index = Number(last(safeKeyPath))
  const nextSiblingPath = safeKeyPath.slice(0, -1).concat(index + 1)

  if (get(state, nextSiblingPath)) {
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
  const safeKeyPath = keyPath as KeyPath

  const index = Number(last(safeKeyPath))
  if (index < 1) {
    return notSetValue
  }

  const previousSiblingPath = safeKeyPath
    .slice(0, -1)
    .concat(index - 1)

  if (get(state, previousSiblingPath)) {
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
  const safeKeyPath = keyPath as KeyPath
  const firstChildPath = safeKeyPath.concat(options.childNodesPath, 0)

  if (get(state, firstChildPath)) {
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
  const safeKeyPath = keyPath as KeyPath
  const childNodesPath = safeKeyPath.concat(options.childNodesPath)

  const maybeChildNodes = get(state, childNodesPath)
  if (maybeChildNodes && maybeChildNodes.length > 0) {
    return childNodesPath.concat(maybeChildNodes.length - 1)
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

  const safeKeyPath = keyPath as KeyPath
  const index = Number(last(safeKeyPath))
  const parentChildNodesPath = safeKeyPath.slice(0, -1)
  const parentChildNodes = get(state, parentChildNodesPath)

  if (!parentChildNodes) {
    return notSetValue
  }
  return parentChildNodes.reduce(
    (result: Array<KeyPath>, _: any, i: number): Array<KeyPath> =>
      i !== index
        ? result.concat([parentChildNodesPath.concat(i)])
        : result,
    []
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
  const maybeChildNodes = get(state, childNodesPath)

  if (!maybeChildNodes) {
    return notSetValue
  }

  return maybeChildNodes.reduce(
    (acc: Array<KeyPath>, _: any, i: number): Array<KeyPath> =>
      acc.concat([childNodesPath.concat(i)]),
    []
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
  const safeKeyPath = keyPath as KeyPath
  const childPath = safeKeyPath.concat(options.childNodesPath, index)

  if (get(state, childPath)) {
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
  const safeKeyPath = keyPath as KeyPath
  const id = getId(options, state, safeKeyPath)

  if (!id) {
    return []
  }
  return filter(
    options,
    state,
    n => get(n, options.idPath) !== id,
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
  const safeKeyPath = keyPath as KeyPath
  return Number(last(safeKeyPath)) || notSetValue
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
  const maybeChildNodes = get(state, childNodesPath)
  return Boolean(
    maybeChildNodes &&
      maybeChildNodes.length &&
      maybeChildNodes.length > 0
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
  const safeKeyPath = keyPath as KeyPath
  const childNodesPath = safeKeyPath.concat(options.childNodesPath)

  const maybeChildNodes = get(state, childNodesPath)
  return (maybeChildNodes && maybeChildNodes.length) || notSetValue
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
  const safeKeyPath = keyPath as KeyPath
  const parentPath = safeKeyPath.slice(0, -2)
  if (parentPath.length >= options.rootPath.length) {
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
  const safeKeyPath = keyPath as KeyPath
  return safeKeyPath.reduceRight(
    (acc: QuerySet, _: any, i: number) =>
      (i - options.rootPath.length) % 2 === 0 &&
      i >= options.rootPath.length
        ? acc.concat([safeKeyPath.slice(0, i)])
        : acc,
    []
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
  const safeKeyPath = keyPath as KeyPath
  return Math.floor(
    safeKeyPath.slice(options.rootPath.length).length / 2
  )
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
  const safeKeyPath = keyPath as KeyPath
  const order = safeKeyPath.reduceRight(
    (acc: string, value: string | number, index) =>
      index >= options.rootPath.length && index % 2 === 0
        ? value.toString().concat(acc)
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
  const safeKeyPath = keyPath
  const l = options.rootPath.length

  const firstChildPath = firstChild<T>(options, state, safeKeyPath)

  if (firstChildPath) {
    return firstChildPath
  }

  const nextSiblingPath = nextSibling<T>(options, state, safeKeyPath)

  if (nextSiblingPath) {
    return nextSiblingPath
  }

  let parentPath = parent<T>(options, state, safeKeyPath) as KeyPath
  let nextSiblingOfParent: KeyPath

  while (parentPath && parentPath.length >= l) {
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
  const safeKeyPath = keyPath
  let lastChildPath = previousSibling(options, state, safeKeyPath)

  while (lastChildPath) {
    const safeLastChildPath = lastChildPath
    if (!hasChildNodes(options, state, safeLastChildPath)) {
      return safeLastChildPath
    }
    lastChildPath = lastChild(options, state, safeLastChildPath)
  }
  const parentPath = parent(options, state, safeKeyPath)

  if (parentPath && parentPath.length >= options.rootPath.length) {
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

  let safeKeyPath = keyPath

  while (safeKeyPath && hasChildNodes(options, state, safeKeyPath)) {
    safeKeyPath = lastChild<T>(options, state, safeKeyPath)
  }
  return keyPath
}
