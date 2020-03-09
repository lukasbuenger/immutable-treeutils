import get from 'lodash/get'
import {
  BaseOptions,
  BaseIterator,
  State,
  Node,
  KeyPath,
} from '../types'

/**
 * @hidden
 *
 * This is the recursive function for the breadth-first algo.
 * It pushes and reads from a queue, which allows for deferring deeper nested roots.
 */
function visit(
  options: BaseOptions,
  iterator: BaseIterator,
  queue: Array<[Node, KeyPath]>
): boolean | void {
  while (queue.length > 0) {
    const [node, keyPath] = queue[0]
    const childNodesPath = keyPath.concat(options.childNodesPath)

    queue.shift()

    if (iterator(node, keyPath) === false) {
      return false
    }

    const childNodes: Array<any> = get(node, options.childNodesPath)
    if (!childNodes) {
      continue
    }

    const numChildNodes: number = childNodes.length
    if (!numChildNodes) {
      continue
    }

    for (let i = 0; i < numChildNodes; i++) {
      childNodesPath.push(i)
      queue.push([childNodes[i], childNodesPath.concat(i)])
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
  queue: Array<[Node, KeyPath]>
): boolean | void {
  while (queue.length > 0) {
    const [node, keyPath] = queue[0]
    const childNodesPath = keyPath.concat(options.childNodesPath)

    queue.shift()

    if (iterator(node, keyPath) === false) {
      return false
    }

    const childNodes: Array<any> = get(node, options.childNodesPath)
    if (!childNodes) {
      continue
    }

    const numChildNodes: number = childNodes.length
    if (!numChildNodes) {
      continue
    }

    for (let i: number = numChildNodes - 1; i >= 0; i--) {
      queue.push([childNodes[i], childNodesPath.concat(i)])
    }
  }
}
/**
 * Starts a single iteration over all nodes in the tree by using a breadth-first algorithm.
 */
export function BFS(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath?: KeyPath
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  const queue: Array<[Node, KeyPath]> = [[rootNode, keyPath]]
  visit(options, iterator, queue)
}

/**
 * Starts a single iteration over all nodes in the tree by using a reverse breadth-first algorithm.
 */
export function ReverseBFS(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath?: KeyPath
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  const queue: Array<[Node, KeyPath]> = [[rootNode, keyPath]]
  visitReverse(options, iterator, queue)
}
