import { Map } from 'immutable'
import { API, Options, Method, State } from './types'

function bindMethods(
  methods: Map<string, Method>,
  ...args: any[]
): any {
  return methods.reduce(
    (acc: object, factory: Function, name: string) => ({
      ...acc,
      [name]: factory.bind(null, ...args),
    }),
    {}
  )
}

type Reducer<T> = (api: API<Function>) => T

export function APIFactory({
  options,
  methods,
}: {
  options: Options
  methods: { [k: string]: Method }
}) {
  return {
    create(): API<(state: State, ...args: any[]) => any> {
      return bindMethods(Map(methods), options)
    },
    withState<T extends any>(state: State, reducer: Reducer<T>): T {
      return reducer(bindMethods(Map(methods), options, state))
    },
  }
}
