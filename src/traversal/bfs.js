import { List, } from '../types';
var visit = function (options, iterator, queue) {
    while (queue.size > 0) {
        var _a = queue.first(), node = _a[0], keyPath = _a[1];
        var childNodesPath = keyPath.push(options.childNodesKey);
        queue = queue.shift();
        if (iterator(node, keyPath) === false) {
            return false;
        }
        var childNodes = node.get(options.childNodesKey);
        if (!childNodes) {
            continue;
        }
        var numChildNodes = childNodes.size;
        if (!numChildNodes) {
            continue;
        }
        for (var i = 0; i < numChildNodes; i++) {
            queue = queue.push([childNodes.get(i), childNodesPath.push(i)]);
        }
    }
};
var visitReverse = function (options, iterator, queue) {
    while (queue.size > 0) {
        var _a = queue.first(), node = _a[0], keyPath = _a[1];
        var childNodesPath = keyPath.push(options.childNodesKey);
        queue = queue.shift();
        if (iterator(node, keyPath) === false) {
            return false;
        }
        var childNodes = node.get(options.childNodesKey);
        if (!childNodes) {
            continue;
        }
        var numChildNodes = childNodes.size;
        if (!numChildNodes) {
            continue;
        }
        for (var i = numChildNodes - 1; i >= 0; i--) {
            queue = queue.push([childNodes.get(i), childNodesPath.push(i)]);
        }
    }
};
export var BFS = function (options, state, iterator, path) {
    if (path === void 0) { path = null; }
    var keyPath = path || options.rootPath;
    var queue = List().push([
        state.getIn(keyPath),
        keyPath,
    ]);
    visit(options, iterator, queue);
};
export var ReverseBFS = function (options, state, iterator, path) {
    if (path === void 0) { path = null; }
    var keyPath = path || options.rootPath;
    var queue = List().push([
        state.getIn(keyPath),
        keyPath,
    ]);
    visitReverse(options, iterator, queue);
};
