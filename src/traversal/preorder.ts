/**
 * This is the doc comment for file1.ts
 * @packageDocumentation
 */
import get from 'lodash/get'
import {
  BaseOptions,
  BaseIterator,
  State,
  Node,
  KeyPath,
} from '../types'

function visit(
  options: BaseOptions,
  iterator: BaseIterator,
  node: Node,
  keyPath: KeyPath
): boolean | void {
  const childNodesPath = keyPath.concat(options.childNodesPath)
  const childNodes: [] = get(node, options.childNodesPath)

  let ret: boolean | void = iterator(node, keyPath)

  if (!childNodes || ret === false) {
    return ret
  }

  const numChildNodes: number = childNodes.length
  if (!numChildNodes) {
    return
  }

  for (let i = 0; i < numChildNodes; i++) {
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

function visitReverse(
  options: BaseOptions,
  iterator: BaseIterator,
  node: Node,
  keyPath: KeyPath
): boolean | void {
  const childNodesPath = keyPath.concat(options.childNodesPath)
  const childNodes: [] = get(node, options.childNodesPath)

  let ret: boolean | void = iterator(node, keyPath)

  if (!childNodes || ret === false) {
    return ret
  }

  const numChildNodes: number = childNodes.length
  if (!numChildNodes) {
    return
  }

  for (let i: number = numChildNodes - 1; i >= 0; i--) {
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
 * Iterates over a given tree using a [Pre-Order algorithm](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order_(NLR)).
 *
 * @param iterator
 * @param rootPath
 */
export function PreOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath?: KeyPath
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  visit(options, iterator, rootNode, keyPath)
}

export function ReversePreOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath?: KeyPath
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  visitReverse(options, iterator, rootNode, keyPath)
}
