import { List, Map } from 'immutable'
import { Options, API, State, Method } from './types'
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

function bindMethods(
  methods: API<Function>,
  ...args: any[]
): API<Function> {
  return Map(methods).reduce(
    (acc: object, factory: Function, name: string) => ({
      ...acc,
      [name]: factory.bind(null, ...args),
    }),
    {}
  )
}

type Reducer<T> = (api: API<Function>) => T

function withState<T extends any>(
  methods: API<Function>,
  state: State,
  reducer: Reducer<T>
): T {
  return reducer(bindMethods(methods, state))
}

export function APIFactory(options: Options, methods: API<Method>) {
  const boundMethods = bindMethods(methods, options)
  const boundWithState = withState.bind(null, boundMethods)
  return {
    ...boundMethods,
    withState: boundWithState,
  }
}

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

export function TreeUtils(
  options: {
    [key: string]: any
  } = {},
  methods: API<Method> = {}
): API<Function> {
  return APIFactory(
    { ...defaultOptions, ...options },
    { ...defaultMethods, ...methods }
  )
}
