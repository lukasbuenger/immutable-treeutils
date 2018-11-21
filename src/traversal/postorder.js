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
    var ret;
    for (var i = 0; i < numChildNodes; i++) {
        ret = visit(options, iterator, childNodes.get(i), childNodesPath.push(i));
        if (ret === false) {
            return false;
        }
    }
    return iterator(node, keyPath);
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
    var ret;
    for (var i = numChildNodes - 1; i >= 0; i--) {
        ret = visitReverse(options, iterator, childNodes.get(i), childNodesPath.push(i));
        if (ret === false) {
            return false;
        }
    }
    return iterator(node, keyPath);
};
export var PostOrder = function (options, state, iterator, rootPath) {
    if (rootPath === void 0) { rootPath = null; }
    var keyPath = rootPath || options.rootPath;
    var rootNode = state.getIn(keyPath);
    visit(options, iterator, rootNode, keyPath);
};
export var ReversePostOrder = function (options, state, iterator, rootPath) {
    if (rootPath === void 0) { rootPath = null; }
    var keyPath = rootPath || options.rootPath;
    var rootNode = state.getIn(keyPath);
    visitReverse(options, iterator, rootNode, keyPath);
};
