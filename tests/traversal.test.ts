import test = require('tape')
import { fromJS, List } from 'immutable'

import {
  PreOrder,
  ReversePreOrder,
  PostOrder,
  ReversePostOrder,
  InOrder,
  ReverseInOrder,
  BFS,
  ReverseBFS,
} from '../src'

const options = {
  rootPath: List(),
  idPath: List(['id']),
  childNodesPath: List(['childNodes']),
}

const state = fromJS({
  id: 'F',
  childNodes: [
    {
      id: 'B',
      childNodes: [
        { id: 'A' },
        { id: 'D', childNodes: [{ id: 'C' }, { id: 'E' }] },
      ],
    },
    {
      id: 'G',
      childNodes: [{ id: 'I', childNodes: [{ id: 'H' }] }],
    },
  ],
})

test('traversal "Preorder', assert => {
  let result = []

  PreOrder(options, state, n => {
    result.push(n.get('id'))
  })

  assert.deepEqual(
    result,
    ['F', 'B', 'A', 'D', 'C', 'E', 'G', 'I', 'H'],
    'Walks nodes in correctly in  pre-order'
  )

  assert.end()
})

test('traversal "ReversePreorder', assert => {
  let result = []

  ReversePreOrder(options, state, n => {
    result.push(n.get('id'))
  })

  assert.deepEqual(
    result,
    ['F', 'G', 'I', 'H', 'B', 'D', 'E', 'C', 'A'],
    'Walks nodes in correctly in  reverse pre-order'
  )

  assert.end()
})

test('traversal "PostOrder', assert => {
  let result = []

  PostOrder(options, state, n => {
    result.push(n.get('id'))
  })

  assert.deepEqual(
    result,
    ['A', 'C', 'E', 'D', 'B', 'H', 'I', 'G', 'F'],
    'Walks nodes in correctly in post-order'
  )

  assert.end()
})
test('traversal "ReversePostOrder', assert => {
  let result = []

  ReversePostOrder(options, state, n => {
    result.push(n.get('id'))
  })

  assert.deepEqual(
    result,
    ['H', 'I', 'G', 'E', 'C', 'D', 'A', 'B', 'F'],
    'Walks nodes in correctly in reverse post-order'
  )

  assert.end()
})

test('traversal "InOrder', assert => {
  let result = []

  InOrder(options, state, n => {
    result.push(n.get('id'))
  })

  assert.deepEqual(
    result,
    ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'I', 'G'],
    'Walks nodes in correctly in in-order'
  )

  assert.end()
})

test('traversal "ReverseInOrder', assert => {
  let result = []

  ReverseInOrder(options, state, n => {
    result.push(n.get('id'))
  })

  assert.deepEqual(
    result,
    ['H', 'I', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
    'Walks nodes in correctly in reverse in-order'
  )

  assert.end()
})

test('traversal "BFS', assert => {
  let result = []

  BFS(options, state, n => {
    result.push(n.get('id'))
  })

  assert.deepEqual(
    result,
    ['F', 'B', 'G', 'A', 'D', 'I', 'C', 'E', 'H'],
    'Walks nodes in correctly when applying breadth-first-search'
  )

  assert.end()
})

test('traversal "ReverseBFS', assert => {
  let result = []

  ReverseBFS(options, state, n => {
    result.push(n.get('id'))
  })

  assert.deepEqual(
    result,
    ['F', 'G', 'B', 'I', 'D', 'A', 'H', 'E', 'C'],
    'Walks nodes in correctly when applying reverse breadth-first-search'
  )

  assert.end()
})
