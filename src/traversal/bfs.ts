import { List } from 'immutable'
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
  queue: List<[Node, KeyPath]>
): boolean | void {
  while (queue.size > 0) {
    const [node, keyPath] = queue.first()
    const childNodesPath = keyPath.concat(options.childNodesPath)

    queue = queue.shift()

    if (iterator(node, keyPath) === false) {
      return false
    }

    const childNodes: List<any> = node.getIn(options.childNodesPath)
    if (!childNodes) {
      continue
    }

    const numChildNodes: number = childNodes.size
    if (!numChildNodes) {
      continue
    }

    for (let i: number = 0; i < numChildNodes; i++) {
      queue = queue.push([childNodes.get(i), childNodesPath.push(i)])
    }
  }
}

function visitReverse(
  options: BaseOptions,
  iterator: BaseIterator,
  queue: List<[Node, KeyPath]>
): boolean | void {
  while (queue.size > 0) {
    const [node, keyPath] = queue.first()
    const childNodesPath = keyPath.concat(options.childNodesPath)
    queue = queue.shift()

    if (iterator(node, keyPath) === false) {
      return false
    }

    const childNodes: List<any> = node.getIn(options.childNodesPath)
    if (!childNodes) {
      continue
    }

    const numChildNodes: number = childNodes.size
    if (!numChildNodes) {
      continue
    }

    for (let i: number = numChildNodes - 1; i >= 0; i--) {
      queue = queue.push([childNodes.get(i), childNodesPath.push(i)])
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
  const queue: List<[Node, KeyPath]> = List().push([
    state.getIn(keyPath),
    keyPath,
  ])
  visit(options, iterator, queue)
}

export function ReverseBFS(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  path: KeyPath = null
): void {
  const keyPath = path || options.rootPath
  const queue: List<[Node, KeyPath]> = List().push([
    state.getIn(keyPath),
    keyPath,
  ])
  visitReverse(options, iterator, queue)
}
