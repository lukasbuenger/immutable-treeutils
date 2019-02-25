import test = require('tape')
import { fromJS, List } from 'immutable'

import { TreeUtils, defaultMethods } from '../src'
import { API, Method } from '../src/types'

const state = fromJS({
  data: {
    _id: 'F',
    childNodes: [
      {
        _id: 'B',
        childNodes: [
          { _id: 'A' },
          { _id: 'D', childNodes: [{ _id: 'C' }, { _id: 'E' }] },
        ],
      },
      {
        _id: 'G',
        childNodes: [{ _id: 'I', childNodes: [{ _id: 'H' }] }],
      },
    ],
  },
})

const hasDefaultMethods = (api: API<Function>) =>
  Object.keys(defaultMethods).every(n => !!api[n])

test('function "TreeUtils"', assert => {
  const defaultApi = TreeUtils()

  assert.assert(
    hasDefaultMethods(defaultApi),
    'returns a default API.'
  )

  const customOptionsApi = TreeUtils({
    rootPath: List(['data']),
    idKey: '_id',
  })

  assert.deepEqual(
    customOptionsApi.findId(state, 'G').toJS(),
    ['data', 'childNodes', 1],
    'accepts custom options.'
  )

  const customMethod: Method = (opts, s, num) => {
    assert.equal(opts.idKey, 'id', 'custom methods receive opts.')
    assert.equal(state, s, 'custom methods receive state.')
    assert.equal(num, 8, 'custom methods receive rest args.')
    return 'I was called!'
  }

  const customMethodsApi = TreeUtils(
    {},
    {
      customMethod,
    }
  )

  assert.assert(
    customMethodsApi.customMethod,
    'custom methods get exposed on api.'
  )

  const result = customMethodsApi.customMethod(state, 8)
  assert.equal(
    result,
    'I was called!',
    'custom methods return accordingly.'
  )
  assert.end()
})

test('method "withState"', assert => {
  const customOptionsApi = TreeUtils({
    rootPath: List(['data']),
    idKey: '_id',
  })

  const result = customOptionsApi.withState(
    state,
    (api: API<Function>) => {
      assert.assert(
        hasDefaultMethods(api),
        'passes complete api to callback.'
      )
      return api.findId('D')
    }
  )

  assert.deepEqual(
    result.toJS(),
    ['data', 'childNodes', 0, 'childNodes', 1],
    'returns result of callback.'
  )

  assert.end()
})
