var Immutable = require('immutable')
var Seq = Immutable.Seq
var List = Immutable.List
var Stack = Immutable.Stack || List

function isV4() {
  return typeof Seq.of === 'undefined'
}

function exists(value) {
  return (
    value !== null &&
    typeof value !== 'undefined'
  )
}

var NONE = undefined

/**
 * @id TreeUtils
 * @lookup TreeUtils
 *
 *
 * ### *class* TreeUtils
 *
 * A collection of functional tree traversal helper functions for >ImmutableJS data structures.
 *
 * **Example**
 *
 * ```js
 * var treeUtils = new TreeUtils(Immutable.Seq(['path', 'to', 'tree']));
 * ```
 *
 * **With custom key accessors**
 *
 * ```js
 * var treeUtils = new TreeUtils(Immutable.Seq(['path', 'to', 'tree']), '__id', '__children');
 * ```
 *
 * **With custom *no result*-default**
 *
 * ```js
 * var treeUtils = new TreeUtils(Immutable.Seq(['path', 'to', 'tree']), 'id', 'children', false);
 * ```
 *
 * **Note**
 * The first argument of every method of a `TreeUtils` object is the state you want to analyse. I won't mention / explain it again in method descriptions bellow. The argument `idOrKeyPath` also appears in most signatures, its purpose is thoroughly explained in the docs of >byArbitrary.
 *
 *
 * ###### Signature:
 * ```js
 * new TreeUtils(
 *    rootPath?: immutable.Seq,
 *    idKey?: string,
 *    childNodesKey?: string,
 *    nonValue?: any
 * )
 * ```
 *
 * ###### Arguments:
 * * `rootPath` - The path to the substate of your >ImmutableJS state that represents the root node of your tree. Default: `Immutable.Seq()`.
 * * `idKey` - The name of the key that points at unique identifiers of all nodes in your tree . Default: `'id'`.
 * * `childNodesKey` - The name of the key at which child nodes can be found. Default: `'childNodes'`.
 * * `noneValue` - The value that will get returned if a query doesn't return any results. Default: `undefined`.
 *
 * ###### Returns:
 * * A new `TreeUtils` object
 */
function TreeUtils(
  rootPath,
  idKey,
  childNodesKey,
  none
) {
  this.rootPath = rootPath || Seq()
  this.idKey = idKey || 'id'
  this.childNodesKey =
    childNodesKey || 'childNodes'
  this.none =
    typeof none !== 'undefined'
      ? none
      : NONE
}
/**
 * @id TreeUtils-id
 * @lookup id
 *
 * #### *method* id()
 *
 * Returns the id for the node at `keyPath`. Most useful when you want to get the id of the result of a previous tree query:
 * ```js
 * treeUtils.id(state, treeUtils.parent(state, 'node-3'));
 * // 'node-1'
 * ```
 *
 * ###### Signature:
 * ```js
 * id(
 *    state: Immutable.Iterable,
 *    keyPath: Immutable.Seq<string|number>
 * ): string
 * ```
 *
 * ###### Arguments:
 * * `keyPath` - The absolute key path to the substate / node whose id you want to retrieve
 *
 * ###### Returns:
 * The unique identifier of the node at the given key path.
 *
 */
TreeUtils.prototype.id = function(
  state,
  keyPath
) {
  return state.getIn(
    keyPath.concat(this.idKey)
  )
}

TreeUtils.prototype.walk = function(
  state,
  iterator,
  path
) {
  var childNodesKey = this.childNodesKey
  var stack = Stack.of(
    path || this.rootPath
  )
  var reduction = this.rootPath
  var stopped = false
  var stop = function(value) {
    stopped = true
    return value
  }
  while (!stopped && stack.size > 0) {
    var keyPath = stack.first()

    reduction = iterator(
      reduction,
      keyPath,
      stop
    )
    stack = stack.shift()
    var childNodes = state.getIn(
      keyPath.concat(childNodesKey)
    )
    if (
      childNodes &&
      childNodes.size > 0
    ) {
      childNodes
        .keySeq()
        .forEach(function(i) {
          stack = stack.unshift(
            keyPath.concat(
              childNodesKey,
              i
            )
          )
        })
    }
  }
  return reduction
}
/**
 * @id TreeUtils-nodes
 * @lookup nodes
 *
 * #### *method* nodes()
 *
 *
 * ```js
 * treeUtils.nodes(state).forEach(
 *   keyPath =>
 *     console.log(treeUtils.id(state, keyPath));
 * )
 * ```
 *
 * ###### Signature:
 * ```
 * nodes(
 *     state: Immutable.Iterable,
 *     path?: Immutable.Seq<string|number>
 * ): Immutable.List<Immutable.Seq<string|number>>
 * ```
 *
 * ###### Arguments:
 * * `path` - The key path that points at the root of the (sub)tree whose descendants you want to iterate. Default: The `TreeUtils` object's `rootPath`.
 *
 * ###### Returns:
 * An **unordered** >Immutable.List of all key paths that point to nodes in the tree.
 */
TreeUtils.prototype.nodes = function(
  state,
  path
) {
  return this.walk(
    state,
    function(acc, keyPath) {
      return List.isList(acc)
        ? acc.push(keyPath)
        : List.of(keyPath)
    },
    path
  )
}

/**
 * @id TreeUtils-find
 * @lookup find
 *
 * #### *method* find()
 *
 * Returns the key path to the first node for which `compatator` returns `true`. Uses >nodes internally and as >nodes is an **unordered** List, you should probably use this to find unique occurences of data.
 * ```js
 * treeUtils.find(state, node => node.get('name') === 'Me in Paris');
 * // Seq ["childNodes", 0, "childNodes", 0]
 * ```
 *
 * ###### Signature:
 * ```js
 * find(
 *    state: Immutable.Iterable,
 *    comparator: (
 *         node: Immutable.Iterable,
 *         keyPath: Immutable.Seq<string|number>
 *     ): boolean,
 *    path?: Immutable.Seq<string|number>
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Arguments:
 * * `comparator` - A function that gets passed a `node` and its `keyPath` and should return whether it fits the criteria or not.
 * * `path?` - An optional key path to the (sub)state you want to analyse: Default: The `TreeUtils` object's `rootPath`.
 *
 * ###### Returns:
 * The key path to the first node for which `comparator` returned `true`.
 */
TreeUtils.prototype.find = function(
  state,
  comparator,
  path
) {
  var self = this
  return this.walk(
    state,
    function(acc, keyPath, stop) {
      if (
        comparator(
          state.getIn(keyPath),
          keyPath
        )
      ) {
        return stop(keyPath)
      }
      return self.none
    },
    path
  )
}

/**
 * @id TreeUtils-filter
 * @lookup filter
 *
 * #### *method* filter()
 *
 * Returns an >Immutable.List of key paths pointing at the nodes for which `comparator` returned `true`.
 * ```js
 * treeUtils.filter(state, node => node.get('type') === 'folder');
 * //List [ Seq[], Seq["childNodes", 0], Seq["childNodes", 1] ]
 * ```
 *
 * ###### Signature:
 * ```js
 * filter(
 *     state: Immutable.Iterable,
 *     comparator: (
 *         node: Immutable.Iterable,
 *         keyPath: Immutable.Seq<string|number>
 *     ): boolean,
 *     path?: Immutable.Seq<string|number>
 * ): List<Immutable.Seq<string|number>>
 * ```
 *
 * ###### Arguments:
 * * `comparator` - A function that gets passed a `node` and its `keyPath` and should return whether it fits the criteria or not.
 * * `path?` - An optional key path to the (sub)state you want to analyse: Default: The `TreeUtils` object's `rootPath`.
 *
 *
 * ###### Returns:
 * A >Immutable.List of all the key paths that point at nodes for which `comparator` returned `true`.
 */
TreeUtils.prototype.filter = function(
  state,
  comparator,
  path
) {
  return this.walk(
    state,
    function(acc, keyPath) {
      var res = List.isList(acc)
        ? acc
        : List()
      if (
        comparator(
          state.getIn(keyPath),
          keyPath
        )
      ) {
        return res.push(keyPath)
      }
      return res
    },
    path
  )
}
/**
 * @id TreeUtils-byId
 * @lookup byId
 *
 * #### *method* byId()
 *
 * Returns the key path to the node with id === `id`.
 *
 * ###### Signature:
 * ```js
 * id(
 *    state: Immutable.Iterable,
 *    id: string
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Arguments:
 * * `id` - A unique identifier
 *
 * ###### Returns:
 * The key path to the node with id === `id`.
 */
TreeUtils.prototype.byId = function(
  state,
  id
) {
  var idKey = this.idKey
  return this.find(state, function(
    item
  ) {
    return item.get(idKey) === id
  })
}

/**
 * @id TreeUtils-byArbitrary
 * @lookup byArbitrary
 *
 * #### *method* byArbitrary()
 *
 * Returns `idOrKeyPath` if it is a >Immutable.Seq, else returns the result of >byId for `idOrKeyPath`. This is used in all other functions that work on a unique identifiers in order to reduce the number of lookup operations.
 *
 * ###### Signature:
 * ```js
 * byArbitrary(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>
 * ): Immutable.Seq<string|number>
 * ```
 * ###### Returns:
 * The key path pointing at the node found for id === `idOrKeyPath` or, if is a >Immutable.Seq, the `idOrKeyPath` itself.
 *
 */
TreeUtils.prototype.byArbitrary = function(
  state,
  idOrKeyPath
) {
  return Seq.isSeq(idOrKeyPath)
    ? idOrKeyPath
    : this.byId(state, idOrKeyPath)
}

/**
 * @id TreeUtils-nextSibling
 * @lookup nextSibling
 *
 * #### *method* nextSibling()
 *
 * ###### Signature:
 * ```js
 * nextSibling(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * Returns the next sibling node of the node at `idOrKeyPath`
 */
TreeUtils.prototype.nextSibling = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  )
  var index = Number(keyPath.last())
  var nextSiblingPath = keyPath
    .skipLast(1)
    .concat(index + 1)
  if (state.hasIn(nextSiblingPath)) {
    return nextSiblingPath
  }
  return this.none
}

/**
 * @id TreeUtils-previousSibling
 * @lookup previousSibling
 *
 * #### *method* previousSibling()
 *
 * ###### Signature:
 * ```js
 * previousSibling(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * Returns the previous sibling node of the node at `idOrKeyPath`
 */
TreeUtils.prototype.previousSibling = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  )
  var index = Number(keyPath.last())
  if (index > 0) {
    return keyPath
      .skipLast(1)
      .concat(index - 1)
  }
  return this.none
}

/**
 * @id TreeUtils-firstChild
 * @lookup firstChild
 *
 * #### *method* firstChild()
 *
 * ###### Signature:
 * ```js
 * firstChild(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * Returns the first child node of the node at `idOrKeyPath`
 */
TreeUtils.prototype.firstChild = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  ).concat([this.childNodesKey, 0])
  if (state.hasIn(keyPath)) {
    return keyPath
  }
  return this.none
}

/**
 * @id TreeUtils-lastChild
 * @lookup lastChild
 *
 * #### *method* lastChild()
 *
 * ###### Signature:
 * ```js
 * lastChild(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * Returns the last child node of the node at `idOrKeyPath`
 */
TreeUtils.prototype.lastChild = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  ).concat([this.childNodesKey])
  var item = state.getIn(keyPath)
  if (item && item.size > 0) {
    return keyPath.concat([
      item.size - 1
    ])
  }
  return this.none
}

/**
 * @id TreeUtils-siblings
 * @lookup siblings
 *
 * #### *method* siblings()
 *
 * ###### Signature:
 * ```js
 * siblings(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>
 * ): Immutable.List<Immutable.Seq<string|number>>
 * ```
 *
 * ###### Returns:
 * Returns a >Immutable.List of key paths pointing at the sibling nodes of the node at `idOrKeyPath`
 */
TreeUtils.prototype.siblings = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  )
  var index = Number(keyPath.last())
  var parentChildren = keyPath.skipLast(
    1
  )
  var item = state.getIn(parentChildren)
  if (exists(item)) {
    return item
      .keySeq()
      .reduce(function(result, i) {
        return i !== index
          ? result.push(
              parentChildren.concat(i)
            )
          : result
      }, List())
  }
  return this.none
}

/**
 * @id TreeUtils-childNodes
 * @lookup childNodes
 *
 * #### *method* childNodes()
 *
 * ###### Signature:
 * ```js
 * childNodes(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>
 * ): Immutable.List<Immutable.Seq<string|number>>
 * ```
 *
 * ###### Returns:
 * Returns a >Immutable.List of all child nodes of the node at `idOrKeyPath`
 */
TreeUtils.prototype.childNodes = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  ).concat(this.childNodesKey)
  var item = state.getIn(keyPath)
  if (exists(item)) {
    var l = item.size
    var result = List()
    for (var i = 0; i < l; i += 1) {
      result = result.push(
        keyPath.concat(i)
      )
    }
    return result
  }
  return this.none
}

/**
 * @id TreeUtils-childAt
 * @lookup childNodes
 *
 * #### *method* childAt()
 *
 * ###### Signature:
 * ```js
 * childAt(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 *    index: number
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * Returns the child node at position of `index` of the node at `idOrKeyPath`
 */
TreeUtils.prototype.childAt = function(
  state,
  idOrKeyPath,
  index
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  ).concat(this.childNodesKey, index)
  if (state.hasIn(keyPath)) {
    return keyPath
  }
  return this.none
}

/**
 * @id TreeUtils-descendants
 * @lookup descendants
 *
 * #### *method* descendants()
 *
 * ###### Signature:
 * ```js
 * descendants(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): Immutable.List<Immutable.Seq<string|number>>
 * ```
 *
 * ###### Returns:
 * Returns a list of key paths pointing at all descendants of the node at `idOrKeyPath`
 */
TreeUtils.prototype.descendants = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  )
  var self = this
  return this.filter(
    state,
    function(item) {
      return (
        item.get(self.idKey) !==
        self.id(state, keyPath)
      )
    },
    keyPath
  )
}

/**
 * @id TreeUtils-childIndex
 * @lookup childIndex
 *
 * #### *method* childIndex()
 *
 * ###### Signature:
 * ```js
 * childIndex(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): number
 * ```
 *
 * ###### Returns:
 * Returns the index at which the node at `idOrKeyPath` is positioned in its parent child nodes list.
 */
TreeUtils.prototype.childIndex = function(
  state,
  idOrKeyPath
) {
  return Number(
    this.byArbitrary(
      state,
      idOrKeyPath
    ).last()
  )
}

/**
 * @id TreeUtils-hasChildNodes
 * @lookup hasChildNodes
 *
 * #### *method* hasChildNodes()
 *
 * ###### Signature:
 * ```js
 * hasChildNodes(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): boolean
 * ```
 *
 * ###### Returns:
 * Returns whether the node at `idOrKeyPath` has children.
 */
TreeUtils.prototype.hasChildNodes = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  ).concat(this.childNodesKey)
  var item = state.getIn(keyPath)
  return exists(item) && item.size > 0
}

/**
 * @id TreeUtils-numChildNodes
 * @lookup numChildNodes
 *
 * #### *method* numChildNodes()
 *
 * ###### Signature:
 * ```js
 * numChildNodes(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): number
 * ```
 *
 * ###### Returns:
 * Returns the number of child nodes the node at `idOrKeyPath` has.
 */
TreeUtils.prototype.numChildNodes = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  ).concat(this.childNodesKey)
  var item = state.getIn(keyPath)
  return exists(item) ? item.size : 0
}

/**
 * @id TreeUtils-parent
 * @lookup parent
 *
 * #### *method* parent()
 *
 * ###### Signature:
 * ```js
 * parent(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * Returns the key path to the parent of the node at `idOrKeyPath`.
 */
TreeUtils.prototype.parent = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  )
  if (keyPath && keyPath.size) {
    return keyPath.slice(0, -2)
  }
  return this.none
}

/**
 * @id TreeUtils-ancestors
 * @lookup ancestors
 *
 * #### *method* ancestors()
 *
 * ###### Signature:
 * ```js
 * ancestors(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * An >Immutable.List of all key paths that point at direct ancestors of the node at `idOrKeyPath`.
 */
TreeUtils.prototype.ancestors = function(
  state,
  idOrKeyPath
) {
  var self = this
  return this.byArbitrary(
    state,
    idOrKeyPath
  ).reduceRight(function(
    memo,
    value,
    index,
    keyPath
  ) {
    if (
      (index - self.rootPath.size) %
        2 ===
        0 &&
      index >= self.rootPath.size
    ) {
      return memo.push(
        isV4()
          ? keyPath.take(index)
          : keyPath
              .takeLast(index)
              .reverse()
              .toSetSeq()
      )
    }
    return memo
  },
  List())
}

/**
 * @id TreeUtils-depth
 * @lookup depth
 *
 * #### *method* depth()
 *
 * ###### Signature:
 * ```js
 * depth(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): number
 * ```
 *
 * ###### Returns:
 * A numeric representation of the depth of the node at `idOrKeyPath`
 */
TreeUtils.prototype.depth = function(
  state,
  idOrKeyPath
) {
  return Math.floor(
    this.byArbitrary(
      state,
      idOrKeyPath
    ).skip(this.rootPath.size).size / 2
  )
}

/**
 * @id TreeUtils-position
 * @lookup position
 *
 * #### *method* position()
 *
 * This method is a very naive attempt to calculate a unqiue numeric position descriptor that can be used to compare two nodes for their absolute position in the tree.
 * ```js
 * treeUtils.position(state, 'node-4') > treeUtils.position(state, 'node-3');
 * // true
 * ```
 *
 * Please note that `position` should not get used to do any comparison with the root node.
 *
 * ###### Signature:
 * ```js
 * position(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): number
 * ```
 *
 * ###### Returns:
 * Returns a unique numeric value that represents the absolute position of the node at `idOrKeyPath`.
 */
TreeUtils.prototype.position = function(
  state,
  idOrKeyPath
) {
  var self = this
  var order = this.byArbitrary(
    state,
    idOrKeyPath
  ).reduceRight(function(
    memo,
    value,
    index
  ) {
    if (
      index >= self.rootPath.size &&
      index % 2 === 0
    ) {
      return value.toString() + memo
    }
    return memo
  },
  '')
  return Number(
    '1.'.concat(order.toString())
  )
}

/**
 * @id TreeUtils-right
 * @lookup right
 *
 * #### *method* right()
 *
 * Returns the key path to the next node to the right. The next right node is either:
 * * The first child node.
 * * The next sibling.
 * * The next sibling of the first ancestor that in fact has a next sibling.
 * * The none value
 *
 * ```js
 * var nodePath = treeUtils.byId(state, 'root');
 * while (nodePath) {
 *    console.log(nodePath);
 *    nodePath = treeUtils.right(state, nodePath);
 * }
 * // 'root'
 * // 'node-1'
 * // 'node-2'
 * // 'node-3'
 * // 'node-4'
 * // 'node-5'
 * // 'node-6'
 * ```
 *
 * ###### Signature:
 * ```js
 * right(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * Returns the key path to the node to the right of the one at `idOrKeyPath`.
 */
TreeUtils.prototype.right = function(
  state,
  idOrKeyPath
) {
  var l = this.rootPath.size
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  )
  var firstChild = this.firstChild(
    state,
    keyPath
  )

  if (firstChild) {
    return firstChild
  }

  var nextSibling = this.nextSibling(
    state,
    keyPath
  )
  if (nextSibling) {
    return nextSibling
  }

  var parent = this.parent(
    state,
    keyPath
  )
  var nextSiblingOfParent

  while (parent && parent.size >= l) {
    nextSiblingOfParent = this.nextSibling(
      state,
      parent
    )
    if (nextSiblingOfParent) {
      return nextSiblingOfParent
    }
    parent = this.parent(state, parent)
  }
  return this.none
}

/**
 * @id TreeUtils-left
 * @lookup left
 *
 * #### *method* left()
 *
 * Returns the key path to the next node to the left. The next left node is either:
 * * The last descendant of the previous sibling node.
 * * The previous sibling node.
 * * The parent node.
 * * The none value
 *
 * ```js
 * var nodePath = treeUtils.lastDescendant(state, 'root');
 * while (nodePath) {
 *    console.log(nodePath);
 *    nodePath = treeUtils.left(state, nodePath);
 * }
 * // 'node-6'
 * // 'node-5'
 * // 'node-4'
 * // 'node-3'
 * // 'node-2'
 * // 'node-1'
 * // 'root'
 * ```
 *
 *
 * ###### Signature:
 * ```js
 * left(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * Returns the key path to the node to the right of the one at `idOrKeyPath`.
 */
TreeUtils.prototype.left = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.byArbitrary(
    state,
    idOrKeyPath
  )
  var lastChild = this.previousSibling(
    state,
    keyPath
  )

  while (lastChild) {
    if (
      !this.hasChildNodes(
        state,
        lastChild
      )
    ) {
      return lastChild
    }
    lastChild = this.lastChild(
      state,
      lastChild
    )
  }

  var parent = this.parent(
    state,
    keyPath
  )

  if (
    parent &&
    parent.size >= this.rootPath.size
  ) {
    return parent
  }

  return this.none
}

/**
 * @id TreeUtils-firstDescendant
 * @lookup firstDescendant
 *
 * #### *method* firstDescendant()
 *
 * Alias of >firstChild.
 */
TreeUtils.prototype.firstDescendant = function(
  state,
  idOrKeyPath
) {
  return this.firstChild(
    state,
    idOrKeyPath
  )
}

/**
 * @id TreeUtils-lastDescendant
 * @lookup lastDescendant
 *
 * #### *method* lastDescendant()
 *
 * Returns the key path to the most right node in the given subtree (keypath). The last child of the most deep descendant, if that makes any sense. Look at the example:
 *
 * ```js
 * treeUtils.lastDescendant(state, 'root');
 * // 'node-6'
 * ```
 *
 * ###### Signature:
 * ```js
 * lastDescendant(
 *    state: Immutable.Iterable,
 *    idOrKeyPath: string|Immutable.Seq<string|number>,
 * ): Immutable.Seq<string|number>
 * ```
 *
 * ###### Returns:
 * Returns the key path to the last descendant of the node at `idOrKeyPath`.
 */
TreeUtils.prototype.lastDescendant = function(
  state,
  idOrKeyPath
) {
  var keyPath = this.lastChild(
    state,
    idOrKeyPath
  )
  while (
    keyPath &&
    this.hasChildNodes(state, keyPath)
  ) {
    keyPath = this.lastChild(
      state,
      keyPath
    )
  }
  return keyPath
}

module.exports = TreeUtils
