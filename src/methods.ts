import get from 'lodash/get'
import last from 'lodash/last'
import { Node, KeyPath, Options, State, QuerySet } from './types'

type Stop = (v: any) => any

type Reducer<T> = (
  accumulator: T,
  node: Node,
  keyPath: KeyPath,
  stop: Stop
) => T

export function resolve<T extends any>(
  options: Options,
  state: State,
  path: KeyPath,
  notSetValue?: T
): T {
  return get(state, path, notSetValue)
}

export function reduceTree<T>(
  options: Options,
  state: State,
  reducer: Reducer<T>,
  initial: T,
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
) {
  return reduceTree<QuerySet>(
    options,
    state,
    (acc, _, keyPath) => acc.concat(keyPath),
    [],
    path
  )
}

export function find(
  options: Options,
  state: State,
  comparator: (v: Node, k: KeyPath) => boolean,
  path?: KeyPath
) {
  return reduceTree<KeyPath | undefined>(
    options,
    state,
    (acc, node, keyPath, stop) =>
      comparator(node, keyPath) === true ? stop(keyPath) : acc,
    undefined,
    path
  )
}

export function filter(
  options: Options,
  state: State,
  comparator: (v: Node, k: KeyPath) => boolean,
  path?: KeyPath
) {
  return reduceTree<QuerySet>(
    options,
    state,
    (acc, node, keyPath) =>
      comparator(node, keyPath) === true
        ? acc.concat([keyPath])
        : acc,
    [],
    path
  )
}

export function findId(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
) {
  return Array.isArray(idOrKeyPath)
    ? (idOrKeyPath as KeyPath)
    : reduceTree<KeyPath | undefined>(
        options,
        state,
        (acc, node, keyPath, stop) =>
          get(node, options.idPath) === idOrKeyPath
            ? stop(keyPath)
            : acc,
        undefined,
        path
      )
}

export function getId(
  options: Options,
  state: State,
  keyPath: KeyPath
): string | undefined {
  return get(state, keyPath.concat(options.idPath))
}

export function nextSibling(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
) {
  const keyPath = findId(options, state, idOrKeyPath, path)
  if (!keyPath) {
    return
  }
  const index = Number(last(keyPath))
  const nextSiblingPath = keyPath.slice(0, -1).concat(index + 1)
  if (get(state, nextSiblingPath)) {
    return nextSiblingPath
  }
}

export function previousSibling(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
) {
  const keyPath = findId(options, state, idOrKeyPath, path)
  if (!keyPath) {
    return
  }
  const index = Number(last(keyPath))
  if (index < 1) {
    return
  }
  const previousSiblingPath = keyPath.slice(0, -1).concat(index - 1)

  if (get(state, previousSiblingPath)) {
    return previousSiblingPath
  }
}

export function firstChild(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
) {
  const keyPath = findId(options, state, idOrKeyPath, path)
  if (!keyPath) {
    return
  }
  const firstChildPath: KeyPath = keyPath.concat(
    options.childNodesPath,
    0
  )

  if (get(state, firstChildPath)) {
    return firstChildPath
  }
}

export function lastChild(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
) {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return
  }
  const childNodesPath = keyPath.concat(options.childNodesPath)

  const maybeChildNodes = get(state, childNodesPath)
  if (maybeChildNodes && maybeChildNodes.length > 0) {
    return childNodesPath.concat(
      maybeChildNodes.length - 1
    ) as KeyPath
  }
}

export function siblings(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
): QuerySet {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return []
  }

  const safeKeyPath = keyPath as KeyPath
  const index = Number(last(safeKeyPath))
  const parentChildNodesPath = safeKeyPath.slice(0, -1)
  const parentChildNodes = get(state, parentChildNodesPath)

  if (!parentChildNodes) {
    return []
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
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return []
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

export function childAt(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  index: number,
  path?: KeyPath
) {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return
  }

  const childPath: KeyPath = keyPath.concat(
    options.childNodesPath,
    index
  )

  if (get(state, childPath)) {
    return childPath
  }
}

export function descendants(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
): QuerySet {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return []
  }
  const id = getId(options, state, keyPath)

  if (!id) {
    return []
  }
  return filter(
    options,
    state,
    n => get(n, options.idPath) !== id,
    keyPath
  )
}

export function childIndex(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
): number {
  const keyPath = findId(options, state, idOrKeyPath, path)
  if (!keyPath) {
    return -1
  }
  const index = Number(last(keyPath))
  return !isNaN(index) ? index : -1
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

  const childNodesPath = keyPath.concat(options.childNodesPath)
  const maybeChildNodes = get(state, childNodesPath)
  return Boolean(
    maybeChildNodes &&
      maybeChildNodes.length &&
      maybeChildNodes.length > 0
  )
}

export function numChildNodes(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
): number {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return -1
  }
  const childNodesPath = keyPath.concat(options.childNodesPath)

  const maybeChildNodes = get(state, childNodesPath)
  return maybeChildNodes ? maybeChildNodes.length : -1
}

export function parent(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
) {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return
  }

  const parentPath: KeyPath = keyPath.slice(0, -2)
  if (parentPath.length >= options.rootPath.length) {
    return parentPath
  }
}

export function ancestors(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
): QuerySet {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return []
  }
  return keyPath.reduceRight(
    (acc: QuerySet, _: any, i: number) =>
      (i - options.rootPath.length) % 2 === 0 &&
      i >= options.rootPath.length
        ? acc.concat([keyPath.slice(0, i)])
        : acc,
    []
  )
}

export function depth(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
): number {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return -1
  }
  return Math.floor(keyPath.slice(options.rootPath.length).length / 2)
}

export function position(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
): number {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return -1
  }
  const order = keyPath.reduceRight(
    (acc: string, value: string | number, index) =>
      index >= options.rootPath.length && index % 2 === 0
        ? value.toString().concat(acc)
        : acc,
    ''
  )
  return Number('1.'.concat(order.toString()))
}

export function right(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
) {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return
  }
  const l = options.rootPath.length

  const firstChildPath = firstChild(options, state, keyPath)

  if (firstChildPath) {
    return firstChildPath
  }

  const nextSiblingPath: KeyPath | undefined = nextSibling(
    options,
    state,
    keyPath
  )

  if (nextSiblingPath) {
    return nextSiblingPath
  }

  let parentPath: KeyPath | undefined = parent(
    options,
    state,
    keyPath
  )
  let nextSiblingOfParent: KeyPath | undefined

  while (parentPath && parentPath.length >= l) {
    nextSiblingOfParent = nextSibling(options, state, parentPath)
    if (nextSiblingOfParent) {
      return nextSiblingOfParent
    }
    parentPath = parent(options, state, parentPath)
  }
}

export function left(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
) {
  const keyPath = findId(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return
  }
  let lastChildPath = previousSibling(options, state, keyPath)

  while (lastChildPath) {
    const safeLastChildPath = lastChildPath
    if (!hasChildNodes(options, state, safeLastChildPath)) {
      return safeLastChildPath
    }
    lastChildPath = lastChild(options, state, safeLastChildPath)
  }
  const parentPath = parent(options, state, keyPath)

  if (parentPath && parentPath.length >= options.rootPath.length) {
    return parentPath
  }
}

export const firstDescendant = firstChild

export function lastDescendant(
  options: Options,
  state: State,
  idOrKeyPath: string | KeyPath,
  path?: KeyPath
) {
  const keyPath = lastChild(options, state, idOrKeyPath, path)

  if (!keyPath) {
    return
  }

  let currentPath: KeyPath | undefined = keyPath

  while (currentPath && hasChildNodes(options, state, currentPath)) {
    currentPath = lastChild(options, state, currentPath)
  }
  return currentPath
}
