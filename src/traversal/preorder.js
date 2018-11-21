var visit = function (options, iterator, node, keyPath) {
    var childNodesPath = keyPath.push(options.childNodesKey);
    var childNodes = node.get(options.childNodesKey);
    var ret = iterator(node, keyPath);
    if (!childNodes || ret === false) {
        return ret;
    }
    var numChildNodes = childNodes.size;
    if (!numChildNodes) {
        return;
    }
    for (var i = 0; i < numChildNodes; i++) {
        ret = visit(options, iterator, childNodes.get(i), childNodesPath.push(i));
        if (ret === false) {
            return false;
        }
    }
};
var visitReverse = function (options, iterator, node, keyPath) {
    var childNodesPath = keyPath.push(options.childNodesKey);
    var childNodes = node.get(options.childNodesKey);
    var ret = iterator(node, keyPath);
    if (!childNodes || ret === false) {
        return ret;
    }
    var numChildNodes = childNodes.size;
    if (!numChildNodes) {
        return;
    }
    for (var i = numChildNodes - 1; i >= 0; i--) {
        ret = visitReverse(options, iterator, childNodes.get(i), childNodesPath.push(i));
        if (ret === false) {
            return false;
        }
    }
};
export var Preorder = function (options, state, iterator, rootPath) {
    var keyPath = rootPath || options.rootPath;
    var rootNode = state.getIn(keyPath);
    visit(options, iterator, rootNode, keyPath);
};
export var ReversePreorder = function (options, state, iterator, rootPath) {
    var keyPath = rootPath || options.rootPath;
    var rootNode = state.getIn(keyPath);
    visitReverse(options, iterator, rootNode, keyPath);
};
