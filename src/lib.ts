import {
  Options,
  State,
  Methods,
  Apply,
  AppliedMethods,
} from './types'
import { PreOrder } from './traversal/preorder'
import {
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
  firstDescendant,
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
  resolve,
  right,
  siblings,
} from './methods'

function bindMethods<T extends Methods, V>(methods: T, v: V) {
  return Object.keys(methods).reduce(
    (acc: Record<string, any>, methodName: string) => {
      return {
        ...acc,
        [methodName]: methods[methodName].bind(null, v),
      }
    },
    {}
  ) as AppliedMethods<T>
}

type Reducer<T extends Methods, R> = (api: T) => R

function withState<TMethods extends Methods, TResult>(
  methods: TMethods,
  state: State,
  reducer: Reducer<AppliedMethods<TMethods>, TResult>
) {
  return reducer(bindMethods(methods, state))
}

type API<T extends Methods> = AppliedMethods<T> & {
  withState: Apply<typeof withState>
}

export function APIFactory<T extends Methods>(
  options: Options,
  methods: T
): API<T> {
  const boundMethods = bindMethods(methods, options)
  const boundWithState = withState.bind(null, boundMethods)
  return {
    ...boundMethods,
    withState: boundWithState,
  }
}

export const defaultOptions: Options = {
  rootPath: [],
  childNodesPath: ['childNodes'],
  idPath: ['id'],
  traversalMethod: PreOrder,
}

export const defaultMethods = {
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
  firstDescendant,
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
  resolve,
  right,
  siblings,
}

export function TreeUtils(
  options: Partial<Options> = {}
): API<typeof defaultMethods> {
  return APIFactory({ ...defaultOptions, ...options }, defaultMethods)
}
