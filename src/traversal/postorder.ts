import { get } from 'lodash'
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

  if (!childNodes) {
    return iterator(node, keyPath)
  }

  const numChildNodes: number = childNodes.length
  if (!numChildNodes) {
    return iterator(node, keyPath)
  }

  let ret: boolean | void
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
  return iterator(node, keyPath)
}

function visitReverse(
  options: BaseOptions,
  iterator: BaseIterator,
  node: Node,
  keyPath: KeyPath
): boolean | void {
  const childNodesPath = keyPath.concat(options.childNodesPath)
  const childNodes: [] = get(node, options.childNodesPath)

  if (!childNodes) {
    return iterator(node, keyPath)
  }

  const numChildNodes: number = childNodes.length
  if (!numChildNodes) {
    return iterator(node, keyPath)
  }

  let ret: boolean | void
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
  return iterator(node, keyPath)
}

export function PostOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath: KeyPath = null
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  visit(options, iterator, rootNode, keyPath)
}

export function ReversePostOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath: KeyPath = null
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = keyPath.length > 0 ? get(state, keyPath) : state
  visitReverse(options, iterator, rootNode, keyPath)
}
