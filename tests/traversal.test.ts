import test from 'tape'

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
  rootPath: [],
  idPath: ['id'],
  childNodesPath: ['childNodes'],
}

const state = {
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
}

test('traversal "Preorder', assert => {
  const result = []

  PreOrder(options, state, n => {
    result.push(n.id)
  })

  assert.deepEqual(
    result,
    ['F', 'B', 'A', 'D', 'C', 'E', 'G', 'I', 'H'],
    'Walks nodes in correct order in  pre-order'
  )

  assert.end()
})

test('traversal "ReversePreorder', assert => {
  const result = []

  ReversePreOrder(options, state, n => {
    result.push(n.id)
  })

  assert.deepEqual(
    result,
    ['F', 'G', 'I', 'H', 'B', 'D', 'E', 'C', 'A'],
    'Walks nodes in correct order in  reverse pre-order'
  )

  assert.end()
})

test('traversal "PostOrder', assert => {
  const result = []

  PostOrder(options, state, n => {
    result.push(n.id)
  })

  assert.deepEqual(
    result,
    ['A', 'C', 'E', 'D', 'B', 'H', 'I', 'G', 'F'],
    'Walks nodes in correct order in post-order'
  )

  assert.end()
})
test('traversal "ReversePostOrder', assert => {
  const result = []

  ReversePostOrder(options, state, n => {
    result.push(n.id)
  })

  assert.deepEqual(
    result,
    ['H', 'I', 'G', 'E', 'C', 'D', 'A', 'B', 'F'],
    'Walks nodes in correct order in reverse post-order'
  )

  assert.end()
})

test('traversal "InOrder', assert => {
  const result = []

  InOrder(options, state, n => {
    result.push(n.id)
  })

  assert.deepEqual(
    result,
    ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'I', 'G'],
    'Walks nodes in correct order in in-order'
  )

  assert.end()
})

test('traversal "ReverseInOrder', assert => {
  const result = []

  ReverseInOrder(options, state, n => {
    result.push(n.id)
  })

  assert.deepEqual(
    result,
    ['H', 'I', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
    'Walks nodes in correct order in reverse in-order'
  )

  assert.end()
})

test('traversal "BFS', assert => {
  const result = []

  BFS(options, state, n => {
    result.push(n.id)
  })

  assert.deepEqual(
    result,
    ['F', 'B', 'G', 'A', 'D', 'I', 'C', 'E', 'H'],
    'Walks nodes in correct order when applying breadth-first-search'
  )

  assert.end()
})

test('traversal "ReverseBFS', assert => {
  const result = []

  ReverseBFS(options, state, n => {
    result.push(n.id)
  })

  assert.deepEqual(
    result,
    ['F', 'G', 'B', 'I', 'D', 'A', 'H', 'E', 'C'],
    'Walks nodes in correct order when applying reverse breadth-first-search'
  )

  assert.end()
})
