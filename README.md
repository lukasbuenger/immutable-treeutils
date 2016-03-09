Immutable TreeUtils
===================

0.1.1

This CommonJS module is a collection of helpers to access and traverse [ImmutableJS](http://facebook.github.io/immutable-js/) tree data structure with a DOM-inspired interface.

It is written in ES2015, the ES5/ES3 distribution is built with [Babel](babeljs.io).

It imposes some very basic conventions on your data structure, but I tried to make everything as low-level and configurable as possible. Still, a few
conditions that need to be met remain:

* A tree can have only one root node.
* Every node has to provide a unique identifier value under a key that is the same for all nodes in the tree.
* Child nodes have to be stored in an [List](http://facebook.github.io/immutable-js/docs/#/List) under a key that is the the same for all nodes containing children.

## Getting started

You probably should feel comfortable working with [ImmutableJS](http://facebook.github.io/immutable-js/) data structures, so if you don't I strongly recommend you to get familiar with the concepts [ImmutableJS](http://facebook.github.io/immutable-js/) first.

### Understanding key paths

As you already know, with [ImmutableJS](http://facebook.github.io/immutable-js/) we retrieve nested values like this:

```js
let map = Immutable.Map({a: { b: 'c' }});
map.getIn(['a', 'b']);
// 'c'
```
We could say that the key path to the value `'c'` is `['a', 'b']`.
Instead of an array you can also use [Seq](http://facebook.github.io/immutable-js/docs/#/Seq) objects to describe key paths:
```js
map.getIn(Immutable.Seq.of('a', 'b'));
// 'c'
```

This might feel a little over the top at first but comes with a few advantages that are pivotal to [TreeUtils](#TreeUtils).
As a matter of fact, all the functions in this lib, that give you a node or a collection of nodes don't return the actual [ImmutableJS](http://facebook.github.io/immutable-js/) values but the key paths to the substate where the resulting node(s) are located. A lot of operations become very trivial with key paths. Let's look at the [parent](#TreeUtils-parent) function. Determining the parent of a given node represented by a key path is as simple as this:
```js
let nodePath = Immutable.Seq.of('data', 'childNodes', 0, 'childNodes', 1);
let parentPath = nodePath.skipLast(2);
```

The actual retrieval of the [ImmutableJS](http://facebook.github.io/immutable-js/) values is left to you, but you will notice that working with key paths can be quite fun. Imagine you want to get value at key `content` of the next sibling of a given node. You could do this like so:
```js
let keyPath = treeUtils.nextSibling(state, 'node-id');
let content = state.getIn(keyPath.concat('content'));

// or even shorter
let content = state.getIn(treeUtils.nextSibling(state, 'node-id').concat('name'));
```

**Please note, that while ImmutableJS works well with Arrays as key paths, [TreeUtils](#TreeUtils) will only accept [Seq](http://facebook.github.io/immutable-js/docs/#/Seq) objects as valid key paths.**

### Working with cursors

[TreeUtils](#TreeUtils) works just fine with cursor libraries like [contrib/cursor](https://github.com/facebook/immutable-js/tree/master/contrib/cursor) or [immutable-cursors](https://github.com/lukasbuenger/immutable-cursors), because cursors actually implement [ImmutableJS](http://facebook.github.io/immutable-js/) interfaces.

### Tree mutation

[TreeUtils](#TreeUtils) currently doesn't provide mutation helpers. It might in the future, but I have to give that some thought first. However, simple mutation functions can easily be implemented. An insert function could look something like this:
```js
function insert(state, newNode, parentId, index) {
	return state.updateIn(
		tree.getById(state, parentId).concat('childNodes'),
		childNodes => childNodes.splice(index, 0, newNode)
	);
}
```

### Install and setup

Install the package from [npm](https://www.npmjs.com/package/immutable-treeutils):

```
npm install immutable-tree
```

**Note:** This library relies on *ES6 generators* so you need either an environment that supports them or to include some polyfill like [regenerator](https://github.com/facebook/regenerator) or [babel's polyfill](https://babeljs.io/docs/usage/polyfill/) before importing `immutable-treeutils`;

Import the module and provide some state. Examples in the docs below refer to this data structure:

```javascript
import Immutable from 'immutable';
import TreeUtils from 'immutable-treeutils';

let treeUtils = new TreeUtils();

let data = Immutable.fromJS({
	id: 'root',
	name: 'My Documents',
	type: 'folder'
	childNodes: [
		{
			id: 'node-1',
			name: 'Pictures',
			type: 'folder',
			childNodes: [
				{
					id: 'node-2',
					name: 'Me in Paris',
					type: 'image'
				},
				{
					id: 'node-3',
					name: 'Barbecue July 2015',
					type: 'image'
				}
			]
		},
		{
			id: 'node-4',
			name: 'Music',
			type: 'folder',
			childNodes: [
				{
					id: 'node-5',
					name: 'Pink Floyd - Wish You Were Here',
					type: 'audio'
				},
				{
					id: 'node-6',
					name: 'The Doors - People Are Strange',
					type: 'audio'
				}
			]
		}
	]
});
```

## Docs

- - - 
<sub>[See Source](https://github.com/lukasbuenger/immutable-cursors/tree/v0.1.1/src/TreeUtils.js)</sub>
- - - 
<a id="TreeUtils"></a>




### *class* TreeUtils

A collection of functional tree traversal helper functions for [ImmutableJS](http://facebook.github.io/immutable-js/) data structures.

**Example**

```js
const treeUtils = new TreeUtils(Immutable.Seq.of('path', 'to', 'tree'));
```

**With custom key accessors**

```js
const treeUtils = new TreeUtils(Immutable.Seq.of('path', 'to', 'tree'), '__id', '__children');
```

**Note**
The first argument of every method of a `TreeUtils` object is the state you want to analyse. I won't mention / explain it again in method descriptions bellow. The argument `idOrKeyPath` also appears in most signatures, its purpose is thoroughly explained in the docs of [byArbitrary](#TreeUtils-byArbitrary).


###### Signature:
```js
new TreeUtils(
   rootPath?: immutable.Seq,
   idKey?: string,
   childNodesKey?: string
)
```

###### Arguments:
* `rootPath` - The path to the substate of your [ImmutableJS](http://facebook.github.io/immutable-js/) state that represents the root node of your tree. Default: `Immutable.Seq()`.
* `idKey` - The name of the key that points at unique identifiers of all nodes in your tree . Default: `'id'`.
* `childNodesKey` - The name of the key at which child nodes can be found. Default: `'childNodes'`.

###### Returns:
* A new `TreeUtils` object
 

- - - 
<a id="TreeUtils-id"></a>



#### *method* id()

Returns the id for the node at `keyPath`. Most useful when you want to get the id of the result of a previous tree query:
```js
treeUtils.id(state, treeUtils.parent(state, 'node-3'));
// 'node-1'
```

###### Signature:
```js
id(
   state: Immutable.Iterable,
   keyPath: Immutable.Seq<string|number>
): string
```

###### Arguments:
* `keyPath` - The absolute key path to the substate / node whose id you want to retrieve

###### Returns:
The unique identifier of the node at the given key path.

	 

- - - 
<a id="TreeUtils-nodes"></a>



#### *method* nodes()

An iterator of all nodes in the tree.

```js
for(var nodePath of treeUtils.nodes(state)) {
   console.log(treeUtils.id(state, nodePath));
}
```

###### Signature:
```
nodes(
    state: Immutable.Iterable,
    path?: Immutable.Seq<string|number>
): Iterator
```

###### Arguments:
* `path` - The key path that points at the root of the (sub)tree whose descendants you want to iterate. Default: The `TreeUtils` object's `rootPath`.

###### Returns:
An **unordered** [Iterator](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Iteration_protocols) of all nodes in the tree.
	 

- - - 
<a id="TreeUtils-find"></a>



#### *method* find()

Returns the key path to the first node for which `compatator` returns `true`. Uses [nodes](#TreeUtils-nodes) internally and as [nodes](#TreeUtils-nodes) is an **unordered** Iterator, you should probably use this to find unique occurences of data.
```js
treeUtils.find(state, node => node.get('name') === 'Me in Paris');
// Seq ["childNodes", 0, "childNodes", 0]
```

###### Signature:
```js
find(
   state: Immutable.Iterable,
   comparator: Function,
   path?: Immutable.Seq<string|number>
): Immutable.Seq<string|number>
```

###### Arguments:
* `comparator` - A function that gets passed a node and should return whether it fits the criteria or not.
* `path?` - An optional key path to the (sub)state you want to analyse: Default: The `TreeUtils` object's `rootPath`.

###### Returns:
The key path to the first node for which `comparator` returned `true`.
	 

- - - 
<a id="TreeUtils-filter"></a>



#### *method* filter()

Returns an [List](http://facebook.github.io/immutable-js/docs/#/List) of key paths pointing at the nodes for which `comparator` returned `true`.
```js
treeUtils.filter(node => node.get('type') === 'folder');
//List [ Seq[], Seq["childNodes", 0], Seq["childNodes", 1] ]
```

###### Signature:
```js
filter(
    state: Immutable.Iterable,
    comparator: Function,
    path?: Immutable.Seq<string|number>
): List<Immutable.Seq<string|number>>
```

###### Arguments:
* `comparator` - A function that gets passed a node and should return whether it fits the criteria or not.
* `path?` - An optional key path to the (sub)state you want to analyse: Default: The `TreeUtils` object's `rootPath`.


###### Returns:
A [List](http://facebook.github.io/immutable-js/docs/#/List) of all the key paths that point at nodes for which `comparator` returned `true`.
	 

- - - 
<a id="TreeUtils-byId"></a>



#### *method* byId()

Returns the key path to the node with id === `id`.

###### Signature:
```js
id(
   state: Immutable.Iterable,
   id: string
): Immutable.Seq<string|number>
```

###### Arguments:
* `id` - A unique identifier

###### Returns:
The key path to the node with id === `id`.
	 

- - - 
<a id="TreeUtils-byArbitrary"></a>



#### *method* byArbitrary()

Returns `idOrKeyPath` if it is a [Seq](http://facebook.github.io/immutable-js/docs/#/Seq), else returns the result of [byId](#TreeUtils-byId) for `idOrKeyPath`. This is used in all other functions that work on a unique identifiers in order to reduce the number of lookup operations.

###### Signature:
```js
byArbitrary(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>
): Immutable.Seq<string|number>
```
###### Returns:
The key path pointing at the node found for id === `idOrKeyPath` or, if is a [Seq](http://facebook.github.io/immutable-js/docs/#/Seq), the `idOrKeyPath` itself.

	 

- - - 
<a id="TreeUtils-nextSibling"></a>



#### *method* nextSibling()

###### Signature:
```js
nextSibling(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>
): Immutable.Seq<string|number>
```

###### Returns:
Returns the next sibling node of the node at `idOrKeyPath`
	 

- - - 
<a id="TreeUtils-previousSibling"></a>



#### *method* previousSibling()

###### Signature:
```js
previousSibling(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>
): Immutable.Seq<string|number>
```

###### Returns:
Returns the previous sibling node of the node at `idOrKeyPath`
	 

- - - 
<a id="TreeUtils-firstChild"></a>



#### *method* firstChild()

###### Signature:
```js
firstChild(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>
): Immutable.Seq<string|number>
```

###### Returns:
Returns the first child node of the node at `idOrKeyPath`
	 

- - - 
<a id="TreeUtils-lastChild"></a>



#### *method* lastChild()

###### Signature:
```js
lastChild(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>
): Immutable.Seq<string|number>
```

###### Returns:
Returns the last child node of the node at `idOrKeyPath`
	 

- - - 
<a id="TreeUtils-siblings"></a>



#### *method* siblings()

###### Signature:
```js
siblings(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>
): Immutable.List<Immutable.Seq<string|number>>
```

###### Returns:
Returns a [List](http://facebook.github.io/immutable-js/docs/#/List) of key paths pointing at the sibling nodes of the node at `idOrKeyPath`
	 

- - - 
<a id="TreeUtils-childNodes"></a>



#### *method* childNodes()

###### Signature:
```js
childNodes(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>
): Immutable.List<Immutable.Seq<string|number>>
```

###### Returns:
Returns a [List](http://facebook.github.io/immutable-js/docs/#/List) of all child nodes of the node at `idOrKeyPath`
	 

- - - 
<a id="TreeUtils-childAt"></a>



#### *method* childAt()

###### Signature:
```js
childAt(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
   index: number
): Immutable.Seq<string|number>
```

###### Returns:
Returns the child node at position of `index` of the node at `idOrKeyPath`
	 

- - - 
<a id="TreeUtils-descendants"></a>



#### *method* descendants()

###### Signature:
```js
descendants(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): Immutable.List<Immutable.Seq<string|number>>
```

###### Returns:
Returns a list of key paths pointing at all descendants of the node at `idOrKeyPath`
	 

- - - 
<a id="TreeUtils-childIndex"></a>



#### *method* childIndex()

###### Signature:
```js
childIndex(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): number
```

###### Returns:
Returns the index at which the node at `idOrKeyPath` is positioned in its parent child nodes list.
	 

- - - 
<a id="TreeUtils-hasChildNodes"></a>



#### *method* hasChildNodes()

###### Signature:
```js
hasChildNodes(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): boolean
```

###### Returns:
Returns whether the node at `idOrKeyPath` has children.
	 

- - - 
<a id="TreeUtils-numChildNodes"></a>



#### *method* numChildNodes()

###### Signature:
```js
numChildNodes(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): number
```

###### Returns:
Returns the number of child nodes the node at `idOrKeyPath` has.
	 

- - - 
<a id="TreeUtils-parent"></a>



#### *method* parent()

###### Signature:
```js
parent(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): Immutable.Seq<string|number>
```

###### Returns:
Returns the key path to the parent of the node at `idOrKeyPath`.
	 

- - - 
<a id="TreeUtils-ancestors"></a>



#### *method* ancestors()

###### Signature:
```js
ancestors(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): Immutable.Seq<string|number>
```

###### Returns:
Returns an [List](http://facebook.github.io/immutable-js/docs/#/List) of all key paths that point at direct ancestors of the node at `idOrKeyPath`.
	 

- - - 
<a id="TreeUtils-position"></a>



#### *method* position()

This method is a very naive attempt to calculate a unqiue numeric position descriptor that can be used to compare two nodes for their absolute position in the tree.
```js
treeUtils.position(state, 'node-4') > treeUtils.position(state, 'node-3');
// true
```

Please note that `position` should not get used to do any comparison with the root node.

###### Signature:
```js
position(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): number
```

###### Returns:
Returns a unique numeric value that represents the absolute position of the node at `idOrKeyPath`.
	 

- - - 
<a id="TreeUtils-right"></a>



#### *method* right()

Returns the key path to the next node to the right. The next right node is either:
* The first child node.
* The next sibling.
* The next sibling of the first ancestor that in fact has a next sibling.
* undefined

```js
let nodePath = treeUtils.byId(state, 'root');
while (nodePath) {
   console.log(nodePath);
   nodePath = treeUtils.right(state, nodePath);
}
// 'root'
// 'node-1'
// 'node-2'
// 'node-3'
// 'node-4'
// 'node-5'
// 'node-6'
```

###### Signature:
```js
right(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): Immutable.Seq<string|number>
```

###### Returns:
Returns the key path to the node to the right of the one at `idOrKeyPath`.
	 

- - - 
<a id="TreeUtils-left"></a>



#### *method* left()

Returns the key path to the next node to the left. The next left node is either:
* The last descendant of the previous sibling node.
* The previous sibling node.
* The parent node.
* undefined

```js
let nodePath = treeUtils.lastDescendant(state, 'root');
while (nodePath) {
   console.log(nodePath);
   nodePath = treeUtils.left(state, nodePath);
}
// 'node-6'
// 'node-5'
// 'node-4'
// 'node-3'
// 'node-2'
// 'node-1'
// 'root'
```


###### Signature:
```js
left(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): Immutable.Seq<string|number>
```

###### Returns:
Returns the key path to the node to the right of the one at `idOrKeyPath`.
	 

- - - 
<a id="TreeUtils-firstDescendant"></a>



#### *method* firstDescendant()

Alias of [firstChild](#TreeUtils-firstChild).
	 

- - - 
<a id="TreeUtils-lastDescendant"></a>



#### *method* lastDescendant()

Returns the key path to the next node to the left. The next left node is either:
* The last descendant of the previous sibling node.
* The previous sibling node.
* The parent node.
* undefined

```js
treeUtils.lastDescendant(state, 'root');
// 'node-6'
```

###### Signature:
```js
lastDescendant(
   state: Immutable.Iterable,
   idOrKeyPath: string|Immutable.Seq<string|number>,
): Immutable.Seq<string|number>
```

###### Returns:
Returns the key path to the last descendant of the node at `idOrKeyPath`.
	 



## Development

Get the source:
```
git clone https://github.com/lukasbuenger/immutable-cursors
```

Install dependencies:
```
npm install
```

Lint the code:
```
npm run lint
```

Run the tests:
```
npm test
```

Build ES5/ES3:
```
npm run build
```

Build the docs / README:
```
npm run docs
```

Update all local dependencies:
```
npm run update-dependencies
```

## Changelog

##### 0.1.2

- Migration to Babel 6 courtesy of [Kei Takashima](https://github.com/keit).
- README hint to use environment with generators enabled courtesy of [Emanuele Ingrosso](https://github.com/ingro).
- Further updated dependencies, most notably ImmutableJS.
- Added estraverse-fb to devDependencies (https://github.com/eslint/eslint/issues/5476).

## License

See [LICENSE](LICENSE) file.
