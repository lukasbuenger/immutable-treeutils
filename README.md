# immutable-treeutils

![Travis status](https://travis-ci.org/lukasbuenger/immutable-treeutils.svg)

> **2.00 is out and has breaking changes!** If you're a current user of `TreeUtils` you can [read more here](https://lukasbuenger.github.io/immutable-treeutils) about how to upgrade and also about how to not upgrade ever again.

This module provides a small collection of helpers to search and traverse tree data structures in JavaScript.
`TreeUtils` considers your state a tree data structure if it passes the following checks:

- It can only have one single root node.
- Child nodes have to be stored as arrays to a property that is the same for all nodes containing children.
- Every node has to provide a unique identifier value under a path that is the same for all nodes in the tree (Only required for single item retrieval).

You can always switch over to the [documentation pages](https://lukasbuenger.github.io/immutable-treeutils) for a thorough rundown or stick around for a quick intro.

### Quick start

Get the package.

```bash
npm install immutable-treeutils
```

Write some queries.

```js
const state = {
  id: '1',
  childNodes: [{ id: '2', childNodes: [{ id: '3' }] }, { id: '4' }],
}

const treeUtils = TreeUtils()

// Have all nodes with even id's child nodes?
treeUtils
  .filter(state, node => Number(node.id) % 2 === 0)
  .map(keyPath => treeUtils.hasChildNodes(state, keyPath))
  .every(v => v)
// false
```

`TreeUtils` methods return `KeyPath` objects instead of actual nodes. A `KeyPath` is just an alias for an array containing only strings and numbers, which describe the path to a possibly nested value on a given state. Think cursors or pointers.

```js
treeUtils.findId(state, '3')
// [ 'childNodes', 0, 'childNodes', 0, ]
```

Resolve `KeyPath` pointers against your state:

```js
const keyPath = treeUtils.findId(state, '3')
state.getIn(keyPath)
// { id: '3' }

const nextState = state.updateIn(keyPath, n => n.set('visited', true))
nextState.getIn(keyPath.concat('visited'))
// true
```

Set up the API to fit your data structure:

```js
const tupleState = fromJS({
  data: ['1', [['2', [['3']]], ['4']]],
})

const customTreeUtils = TreeUtils({
  rootPath: List(['data']),
  idPath: List([0]),
  childNodesPath: List([1]),
})

const tupleKeyPath = customTreeUtils.findId(tupleState, '3')
tupleState.getIn(tupleKeyPath)
// Immutable.List ['3']
```

For more info and context, check out the [documentation](https://lukasbuenger.github.io/immutable-treeutils).

### Changelog

See [CHANGELOG](https://github.com/lukasbuenger/immutable-treeutils/blob/v1.2.0/CHANGELOG.md)

### License

See [LICENSE](https://github.com/lukasbuenger/immutable-treeutils/blob/v1.2.0/LICENSE).
