import test = require('tape')
import { List, fromJS } from 'immutable'

import { TreeUtils } from '../src'
import { Node, KeyPath } from '../src/types'

test('Examples Introduction', assert => {
  const state = fromJS({
    id: '1',
    childNodes: [{ id: '2', childNodes: [{ id: '3' }] }, { id: '4' }],
  })

  const treeUtils = TreeUtils()
  const result = treeUtils
    .filter(state, (node: Node) => Number(node.get('id')) % 2 === 0)
    .map((keyPath: KeyPath) =>
      treeUtils.hasChildNodes(state, keyPath)
    )
    .every((v: boolean) => v)
  assert.assert(!result)

  assert.deepEqual(treeUtils.findId(state, '3').toJS(), [
    'childNodes',
    0,
    'childNodes',
    0,
  ])

  const tupleState = fromJS({
    data: ['1', [['2', [['3']]], ['4']]],
  })

  const customTreeUtils = TreeUtils({
    rootPath: List(['data']),
    idPath: List([0]),
    childNodesPath: List([1]),
  })

  const tupleKeyPath = customTreeUtils.findId(tupleState, '3')
  assert.deepEqual(tupleState.getIn(tupleKeyPath).toJS(), ['3'])
  assert.end()
})
