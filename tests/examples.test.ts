import test from 'tape'

import { TreeUtils } from '../src'
import { Node, KeyPath } from './base'

test('Examples Introduction', assert => {
  const state = {
    id: '1',
    childNodes: [{ id: '2', childNodes: [{ id: '3' }] }, { id: '4' }],
  }

  const treeUtils = TreeUtils()
  const result = treeUtils
    .filter(state, (node: Node) => Number(node.id) % 2 === 0)
    .map((keyPath: KeyPath) =>
      treeUtils.hasChildNodes(state, keyPath)
    )
    .every((v: boolean) => v)

  assert.assert(!result)

  assert.deepEqual(treeUtils.findId(state, '3'), [
    'childNodes',
    0,
    'childNodes',
    0,
  ])

  const tupleState = {
    data: ['1', [['2', [['3']]], ['4']]],
  }

  const customTreeUtils = TreeUtils({
    rootPath: ['data'],
    idPath: [0],
    childNodesPath: [1],
  })

  const tupleKeyPath = customTreeUtils.findId(tupleState, '3')
  assert.assert(tupleKeyPath)
  assert.deepEqual(
    customTreeUtils.resolve(tupleState, tupleKeyPath as KeyPath),
    ['3']
  )
  assert.end()
})
