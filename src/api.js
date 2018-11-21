var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Map } from './types';
var bindMethods = function (methods) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return methods.reduce(function (acc, factory, name) {
        var _a;
        return (__assign({}, acc, (_a = {}, _a[name] = factory.bind.apply(factory, [null].concat(args)), _a)));
    }, {});
};
export function APIFactory(_a) {
    var options = _a.options, methods = _a.methods;
    return {
        create: function () {
            return bindMethods(Map(methods), options);
        },
        withState: function (state, reducer) {
            return reducer(bindMethods(methods, options, state));
        },
    };
}
