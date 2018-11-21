var getDefaultNode = function (opts) {
    var _a;
    return (_a = {},
        _a[opts.childNodesKey] = [],
        _a);
};
export var generateTree = function (opts, width, depth, currentDepth, getNode) {
    if (currentDepth === void 0) { currentDepth = 0; }
    if (getNode === void 0) { getNode = getDefaultNode; }
    var node = getNode(opts);
    if (currentDepth < depth) {
        for (var i = 0; i < width; i++) {
            node[opts.childNodesKey].push(generateTree(opts, width, depth, currentDepth + 1, getNode));
        }
    }
    return node;
};
export var calculateNumNodes = function (width, depth) {
    return (Math.pow(width, depth + 1) - 1) / (width - 1);
};
