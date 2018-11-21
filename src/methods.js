import { List, } from './types';
export var reduceTree = function (options, state, reducer, initial, path) {
    var reduction = initial;
    var stopped = false;
    var stop = function (value) {
        stopped = true;
        return value;
    };
    options.traversalMethod(options, state, function (node, keyPath) {
        reduction = reducer(reduction, node, keyPath, stop);
        if (stopped) {
            return false;
        }
    }, path);
    return reduction;
};
export var nodes = function (options, state, path) {
    return (reduceTree(options, state, function (acc, _, keyPath) { return acc.push(keyPath); }, List(), path));
};
export var find = function (options, state, comparator, path, notSetValue) {
    return (reduceTree(options, state, function (acc, node, keyPath, stop) {
        return comparator(node, keyPath) === true ? stop(keyPath) : acc;
    }, notSetValue, path));
};
export var filter = function (options, state, comparator, path) {
    return (reduceTree(options, state, function (acc, node, keyPath) {
        return comparator(node, keyPath) === true ? acc.push(keyPath) : acc;
    }, List(), path));
};
export var findId = function (options, state, idOrKeyPath, path, notSetValue) {
    return List.isList(idOrKeyPath)
        ? idOrKeyPath
        : (reduceTree(options, state, function (acc, node, keyPath, stop) {
            return node.get(options.idKey) === idOrKeyPath
                ? stop(keyPath)
                : acc;
        }, notSetValue, path));
};
export var getId = function (options, state, keyPath, notSetValue) {
    return state.getIn(keyPath.push(options.idKey), notSetValue);
};
export var nextSibling = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var index = Number(keyPath.last());
    var nextSiblingPath = keyPath.pop().push(index + 1);
    if (state.hasIn(nextSiblingPath)) {
        return nextSiblingPath;
    }
    return notSetValue;
};
export var previousSibling = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var index = Number(keyPath.last());
    if (index < 1) {
        return notSetValue;
    }
    var previousSiblingPath = keyPath.pop().push(index - 1);
    if (state.hasIn(previousSiblingPath)) {
        return previousSiblingPath;
    }
    return notSetValue;
};
export var firstChild = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var firstChildPath = keyPath.push(options.childNodesKey, 0);
    if (state.hasIn(firstChildPath)) {
        return firstChildPath;
    }
    return notSetValue;
};
export var lastChild = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var childNodesPath = keyPath.push(options.childNodesKey);
    var maybeChildNodes = state.getIn(childNodesPath);
    if (maybeChildNodes && maybeChildNodes.size > 0) {
        return keyPath.push(maybeChildNodes.size - 1);
    }
    return notSetValue;
};
export var siblings = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var index = Number(keyPath.last());
    var parentChildNodesPath = keyPath.pop();
    var parentChildNodes = state.getIn(parentChildNodesPath);
    if (!parentChildNodes) {
        return notSetValue;
    }
    return parentChildNodes.reduce(function (result, _, i) {
        return i !== index
            ? result.push(parentChildNodesPath.push(i))
            : result;
    }, List());
};
export var childNodes = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var childNodesPath = keyPath.push(options.childNodesKey);
    var maybeChildNodes = state.getIn(childNodesPath);
    if (!maybeChildNodes) {
        return notSetValue;
    }
    return maybeChildNodes.reduce(function (acc, _, i) { return acc.push(childNodesPath.push(i)); }, List());
};
export var childAt = function (options, state, idOrKeyPath, index, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var childPath = keyPath.push(options.childNodesKey, index);
    if (state.hasIn(childPath)) {
        return childPath;
    }
    return notSetValue;
};
export var descendants = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var id = getId(options, state, keyPath, notSetValue);
    if (id === notSetValue) {
        return notSetValue;
    }
    return filter(options, state, function (n) { return n.get(options.idKey) !== id; }, keyPath);
};
export var childIndex = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    return Number(keyPath.last()) || notSetValue;
};
export var hasChildNodes = function (options, state, idOrKeyPath, path) {
    var keyPath = findId(options, state, idOrKeyPath, path);
    if (!keyPath) {
        return false;
    }
    var childNodesPath = keyPath.push(options.childNodesKey);
    var maybeChildNodes = state.getIn(childNodesPath);
    return Boolean(maybeChildNodes &&
        maybeChildNodes.size &&
        maybeChildNodes.size > 0);
};
export var numChildNodes = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var childNodesPath = keyPath.push(options.childNodesKey);
    var maybeChildNodes = state.getIn(childNodesPath);
    return (maybeChildNodes && maybeChildNodes.size) || 0;
};
export var parent = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    if (keyPath && keyPath.size) {
        return keyPath.slice(0, -2);
    }
    return notSetValue;
};
export var ancestors = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    return keyPath.reduceRight(function (acc, _, i) {
        return (i - options.rootPath.size) % 2 === 0 &&
            i >= options.rootPath.size
            ? acc.push(keyPath.take(i))
            : acc;
    }, List());
};
export var depth = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    return Math.floor(keyPath.skip(options.rootPath.size).size / 2);
};
export var position = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var order = keyPath.reduceRight(function (memo, value, index) {
        return index >= options.rootPath.size && index % 2 === 0
            ? value.toString() + memo
            : memo;
    }, '');
    return Number('1.'.concat(order.toString()));
};
export var right = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var l = options.rootPath.size;
    var firstChildPath = firstChild(options, state, keyPath);
    if (firstChildPath) {
        return firstChildPath;
    }
    var nextSiblingPath = nextSibling(options, state, keyPath);
    if (nextSiblingPath) {
        return nextSiblingPath;
    }
    var parentPath = parent(options, state, keyPath);
    var nextSiblingOfParent;
    while (parentPath && parentPath.size >= l) {
        nextSiblingOfParent = nextSibling(options, state, parentPath);
        if (nextSiblingOfParent) {
            return nextSiblingOfParent;
        }
        parentPath = parent(options, state, parentPath);
    }
    return notSetValue;
};
export var left = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = findId(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    var lastChildPath = previousSibling(options, state, keyPath);
    while (lastChildPath) {
        if (!hasChildNodes(options, state, lastChildPath)) {
            return lastChildPath;
        }
        lastChildPath = lastChild(options, state, lastChild);
    }
    var parentPath = parent(options, state, keyPath);
    if (parentPath && parentPath.size >= options.rootPath.size) {
        return parentPath;
    }
    return notSetValue;
};
export var firstDescendant = firstChild;
export var lastDescendant = function (options, state, idOrKeyPath, path, notSetValue) {
    var keyPath = lastChild(options, state, idOrKeyPath, path, notSetValue);
    if (keyPath === notSetValue) {
        return notSetValue;
    }
    while (keyPath && hasChildNodes(options, state, keyPath)) {
        keyPath = lastChild(options, state, keyPath);
    }
    return keyPath;
};
