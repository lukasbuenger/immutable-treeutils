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
  const childNodesPath = keyPath.push(options.childNodesKey)
  const childNodes: List<any> = node.get(options.childNodesKey)

  let ret: boolean | void = iterator(node, keyPath)

  if (!childNodes || ret === false) {
    return ret
  }

  const numChildNodes: number = childNodes.size
  if (!numChildNodes) {
    return
  }

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
}

function visitReverse(
  options: BaseOptions,
  iterator: BaseIterator,
  node: Node,
  keyPath: KeyPath
): boolean | void {
  const childNodesPath = keyPath.push(options.childNodesKey)
  const childNodes: List<any> = node.get(options.childNodesKey)

  let ret: boolean | void = iterator(node, keyPath)

  if (!childNodes || ret === false) {
    return ret
  }

  const numChildNodes: number = childNodes.size
  if (!numChildNodes) {
    return
  }

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
}

export function PreOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath?: KeyPath
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = state.getIn(keyPath)
  visit(options, iterator, rootNode, keyPath)
}

export function ReversePreOrder(
  options: BaseOptions,
  state: State,
  iterator: BaseIterator,
  rootPath?: KeyPath
): void {
  const keyPath = rootPath || options.rootPath
  const rootNode = state.getIn(keyPath)
  visitReverse(options, iterator, rootNode, keyPath)
}
