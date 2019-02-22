import { List } from 'immutable'
import { Options, API, State } from './types'
import { APIFactory } from './api'
import { PreOrder } from './traversal/preorder'
import {
  firstDescendant,
  ancestors,
  childAt,
  childIndex,
  childNodes,
  depth,
  descendants,
  filter,
  find,
  findId,
  firstChild,
  getId,
  hasChildNodes,
  lastChild,
  lastDescendant,
  left,
  nextSibling,
  nodes,
  numChildNodes,
  parent,
  position,
  previousSibling,
  reduceTree,
  right,
  siblings,
} from './methods'

export const defaultOptions: Options = {
  rootPath: List([]),
  childNodesKey: 'childNodes',
  idKey: 'id',
  traversalMethod: PreOrder,
}

export const defaultMethods = {
  firstDescendant,
  ancestors,
  childAt,
  childIndex,
  childNodes,
  depth,
  descendants,
  filter,
  find,
  findId,
  firstChild,
  getId,
  hasChildNodes,
  lastChild,
  lastDescendant,
  left,
  nextSibling,
  nodes,
  numChildNodes,
  parent,
  position,
  previousSibling,
  reduceTree,
  right,
  siblings,
}

export function TreeUtils(options: {
  [key: string]: any
}): API<(state: State, ...args: any[]) => any> {
  return APIFactory({
    options: { ...defaultOptions, ...options },
    methods: defaultMethods,
  }).create()
}
