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

export function BFS(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  path: KeyPath = null
): void {
  const keyPath = path || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  const queue: Array<[Node, KeyPath]> = [[rootNode, keyPath]]
  visit(options, iterator, queue)
}

export function ReverseBFS(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  path: KeyPath = null
): void {
  const keyPath = path || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  const queue: Array<[Node, KeyPath]> = [[rootNode, keyPath]]
  visitReverse(options, iterator, queue)
}
