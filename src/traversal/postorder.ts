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
  node: Node,
  keyPath: KeyPath
): boolean | void {
  const childNodesPath = keyPath.concat(options.childNodesPath)
  const childNodes: List<any> = node.getIn(options.childNodesPath)

  if (!childNodes) {
    return iterator(node, keyPath)
  }

  const numChildNodes: number = childNodes.size
  if (!numChildNodes) {
    return iterator(node, keyPath)
  }

  let ret: boolean | void
  for (let i: number = 0; i < numChildNodes; i++) {
    ret = visit(
      options,
      iterator,
      childNodes.get(i),
      childNodesPath.push(i)
    )
    if (ret === false) {
      return false
    }
  }
  return iterator(node, keyPath)
}

function visitReverse(
  options: BaseOptions,
  iterator: BaseIterator,
  node: Node,
  keyPath: KeyPath
): boolean | void {
  const childNodesPath = keyPath.concat(options.childNodesPath)
  const childNodes: List<any> = node.getIn(options.childNodesPath)

  if (!childNodes) {
    return iterator(node, keyPath)
  }

  const numChildNodes: number = childNodes.size
  if (!numChildNodes) {
    return iterator(node, keyPath)
  }

  let ret: boolean | void
  for (let i: number = numChildNodes - 1; i >= 0; i--) {
    ret = visitReverse(
      options,
      iterator,
      childNodes.get(i),
      childNodesPath.push(i)
    )
    if (ret === false) {
      return false
    }
  }
  return iterator(node, keyPath)
}

export function PostOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath: KeyPath = null
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = state.getIn(keyPath)
  visit(options, iterator, rootNode, keyPath)
}

export function ReversePostOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath: KeyPath = null
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = state.getIn(keyPath)
  visitReverse(options, iterator, rootNode, keyPath)
}
