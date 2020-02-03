import get from 'lodash/get'
import last from 'lodash/last'
import { Node, KeyPath, Options, State, QuerySet } from './base'

/**
 * Signature of the function passed to a [[TreeReducer]] to immediately abort a [[reduceTree]] procedure and return `T`.
 *
 * @typeparam T The type the stop function should abort with. Inferred.
 */
export type Stop<T> = (v: T) => T

export type TreeReducer<T> = (
  accumulator: T,
  node: Node,
  keyPath: KeyPath,
  stop: Stop<T>
) => T

/**
 * Resolve a [[KeyPath]] on a [[State]]. You can pass in a default value to handle nil cases.
 *
 * This is actually just an alias of [lodash.get](https://lodash.com/docs/4.17.15#get) which is bundled for convenience.
 *
 * @typeparam T The type the `resolve` method is expected to return. Inferred from `notSetValue` if given.
 */
export function resolve<T extends any>(
  options: Options,
  state: State,
  path: KeyPath,
  notSetValue?: T
): T {
  return get(state, path, notSetValue)
}

/**
 * This let's you walk over a tree and accumulate a value of any kind.
 *
 * It basically works like most reduction procedures in JavaScript, with two prominent exceptions:
 *
 * **Exception 1: Cancel further traversal**
 *
 * Your reducer function gets passed a [[Stop]] function to prevent further iterating over the tree and return immediately.
 * If you give said [[Stop]] function an argument, it will get returned as result of the reduction.
 *
 * For examples for both procedure types (full traversal and early abortion), check out the source of the [[find]] and [[filter]] methods respectively.
 *
 * **Exception 2: The initial value**
 * The way I use
 * It might be counter-intuitive for many and even tool-breaking for others (I'm thinking of people using [ESLint's `no-undefinded` rule](https://eslint.org/docs/rules/no-undefined)),
 * but as of now, I don't see a better way of typing [reduceTree]
 *
 * @typeparam T A type which should describe a union of all types your reduction is possibly going to accept *and* return.
 * Inferred from `initial` if `T` is not explicitly provided. If you're not sure that your reduction is going to be invariant
 * (e.g. is *always* going to be an array, a boolean), it is recommended to explicitly cast the union of possibilities and give a fitting `initial` parameter.
 * ```typescript
 * const goat = reduceTree<string | undefined>(
 *  opts,
 *  state,
 *  (acc, node, keyPath) => {
 *    return n.name === 'Tariq Trotter  '
 *      ? stop(keyPath)
 *      : acc
 *  },.
 *  undefined
 * )
 */
export function reduceTree<T>(
  options: Options,
  state: State,
  reducer: TreeReducer<T>,
  initial: T,
  path?: KeyPath
): T {
  let reduction = initial
  let stopped = false
  const stop: Stop<T> = value => {
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

/**
 * Returns a [[QuerySet]] containing paths to all nodes in the tree.
 *
 * **Please note:** If you aim to maintain larger data sets with this library, you should use this with care as it is the most expensive of all operations.
 */
export function nodes(
  options: Options,
  state: State,
  path?: KeyPath
): QuerySet {
  return reduceTree<QuerySet>(
    options,
    state,
    (acc, _, keyPath) => acc.concat([keyPath]),
    [],
    path
  )
}

/**
 * Returns the [[KeyPath]] to the first node for which `compatator` evaluates to `true`.
 * Returns `undefined` if nothing is found.
 */
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

/**
 * Returns a [[QuerySet]] of paths pointing at the nodes for which `comparator` returned true
 */
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

/**
 * Main method to find a single node based on the lookup parameter `idOrKeyPath`.
 * * If you pass it a string, it will perform a tree lookup to find the [[KeyPath]] to the node with an equal id.
 * * If you pass it a [[KeyPath]], it simply returns it.
 *
 * All of the methods in this library, that depend on a single node lookup (examples: [[siblings]], [[parent]]) normalize
 * their input with [[findId]]. This allows for chaining results and reducing lookups, where we already have a [[KeyPath]] cursor.
 *
 * Also, an `id` in this context is not necessarily an actual `id` property that is/has to be present on all your nodes. It rather is a configurable identifier field.
 * Check out the [[Options]] referenece for more information about identifiers in TreeUtils.
 */
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

/**
 * Resolves and returns the identifier value for the node at `keyPath`.
 * Check out the [[Options]] reference to see and change, which field or property on a node actually serves as unique identifier.
 */
export function getId(
  options: Options,
  state: State,
  keyPath: KeyPath
): string | undefined {
  return get(state, keyPath.concat(options.idPath))
}

/**
 * Returns the [[KeyPath]] to the next sibling of `idOrKeyPath` or `undefined` if there is none.
 */
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

/**
 * Returns the [[KeyPath]] to the previous sibling of `idOrKeyPath` or `undefined` if there is none.
 */
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

/**
 * Returns the [[KeyPath]] to the first child of `idOrKeyPath` or `undefined` if there are no children.
 */
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

/**
 * Returns the [[KeyPath]] to the last child of `idOrKeyPath` or `undefined` if there are no children.
 */
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

/**
 * Returns a [[QuerySet]] containing all sibling [[KeyPath]]s of `idOrKeyPath`.
 *
 * The resulting [[QuerySet]] is empty if
 * * `idOrKeyPath` doesn't exist.
 * * the node has no siblings.
 */
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

/**
 * Returns a [[QuerySet]] containing all sibling [[KeyPath]]s of `idOrKeyPath`.
 *
 * The resulting [[QuerySet]] is empty if
 * * `idOrKeyPath` doesn't exist.
 * * the node has no children.
 */
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

/**
 * Returns the [[KeyPath]] to the child node of `idOrKeyPath` at `index`.
 * Returns `undefined` if there is no child node at `index`
 */
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

/**
 * Returns a [[QuerySet]] with paths to all descendant nodes of `idOrKeyPath`.
 * Doesn`t include the path of `idOrKeyPath` itself.
 */
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

/**
 * If the node for `idOrKeyPath` has a parent, this returns the numerical index of it in the upper child nodes list.
 * If the node has no parent (it's the root node) or doesn't exist, this function returns `-1`.
 */
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

/**
 * Checks both whether the node for `idOrKeyPath` has a child nodes property and whether the latter contains any children.
 */
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

/**
 * Returns the number of children of the node at `idOrKeyPath`.
 * Returns `-1` if `idOrKeyPath` either doesn't exist or doesn't have a child nodes property.
 */
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

/**
 * Returns the [[KeyPath]] to the parent node of `idOrKeyPath`.
 */
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

  const parentPath: KeyPath = keyPath.slice(
    0,
    -1 * (options.childNodesPath.length + 1)
  )
  if (parentPath.length >= options.rootPath.length) {
    return parentPath
  }
}

/**
 * Returns a [[QuerySet]] with paths to all ancestors of `idOrKeyPath`.
 * The order of the result is from the closest ancestor to the top-most one, which is always the root.
 *
 * **Please note:** The resulting [[QuerySet]] will always include all ancestors until the root path defined in the passed [[Options]] object.
 * The optional `path` argument will merely narrow down the traversed nodes when checking for `idOrKeyPath`.
 */
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
  const numKeysPerLevel = options.childNodesPath.length + 1
  return keyPath.reduceRight(
    (acc: QuerySet, _: any, i: number) =>
      (i - options.rootPath.length) % numKeysPerLevel === 0 &&
      i >= options.rootPath.length
        ? acc.concat([keyPath.slice(0, i)])
        : acc,
    []
  )
}

/**
 * Returns the numerical depth of `idOrKeyPath` starting from `0` for the root node.
 * Returns `-1` if `idOrKeyPath` doesn't exist.
 *
 * **Please note:** The depth is always calculated against the root path defined in the passed [[Options]] object.
 * The optional `path` argument will merely narrow down the traversed nodes when checking for `idOrKeyPath`.
 */
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
  const numKeysPerLevel = options.childNodesPath.length + 1

  return Math.floor(
    keyPath.slice(options.rootPath.length).length / numKeysPerLevel
  )
}

/**
 * Compare results of this to determine whether a node comes «before» or «after» another one.
 * Technically returns a numerical representation of a [[PreOrder]] result.
 */
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
  const pathLength = options.childNodesPath.length
  return keyPath
    .slice(options.rootPath.length)
    .reduce((acc: number, value: string | number, index) => {
      if (index % (pathLength + 1) === pathLength) {
        return acc * 10 + Number(value) + 1
      }
      return acc
    }, 0)
}

/**
 * Returns the [[KeyPath]] to the next node to the «right» of `idOrKeyPath`. Or think walking *down* the edges of your tree.
 *
 * Technically, the next «right» node is either (in order of priority):
 * * the first child node.
 * * the next sibling.
 * * the next sibling of the first ancestor that in fact has a next sibling.
 *
 * Returns `undefined` if called on the most «right» node, the [[lastDescendant]] of a tree.
 *
 * **Please note:** The edges of a tree are always assumed from the root path defined in the passed [[Options]] object.
 * The optional `path` argument will merely narrow down the traversed nodes when checking for `idOrKeyPath`.
 */
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

/**
 * Returns the [[KeyPath]] to the next node to the «left» of `idOrKeyPath`. Or think walking *up* the edges of your tree.
 *
 * Technically, the next «left» node is either (in order of priority):
 * * The last descendant of the previous sibling node.
 * * The previous sibling node.
 * * The parent node.
 *
 * Returns `undefined` if called on the most «left» node, the root node of a tree.
 *
 * **Please note:** The edges of a tree are always assumed from the root path defined in the passed [[Options]] object.
 * The optional `path` argument will merely narrow down the traversed nodes when checking for `idOrKeyPath`.
 */
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

/**
 * Returns the last (deepest, highest child index) descendant of `idOrKeyPath`.
 */
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
