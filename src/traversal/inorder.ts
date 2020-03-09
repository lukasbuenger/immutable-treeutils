import get from 'lodash/get'
import {
  BaseOptions,
  BaseIterator,
  State,
  TreeNode,
  KeyPath,
} from '../types'

/**
 * @hidden
 *
 * This is the recursive function for the in-order algo.
 */
function visit(
  options: BaseOptions,
  iterator: BaseIterator,
  node: TreeNode,
  keyPath: KeyPath
): boolean | void {
  const childNodesPath = keyPath.concat(options.childNodesPath)

  const childNodes: [] = get(node, options.childNodesPath)
  if (!childNodes) {
    return iterator(node, keyPath)
  }

  const numChildNodes = childNodes.length
  if (!numChildNodes) {
    return iterator(node, keyPath)
  }

  const edge: number = Math.ceil(numChildNodes / 2)

  let ret: boolean | void
  for (let i = 0; i < edge; i++) {
    ret = visit(
      options,
      iterator,
      childNodes[i],
      childNodesPath.concat(i)
    )
    if (ret === false) {
      return false
    }
  }
  ret = iterator(node, keyPath)
  if (ret === false) {
    return false
  }

  if (numChildNodes < 2) {
    return
  }

  for (let i: number = edge; i < numChildNodes; i++) {
    ret = visit(
      options,
      iterator,
      childNodes[i],
      childNodesPath.concat(i)
    )
    if (ret === false) {
      return false
    }
  }
}

/**
 * @hidden
 *
 * This is the reverse version of [[visit]] in this same file.
 */
function visitReverse(
  options: BaseOptions,
  iterator: BaseIterator,
  node: TreeNode,
  keyPath: KeyPath
): boolean | void {
  const childNodesPath = keyPath.concat(options.childNodesPath)

  const childNodes: [] = get(node, options.childNodesPath)
  if (!childNodes) {
    return iterator(node, keyPath)
  }

  const numChildNodes = childNodes.length
  if (!numChildNodes) {
    return iterator(node, keyPath)
  }

  const edge: number = Math.floor(numChildNodes / 2)

  let ret: boolean | void
  for (let i: number = numChildNodes - 1; i >= edge; i--) {
    ret = visitReverse(
      options,
      iterator,
      childNodes[i],
      childNodesPath.concat(i)
    )
    if (ret === false) {
      return false
    }
  }
  ret = iterator(node, keyPath)
  if (ret === false) {
    return false
  }

  if (numChildNodes < 2) {
    return
  }

  for (let i: number = edge - 1; i >= 0; i--) {
    ret = visitReverse(
      options,
      iterator,
      childNodes[i],
      childNodesPath.concat(i)
    )
    if (ret === false) {
      return false
    }
  }
}

/**
 * Starts a single iteration over all nodes in the tree by using a in-order algorithm.
 */
export function InOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath?: KeyPath
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  visit(options, iterator, rootNode, keyPath)
}

/**
 * Starts a single iteration over all nodes in the tree by using a reverse in-order algorithm.
 */
export function ReverseInOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath?: KeyPath
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  visitReverse(options, iterator, rootNode, keyPath)
}
