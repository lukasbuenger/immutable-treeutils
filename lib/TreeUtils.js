'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _immutable = require('immutable');

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
 * const treeUtils = new TreeUtils(Immutable.Seq.of('path', 'to', 'tree'));
 * ```
 *
 * **With custom key accessors**
 *
 * ```js
 * const treeUtils = new TreeUtils(Immutable.Seq.of('path', 'to', 'tree'), '__id', '__children');
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
 *    childNodesKey?: string
 * )
 * ```
 *
 * ###### Arguments:
 * * `rootPath` - The path to the substate of your >ImmutableJS state that represents the root node of your tree. Default: `Immutable.Seq()`.
 * * `idKey` - The name of the key that points at unique identifiers of all nodes in your tree . Default: `'id'`.
 * * `childNodesKey` - The name of the key at which child nodes can be found. Default: `'childNodes'`.
 *
 * ###### Returns:
 * * A new `TreeUtils` object
 */

var TreeUtils = (function () {
	function TreeUtils() {
		var rootPath = arguments.length <= 0 || arguments[0] === undefined ? (0, _immutable.Seq)() : arguments[0];
		var idKey = arguments.length <= 1 || arguments[1] === undefined ? 'id' : arguments[1];
		var childNodesKey = arguments.length <= 2 || arguments[2] === undefined ? 'childNodes' : arguments[2];

		_classCallCheck(this, TreeUtils);

		this._rootPath = rootPath;
		this._idKey = idKey;
		this._childNodesKey = childNodesKey;
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

	_createClass(TreeUtils, [{
		key: 'id',
		value: function id(state, keyPath) {
			return state.getIn(keyPath.concat(this._idKey));
		}

		/**
   * @id TreeUtils-nodes
   * @lookup nodes
   *
   * #### *method* nodes()
   *
   * An iterator of all nodes in the tree.
   *
   * ```js
   * for(var nodePath of treeUtils.nodes(state)) {
   *    console.log(treeUtils.id(state, nodePath));
   * }
   * ```
   *
   * ###### Signature:
   * ```
   * nodes(
   *     state: Immutable.Iterable,
   *     path?: Immutable.Seq<string|number>
   * ): Iterator
   * ```
   *
   * ###### Arguments:
   * * `path` - The key path that points at the root of the (sub)tree whose descendants you want to iterate. Default: The `TreeUtils` object's `rootPath`.
   *
   * ###### Returns:
   * An **unordered** [Iterator](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Iteration_protocols) of all nodes in the tree.
   */
	}, {
		key: 'nodes',
		value: regeneratorRuntime.mark(function nodes(state, path) {
			var stack, keyPath, item, childNodes, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, i;

			return regeneratorRuntime.wrap(function nodes$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						stack = _immutable.List.of(path || this._rootPath);

					case 1:
						if (!(stack.size > 0)) {
							context$2$0.next = 29;
							break;
						}

						keyPath = stack.first();
						context$2$0.next = 5;
						return keyPath;

					case 5:

						stack = stack.shift();

						item = state.getIn(keyPath), childNodes = item.get(this._childNodesKey);

						if (!(childNodes && childNodes.size > 0)) {
							context$2$0.next = 27;
							break;
						}

						_iteratorNormalCompletion = true;
						_didIteratorError = false;
						_iteratorError = undefined;
						context$2$0.prev = 11;

						for (_iterator = item.get(this._childNodesKey).keys()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							i = _step.value;

							stack = stack.push(keyPath.concat(this._childNodesKey, i));
						}
						context$2$0.next = 19;
						break;

					case 15:
						context$2$0.prev = 15;
						context$2$0.t0 = context$2$0['catch'](11);
						_didIteratorError = true;
						_iteratorError = context$2$0.t0;

					case 19:
						context$2$0.prev = 19;
						context$2$0.prev = 20;

						if (!_iteratorNormalCompletion && _iterator['return']) {
							_iterator['return']();
						}

					case 22:
						context$2$0.prev = 22;

						if (!_didIteratorError) {
							context$2$0.next = 25;
							break;
						}

						throw _iteratorError;

					case 25:
						return context$2$0.finish(22);

					case 26:
						return context$2$0.finish(19);

					case 27:
						context$2$0.next = 1;
						break;

					case 29:
					case 'end':
						return context$2$0.stop();
				}
			}, nodes, this, [[11, 15, 19, 27], [20,, 22, 26]]);
		})

		/**
   * @id TreeUtils-find
   * @lookup find
   *
   * #### *method* find()
   *
   * Returns the key path to the first node for which `compatator` returns `true`. Uses >nodes internally and as >nodes is an **unordered** Iterator, you should probably use this to find unique occurences of data.
   * ```js
   * treeUtils.find(state, node => node.get('name') === 'Me in Paris');
   * // Seq ["childNodes", 0, "childNodes", 0]
   * ```
   *
   * ###### Signature:
   * ```js
   * find(
   *    state: Immutable.Iterable,
   *    comparator: Function,
   *    path?: Immutable.Seq<string|number>
   * ): Immutable.Seq<string|number>
   * ```
   *
   * ###### Arguments:
   * * `comparator` - A function that gets passed a node and should return whether it fits the criteria or not.
   * * `path?` - An optional key path to the (sub)state you want to analyse: Default: The `TreeUtils` object's `rootPath`.
   *
   * ###### Returns:
   * The key path to the first node for which `comparator` returned `true`.
   */
	}, {
		key: 'find',
		value: function find(state, comparator, path) {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.nodes(state, path)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var keyPath = _step2.value;

					if (comparator(state.getIn(keyPath)) === true) {
						return keyPath;
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2['return']) {
						_iterator2['return']();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}

		/**
   * @id TreeUtils-filter
   * @lookup filter
   *
   * #### *method* filter()
   *
   * Returns an >Immutable.List of key paths pointing at the nodes for which `comparator` returned `true`.
   * ```js
   * treeUtils.filter(node => node.get('type') === 'folder');
   * //List [ Seq[], Seq["childNodes", 0], Seq["childNodes", 1] ]
   * ```
   *
   * ###### Signature:
   * ```js
   * filter(
   *     state: Immutable.Iterable,
   *     comparator: Function,
   *     path?: Immutable.Seq<string|number>
   * ): List<Immutable.Seq<string|number>>
   * ```
   *
   * ###### Arguments:
   * * `comparator` - A function that gets passed a node and should return whether it fits the criteria or not.
   * * `path?` - An optional key path to the (sub)state you want to analyse: Default: The `TreeUtils` object's `rootPath`.
   *
   *
   * ###### Returns:
   * A >Immutable.List of all the key paths that point at nodes for which `comparator` returned `true`.
   */
	}, {
		key: 'filter',
		value: function filter(state, comparator, path) {
			var result = (0, _immutable.List)();
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.nodes(state, path)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var keyPath = _step3.value;

					if (comparator(state.getIn(keyPath)) === true) {
						result = result.push(keyPath);
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3['return']) {
						_iterator3['return']();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			return result;
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
	}, {
		key: 'byId',
		value: function byId(state, id) {
			var _this = this;

			return this.find(state, function (item) {
				return item.get(_this._idKey) === id;
			});
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
	}, {
		key: 'byArbitrary',
		value: function byArbitrary(state, idOrKeyPath) {
			return _immutable.Seq.isSeq(idOrKeyPath) ? idOrKeyPath : this.byId(state, idOrKeyPath);
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
	}, {
		key: 'nextSibling',
		value: function nextSibling(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath),
			    index = Number(keyPath.last()),
			    nextSiblingPath = keyPath.skipLast(1).concat(index + 1);
			if (state.hasIn(nextSiblingPath)) {
				return nextSiblingPath;
			}
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
	}, {
		key: 'previousSibling',
		value: function previousSibling(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath),
			    index = Number(keyPath.last());
			if (index > 0) {
				return keyPath.skipLast(1).concat(index - 1);
			}
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
	}, {
		key: 'firstChild',
		value: function firstChild(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath).concat([this._childNodesKey, 0]);
			if (state.hasIn(keyPath)) {
				return keyPath;
			}
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
	}, {
		key: 'lastChild',
		value: function lastChild(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath).concat([this._childNodesKey]),
			    item = state.getIn(keyPath);
			if (item && item.size > 0) {
				return keyPath.concat([item.size - 1]);
			}
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
	}, {
		key: 'siblings',
		value: function siblings(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath),
			    index = Number(keyPath.last()),
			    parentChildren = keyPath.skipLast(1),
			    item = state.getIn(parentChildren);
			if (typeof item !== 'undefined') {
				var result = (0, _immutable.List)();
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = item.keys()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var i = _step4.value;

						if (i !== index) {
							result = result.push(parentChildren.concat(i));
						}
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4['return']) {
							_iterator4['return']();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}

				return result;
			}
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
	}, {
		key: 'childNodes',
		value: function childNodes(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath).concat(this._childNodesKey),
			    item = state.getIn(keyPath);
			if (typeof item !== 'undefined') {
				var l = item.size,
				    result = (0, _immutable.List)();
				for (var i = 0; i < l; i++) {
					result = result.push(keyPath.concat(i));
				}
				return result;
			}
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
	}, {
		key: 'childAt',
		value: function childAt(state, idOrKeyPath, index) {
			var keyPath = this.byArbitrary(state, idOrKeyPath).concat(this._childNodesKey, index);
			if (state.hasIn(keyPath)) {
				return keyPath;
			}
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
	}, {
		key: 'descendants',
		value: function descendants(state, idOrKeyPath) {
			var _this2 = this;

			var keyPath = this.byArbitrary(state, idOrKeyPath);
			return this.filter(state, function (item) {
				return item.get(_this2._idKey) !== _this2.id(state, keyPath);
			}, keyPath);
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
	}, {
		key: 'childIndex',
		value: function childIndex(state, idOrKeyPath) {
			return Number(this.byArbitrary(state, idOrKeyPath).last());
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
	}, {
		key: 'hasChildNodes',
		value: function hasChildNodes(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath).concat(this._childNodesKey),
			    item = state.getIn(keyPath);
			return typeof item !== 'undefined' && item.size > 0;
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
	}, {
		key: 'numChildNodes',
		value: function numChildNodes(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath).concat(this._childNodesKey),
			    item = state.getIn(keyPath);
			return typeof item !== 'undefined' ? item.size : 0;
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
	}, {
		key: 'parent',
		value: function parent(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath);
			if (keyPath && keyPath.size) {
				return keyPath.slice(0, -2);
			}
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
   * Returns an >Immutable.List of all key paths that point at direct ancestors of the node at `idOrKeyPath`.
   */
	}, {
		key: 'ancestors',
		value: function ancestors(state, idOrKeyPath) {
			var _this3 = this;

			return this.byArbitrary(state, idOrKeyPath).reduceRight(function (memo, value, index, keyPath) {
				if ((index - _this3._rootPath.size) % 2 === 0 && index >= _this3._rootPath.size) {
					return memo.push(keyPath.takeLast(index).reverse().toSetSeq());
				}
				return memo;
			}, (0, _immutable.List)());
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
	}, {
		key: 'position',
		value: function position(state, idOrKeyPath) {
			var _this4 = this;

			return Number('1.' + this.byArbitrary(state, idOrKeyPath).reduceRight(function (memo, value, index) {
				if (index >= _this4._rootPath.size && index % 2 === 0) {
					return value.toString() + memo;
				}
				return memo;
			}, ''));
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
   * * undefined
   *
   * ```js
   * let nodePath = treeUtils.byId(state, 'root');
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
	}, {
		key: 'right',
		value: function right(state, idOrKeyPath) {
			var l = this._rootPath.size,
			    keyPath = this.byArbitrary(state, idOrKeyPath),
			    firstChild = this.firstChild(state, keyPath);

			if (firstChild) {
				return firstChild;
			}

			var nextSibling = this.nextSibling(state, keyPath);
			if (nextSibling) {
				return nextSibling;
			}

			var parent = this.parent(state, keyPath),
			    nextSiblingOfParent = undefined;

			while (parent && parent.size >= l) {
				nextSiblingOfParent = this.nextSibling(state, parent);
				if (nextSiblingOfParent) {
					return nextSiblingOfParent;
				}
				parent = this.parent(state, parent);
			}
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
   * * undefined
   *
   * ```js
   * let nodePath = treeUtils.lastDescendant(state, 'root');
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
	}, {
		key: 'left',
		value: function left(state, idOrKeyPath) {
			var keyPath = this.byArbitrary(state, idOrKeyPath),
			    lastChild = this.previousSibling(state, keyPath);

			while (lastChild) {
				if (!this.hasChildNodes(state, lastChild)) {
					return lastChild;
				}
				lastChild = this.lastChild(state, lastChild);
			}

			var parent = this.parent(state, keyPath);

			if (parent && parent.size >= this._rootPath.size) {
				return parent;
			}
		}

		/**
   * @id TreeUtils-firstDescendant
   * @lookup firstDescendant
   *
   * #### *method* firstDescendant()
   *
   * Alias of >firstChild.
   */
	}, {
		key: 'firstDescendant',
		value: function firstDescendant(state, idOrKeyPath) {
			return this.firstChild(state, idOrKeyPath);
		}

		/**
   * @id TreeUtils-lastDescendant
   * @lookup lastDescendant
   *
   * #### *method* lastDescendant()
   *
   * Returns the key path to the next node to the left. The next left node is either:
   * * The last descendant of the previous sibling node.
   * * The previous sibling node.
   * * The parent node.
   * * undefined
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
	}, {
		key: 'lastDescendant',
		value: function lastDescendant(state, idOrKeyPath) {
			var keyPath = this.lastChild(state, idOrKeyPath);
			while (keyPath && this.hasChildNodes(state, keyPath)) {
				keyPath = this.lastChild(state, keyPath);
			}
			return keyPath;
		}
	}]);

	return TreeUtils;
})();

exports['default'] = TreeUtils;
module.exports = exports['default'];