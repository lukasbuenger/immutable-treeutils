var visit = function (options, iterator, node, keyPath) {
    var childNodesPath = keyPath.push(options.childNodesKey);
    var childNodes = node.get(options.childNodesKey);
    if (!childNodes) {
        return iterator(node, keyPath);
    }
    var numChildNodes = childNodes.size;
    if (!numChildNodes) {
        return iterator(node, keyPath);
    }
    var edge = Math.ceil(numChildNodes / 2);
    var ret;
    for (var i = 0; i < edge; i++) {
        ret = visit(options, iterator, childNodes.get(i), childNodesPath.push(i));
        if (ret === false) {
            return false;
        }
    }
    ret = iterator(node, keyPath);
    if (ret === false) {
        return false;
    }
    if (numChildNodes < 2) {
        return;
    }
    for (var i = edge; i < numChildNodes; i++) {
        ret = visit(options, iterator, childNodes.get(i), childNodesPath.push(i));
        if (ret === false) {
            return false;
        }
    }
};
var visitReverse = function (options, iterator, node, keyPath) {
    var childNodesPath = keyPath.push(options.childNodesKey);
    var childNodes = node.get(options.childNodesKey);
    if (!childNodes) {
        return iterator(node, keyPath);
    }
    var numChildNodes = childNodes.size;
    if (!numChildNodes) {
        return iterator(node, keyPath);
    }
    var edge = Math.floor(numChildNodes / 2);
    var ret;
    for (var i = numChildNodes - 1; i >= edge; i--) {
        ret = visitReverse(options, iterator, childNodes.get(i), childNodesPath.push(i));
        if (ret === false) {
            return false;
        }
    }
    ret = iterator(node, keyPath);
    if (ret === false) {
        return false;
    }
    if (numChildNodes < 2) {
        return;
    }
    for (var i = edge - 1; i >= 0; i--) {
        ret = visitReverse(options, iterator, childNodes.get(i), childNodesPath.push(i));
        if (ret === false) {
            return false;
        }
    }
};
export var InOrder = function (options, state, iterator, rootPath) {
    if (rootPath === void 0) { rootPath = null; }
    var keyPath = rootPath || options.rootPath;
    var rootNode = state.getIn(keyPath);
    visit(options, iterator, rootNode, keyPath);
};
export var ReverseInOrder = function (options, state, iterator, rootPath) {
    if (rootPath === void 0) { rootPath = null; }
    var keyPath = rootPath || options.rootPath;
    var rootNode = state.getIn(keyPath);
    visitReverse(options, iterator, rootNode, keyPath);
};
