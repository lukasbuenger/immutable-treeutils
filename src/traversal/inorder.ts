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
