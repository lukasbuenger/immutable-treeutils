import test from 'tape'
import { set } from 'lodash'
import {
  defaultOptions,
  getId,
  nextSibling,
  previousSibling,
  parent,
  childIndex,
  childAt,
  firstChild,
  lastChild,
  hasChildNodes,
  numChildNodes,
  siblings,
  childNodes,
  ancestors,
  depth,
  descendants,
  right,
  left,
  filter,
  reduceTree,
  resolve,
  firstDescendant,
  find,
  findId,
} from '../src/'
import { Node } from '../src/types'

const state = {
  data: {
    name: 'Article',
    type: 'article',
    id: '1',
    childNodes: [
      {
        type: 'paragraph',
        name: 'Paragraph',
        id: '2',
      },
      {
        type: 'list',
        name: 'List',
        id: '3',
        childNodes: [
          {
            type: 'listItem',
            name: 'List item 1',
            id: '4',
            childNodes: [
              {
                type: 'paragraph',
                name: 'Nested paragraph',
                id: '5',
              },
            ],
          },
          {
            type: 'listItem',
            name: 'List item 2',
            id: '6',
            childNodes: [
              {
                type: 'paragraph',
                name: 'Nested paragraph 2',
                id: '7',
              },
            ],
          },
        ],
      },
    ],
  },
}

const options = {
  ...defaultOptions,
  rootPath: ['data'],
}

test('method "resolve"', assert => {
  const _resolve = resolve.bind(null, options, state)

  assert.deepEqual(
    _resolve(['data', 'childNodes', 0, 'name']),
    'Paragraph',
    'returns the data the cursor points to.'
  )

  assert.deepEqual(
    _resolve(['data', 'childNodes', 7, 'name'], 0),
    0,
    'returns a default value if no data was found at the cursor.'
  )

  assert.end()
})

test('method "reduceTree"', assert => {
  const _reduceTree = reduceTree.bind(null, options, state)

  assert.deepEqual(
    _reduceTree((acc: string[], val: Node) => acc.concat(val.id), []),
    ['1', '2', '3', '4', '5', '6', '7'],
    'returns a reduction of the tree.'
  )

  assert.deepEqual(
    _reduceTree((_: any, val: Node, _1: any, stop: Function) => {
      if (val.id === '3') {
        return stop(val.id)
      }
    }),
    '3',
    'returns the value passed to to the stop function.'
  )
  assert.end()
})

test('method "filter"', assert => {
  const _filter = filter.bind(null, options, state)

  assert.deepEqual(
    _filter((node: Node) => node.type === 'paragraph'),
    [
      ['data', 'childNodes', 0],
      ['data', 'childNodes', 1, 'childNodes', 0, 'childNodes', 0],
      ['data', 'childNodes', 1, 'childNodes', 1, 'childNodes', 0],
    ],
    'returns a list of key paths whose nodes match the predicate.'
  )

  assert.end()
})

test('method "find"', assert => {
  const _find = find.bind(null, options, state)

  assert.deepEqual(
    _find((node: Node) => node.type === 'paragraph'),
    ['data', 'childNodes', 0],
    'returns the first key path whose node matches the predicate.'
  )

  const noOp = () => {
    // void
  }

  assert.deepEqual(
    [_find(noOp), _find(noOp, null, 'foo')],
    [undefined, 'foo'],
    'returns notSetValue if no node matches the predicate.'
  )

  assert.end()
})

test('method "findId"', assert => {
  const _findId = findId.bind(null, options, state)

  assert.deepEqual(
    _findId('2'),
    ['data', 'childNodes', 0],
    'returns the first key path whose node matches the predicate.'
  )

  assert.end()
})

test('method "getId"', assert => {
  const _getId = getId.bind(null, options, state)
  assert.equal(
    _getId(['data', 'childNodes', 0]),
    '2',
    'returns the id value of an absolute key path.'
  )
  assert.deepEqual(
    [
      _getId(['data', 'childNodes', 4]),
      _getId(['data', 'childNodes', 4], false),
    ],
    [undefined, false],
    'returns notSetValue if the key path has no id key.'
  )

  assert.end()
})

test('method "nextSibling"', assert => {
  const _nextSibling = nextSibling.bind(null, options, state)
  assert.deepEqual(
    _nextSibling('4'),
    ['data', 'childNodes', 1, 'childNodes', 1],
    'returns the next sibling key path.'
  )
  assert.deepEqual(
    [_nextSibling('7'), _nextSibling('7', null, 'foo')],
    [undefined, 'foo'],
    'returns notSetValue if the node at `id` does not have a next sibling.'
  )

  assert.end()
})

test('method "previousSibling"', assert => {
  const _previousSibling = previousSibling.bind(null, options, state)
  assert.deepEqual(
    _previousSibling('6'),
    ['data', 'childNodes', 1, 'childNodes', 0],
    'returns the previous sibling key path.'
  )
  assert.deepEqual(
    [_previousSibling('4'), _previousSibling('4', null, 6)],
    [undefined, 6],
    'returns notSetValue if the node at `id` does not have a next sibling.'
  )

  assert.end()
})

test('method "parent"', assert => {
  const _parent = parent.bind(null, options, state)
  assert.deepEqual(
    _parent('7'),
    ['data', 'childNodes', 1, 'childNodes', 1],
    'returns the parent key path.'
  )

  assert.deepEqual(
    [_parent('1'), _parent('1', null, true)],
    [undefined, true],
    'returns notSetValue if the node has no parent (aka is the root node).'
  )

  assert.end()
})

test('method "childIndex"', assert => {
  const _childIndex = childIndex.bind(null, options, state)
  assert.equal(
    _childIndex('3'),
    1,
    'returns the child index a node has in relation to its parent.'
  )

  assert.deepEqual(
    [_childIndex('1'), _childIndex('1', null, false)],
    [undefined, false],
    'returns notSetValue if no child index can be derived (aka is probably the root node).'
  )

  assert.end()
})

test('method "childAt"', assert => {
  const _childAt = childAt.bind(null, options, state)

  assert.deepEqual(
    _childAt('3', 0),
    ['data', 'childNodes', 1, 'childNodes', 0],
    'returns the key path to the node at child index'
  )
  assert.deepEqual(
    [_childAt('4', 2), _childAt('4', 2, null, false)],
    [undefined, false],
    'returns notSetValue if there is no child node at the given index.'
  )
  assert.end()
})

test('method "firstChild"', assert => {
  const _firstChild = firstChild.bind(null, options, state)

  assert.deepEqual(
    _firstChild('4'),
    ['data', 'childNodes', 1, 'childNodes', 0, 'childNodes', 0],
    'returns the first child key path'
  )

  assert.deepEqual(
    [_firstChild('7'), _firstChild('7', null, false)],
    [undefined, false],
    'returns notSetValue if there is no first child (aka the node has no children).'
  )
  assert.end()
})

test('method "lastChild"', assert => {
  const _lastChild = lastChild.bind(null, options, state)

  assert.deepEqual(
    _lastChild('1'),
    ['data', 'childNodes', 1],
    'returns the last child key path'
  )

  assert.deepEqual(
    [_lastChild('7'), _lastChild('7', null, false)],
    [undefined, false],
    'returns notSetValue if there is no last child (aka the node has no children).'
  )
  assert.end()
})

test('method "hasChildNodes"', assert => {
  const _hasChildNodes = hasChildNodes.bind(null, options, state)

  assert.equal(
    _hasChildNodes('4'),
    true,
    'returns true if a node has any child nodes.'
  )

  assert.equal(
    _hasChildNodes('7'),
    false,
    'returns false if a node has no child nodes.'
  )

  assert.end()
})

test('method "numChildNodes"', assert => {
  const _numChildNodes = numChildNodes.bind(null, options, state)

  assert.equal(
    _numChildNodes('1'),
    2,
    'returns the number of child nodes.'
  )

  assert.deepEqual(
    [_numChildNodes('2'), _numChildNodes('2', null, 'foo')],
    [undefined, 'foo'],
    'returns notSetValue if the node has no value at childNodesKey.'
  )

  assert.end()
})

test('method "siblings"', assert => {
  const _siblings = siblings.bind(null, options, state)

  assert.deepEqual(
    _siblings('6'),
    [['data', 'childNodes', 1, 'childNodes', 0]],
    'returns a list of all sibling key paths.'
  )

  assert.deepEqual(
    [_siblings('7'), _siblings('19', null, 'foo')],
    [[], 'foo'],
    'returns notSetValue if the node does not exist, empty list if node has no siblings.'
  )
  assert.end()
})

test('method "childNodes"', assert => {
  const _childNodes = childNodes.bind(null, options, state)
  const stateWithEmptyChildNodes = set(
    state,
    ['data', 'childNodes', 0, 'childNodes'],
    []
  )

  assert.deepEqual(
    _childNodes('3'),
    [
      ['data', 'childNodes', 1, 'childNodes', 0],
      ['data', 'childNodes', 1, 'childNodes', 1],
    ],
    'returns a list of all child key paths.'
  )

  assert.deepEqual(
    [
      childNodes(options, stateWithEmptyChildNodes, '2'),
      _childNodes('19', null, 'foo'),
    ],
    [[], 'foo'],
    'returns notSetValue if the node does not exist or has no value at childNodesKey, empty list if node has no childNodes.'
  )
  assert.end()
})

test('method "ancestors"', assert => {
  const _ancestors = ancestors.bind(null, options, state)

  assert.deepEqual(
    _ancestors('7'),
    [
      ['data', 'childNodes', 1, 'childNodes', 1],
      ['data', 'childNodes', 1],
      ['data'],
    ],
    'returns a list of all ancestor key paths.'
  )

  assert.deepEqual(
    [_ancestors('1'), _ancestors('19', null, 100)],
    [[], 100],
    'returns notSetValue if the node does not exist, empty list if node has no ancestors.'
  )
  assert.end()
})

test('method "depth"', assert => {
  const _depth = depth.bind(null, options, state)

  assert.deepEqual(
    [_depth('7'), _depth('6'), _depth('3'), _depth('1')],
    [3, 2, 1, 0],
    'returns a number representing the depth of the node.'
  )

  assert.equal(
    _depth('8', null, 'MEEEP'),
    'MEEEP',
    'returns notSetValue if the node does not exist.'
  )

  assert.end()
})

test('method "descendants"', assert => {
  const _descendants = descendants.bind(null, options, state)

  assert.deepEqual(
    _descendants('3'),
    [
      ['data', 'childNodes', 1, 'childNodes', 0],
      ['data', 'childNodes', 1, 'childNodes', 0, 'childNodes', 0],
      ['data', 'childNodes', 1, 'childNodes', 1],
      ['data', 'childNodes', 1, 'childNodes', 1, 'childNodes', 0],
    ],
    'returns a list of all descendant key paths.'
  )

  assert.deepEqual(
    [_descendants('7'), _descendants('19', null, 100)],
    [[], 100],
    'returns notSetValue if the node does not exist, empty list if node has no descendants.'
  )
  assert.end()
})

test('method "right"', assert => {
  const _right = right.bind(null, options, state)

  assert.deepEqual(
    _right('3'),
    ['data', 'childNodes', 1, 'childNodes', 0],
    'if exists, returns first child key path.'
  )

  assert.deepEqual(
    _right('2'),
    ['data', 'childNodes', 1],
    'if exists, returns next sibling key path.'
  )

  assert.deepEqual(
    _right('5'),
    ['data', 'childNodes', 1, 'childNodes', 1],
    'if exists, returns the next sibling of the first ancestor that has a next sibling.'
  )

  assert.deepEqual(
    _right('5'),
    ['data', 'childNodes', 1, 'childNodes', 1],
    'if exists, returns the next sibling of the first ancestor that has a next sibling.'
  )

  assert.deepEqual(
    [_right('7'), _right('19', null, 100)],
    [undefined, 100],
    'returns notSetValue if the node has no node to the right (aka lastDescendant).'
  )

  let id = '1'
  let node = _right(id)
  const result = []
  while (node) {
    id = getId(options, state, node)
    result.push(id)
    node = _right(id)
  }

  assert.deepEqual(
    result,
    ['2', '3', '4', '5', '6', '7'],
    'can iterate over the whole tree.'
  )
  assert.end()
})

test('method "left"', assert => {
  const _left = left.bind(null, options, state)

  assert.deepEqual(
    _left('6'),
    ['data', 'childNodes', 1, 'childNodes', 0, 'childNodes', 0],
    'if exists, returns the last descendant key path of a previous sibling node.'
  )

  assert.deepEqual(
    _left('3'),
    ['data', 'childNodes', 0],
    'if exists, returns previous sibling key path.'
  )

  assert.deepEqual(
    _left('2'),
    ['data'],
    'if exists, returns parent key path.'
  )

  assert.deepEqual(
    [_left('1'), _left('19', null, 100)],
    [undefined, 100],
    'returns notSetValue if the node has no node to the left (aka root).'
  )

  let id = '7'
  let node = _left(id)
  const result = []
  while (node) {
    id = getId(options, state, node)
    result.push(id)
    node = _left(id)
  }

  assert.deepEqual(
    result,
    ['6', '5', '4', '3', '2', '1'],
    'can iterate over the whole tree.'
  )

  assert.end()
})

test('method "firstDescendant"', assert => {
  assert.equal(
    firstChild,
    firstDescendant,
    'is an alias of firstChild'
  )

  assert.end()
})
