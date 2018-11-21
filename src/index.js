import { List } from './types';
import { APIFactory } from './api';
import { Preorder } from './traversal/preorder';
import { firstDescendant, ancestors, childAt, childIndex, childNodes, depth, descendants, filter, find, findId, firstChild, getId, hasChildNodes, lastChild, lastDescendant, left, nextSibling, nodes, numChildNodes, parent, position, previousSibling, reduceTree, right, siblings, } from './methods';
export var defaultOptions = {
    rootPath: List([]),
    childNodesKey: 'childNodes',
    idKey: 'id',
    traversalMethod: Preorder,
};
export var defaultMethods = {
    firstDescendant: firstDescendant,
    ancestors: ancestors,
    childAt: childAt,
    childIndex: childIndex,
    childNodes: childNodes,
    depth: depth,
    descendants: descendants,
    filter: filter,
    find: find,
    findId: findId,
    firstChild: firstChild,
    getId: getId,
    hasChildNodes: hasChildNodes,
    lastChild: lastChild,
    lastDescendant: lastDescendant,
    left: left,
    nextSibling: nextSibling,
    nodes: nodes,
    numChildNodes: numChildNodes,
    parent: parent,
    position: position,
    previousSibling: previousSibling,
    reduceTree: reduceTree,
    right: right,
    siblings: siblings,
};
var factory = APIFactory({
    options: defaultOptions,
    methods: defaultMethods,
});
export default factory.create();
