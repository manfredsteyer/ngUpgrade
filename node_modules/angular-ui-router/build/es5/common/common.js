var isDefined = angular.isDefined, isFunction = angular.isFunction, isNumber = angular.isNumber, isString = angular.isString, isObject = angular.isObject, isArray = angular.isArray, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, noop = angular.noop, toJson = angular.toJson, fromJson = angular.fromJson, equals = angular.equals, identity = angular.identity;
exports.isDefined = isDefined;
exports.isFunction = isFunction;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isObject = isObject;
exports.isArray = isArray;
exports.forEach = forEach;
exports.extend = extend;
exports.copy = copy;
exports.noop = noop;
exports.toJson = toJson;
exports.fromJson = fromJson;
exports.equals = equals;
exports.identity = identity;
exports.abstractKey = 'abstract';
function curry(fn) {
    var initial_args = [].slice.apply(arguments, [1]);
    var func_args_length = fn.length;
    function curried(args) {
        if (args.length >= func_args_length)
            return fn.apply(null, args);
        return function () {
            return curried(args.concat([].slice.apply(arguments)));
        };
    }
    return curried(initial_args);
}
exports.curry = curry;
function compose() {
    var args = arguments;
    var start = args.length - 1;
    return function () {
        var i = start, result = args[start].apply(this, arguments);
        while (i--)
            result = args[i].call(this, result);
        return result;
    };
}
exports.compose = compose;
function pipe() {
    var funcs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        funcs[_i - 0] = arguments[_i];
    }
    return compose.apply(null, [].slice.call(arguments).reverse());
}
exports.pipe = pipe;
exports.prop = function (name) { return function (obj) { return obj && obj[name]; }; };
exports.propEq = curry(function (name, val, obj) { return obj && obj[name] === val; });
exports.parse = function (name) { return pipe.apply(null, name.split(".").map(exports.prop)); };
exports.not = function (fn) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    return !fn.apply(null, args);
}; };
function and(fn1, fn2) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return fn1.apply(null, args) && fn2.apply(null, args);
    };
}
exports.and = and;
function or(fn1, fn2) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return fn1.apply(null, args) || fn2.apply(null, args);
    };
}
exports.or = or;
exports.is = function (ctor) { return function (obj) { return (obj != null && obj.constructor === ctor || obj instanceof ctor); }; };
exports.eq = function (val) { return function (other) { return val === other; }; };
exports.val = function (v) { return function () { return v; }; };
function invoke(fnName, args) {
    return function (obj) { return obj[fnName].apply(obj, args); };
}
exports.invoke = invoke;
function pattern(struct) {
    return function (val) {
        for (var i = 0; i < struct.length; i++) {
            if (struct[i][0](val))
                return struct[i][1](val);
        }
    };
}
exports.pattern = pattern;
exports.inherit = function (parent, extra) { return extend(new (extend(function () { }, { prototype: parent }))(), extra); };
var restArgs = function (args, idx) {
    if (idx === void 0) { idx = 0; }
    return Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(args, idx));
};
var inArray = function (array, obj) { return array.indexOf(obj) !== -1; };
exports.removeFrom = function (array) { return function (obj) {
    var idx = array.indexOf(obj);
    if (idx >= 0)
        array.splice(idx, 1);
    return array;
}; };
function defaults(opts) {
    if (opts === void 0) { opts = {}; }
    var defaultsList = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        defaultsList[_i - 1] = arguments[_i];
    }
    var defaults = merge.apply(null, [{}].concat(defaultsList));
    return extend({}, defaults, pick(opts || {}, Object.keys(defaults)));
}
exports.defaults = defaults;
function merge(dst) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    forEach(objs, function (obj) {
        forEach(obj, function (value, key) {
            if (!dst.hasOwnProperty(key))
                dst[key] = value;
        });
    });
    return dst;
}
exports.merge = merge;
exports.mergeR = function (memo, item) { return extend(memo, item); };
function ancestors(first, second) {
    var path = [];
    for (var n in first.path) {
        if (first.path[n] !== second.path[n])
            break;
        path.push(first.path[n]);
    }
    return path;
}
exports.ancestors = ancestors;
function equalForKeys(a, b, keys) {
    if (keys === void 0) { keys = Object.keys(a); }
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (a[k] != b[k])
            return false;
    }
    return true;
}
exports.equalForKeys = equalForKeys;
function pickOmitImpl(predicate, obj) {
    var objCopy = {}, keys = restArgs(arguments, 2);
    for (var key in obj) {
        if (predicate(keys, key))
            objCopy[key] = obj[key];
    }
    return objCopy;
}
function pick(obj) { return pickOmitImpl.apply(null, [inArray].concat(restArgs(arguments))); }
exports.pick = pick;
function omit(obj) { return pickOmitImpl.apply(null, [exports.not(inArray)].concat(restArgs(arguments))); }
exports.omit = omit;
function pluck(collection, propName) {
    return map(collection, exports.prop(propName));
}
exports.pluck = pluck;
function filter(collection, callback) {
    var arr = isArray(collection), result = arr ? [] : {};
    var accept = arr ? function (x) { return result.push(x); } : function (x, key) { return result[key] = x; };
    forEach(collection, function (item, i) {
        if (callback(item, i))
            accept(item, i);
    });
    return result;
}
exports.filter = filter;
function find(collection, callback) {
    var result;
    forEach(collection, function (item, i) {
        if (result)
            return;
        if (callback(item, i))
            result = item;
    });
    return result;
}
exports.find = find;
function map(collection, callback) {
    var result = isArray(collection) ? [] : {};
    forEach(collection, function (item, i) { return result[i] = callback(item, i); });
    return result;
}
exports.map = map;
exports.values = function (obj) { return Object.keys(obj).map(function (key) { return obj[key]; }); };
exports.allTrueR = function (memo, elem) { return memo && elem; };
exports.anyTrueR = function (memo, elem) { return memo || elem; };
exports.pushR = function (arr, obj) { arr.push(obj); return arr; };
exports.unnestR = function (memo, elem) { return memo.concat(elem); };
exports.flattenR = function (memo, elem) { return isArray(elem) ? memo.concat(elem.reduce(exports.flattenR, [])) : exports.pushR(memo, elem); };
exports.unnest = function (arr) { return arr.reduce(exports.unnestR, []); };
exports.flatten = function (arr) { return arr.reduce(exports.flattenR, []); };
function assertPredicate(fn, errMsg) {
    if (errMsg === void 0) { errMsg = "assert failure"; }
    return function (obj) {
        if (!fn(obj))
            throw new Error(errMsg);
        return true;
    };
}
exports.assertPredicate = assertPredicate;
exports.pairs = function (object) { return Object.keys(object).map(function (key) { return [key, object[key]]; }); };
function arrayTuples() {
    var arrayArgs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arrayArgs[_i - 0] = arguments[_i];
    }
    if (arrayArgs.length === 0)
        return [];
    var length = arrayArgs.reduce(function (min, arr) { return Math.min(arr.length, min); }, 9007199254740991);
    return Array.apply(null, Array(length)).map(function (ignored, idx) { return arrayArgs.map(function (arr) { return arr[idx]; }).reduce(exports.pushR, []); });
}
exports.arrayTuples = arrayTuples;
function applyPairs(memo, keyValTuple) {
    var key, value;
    if (isArray(keyValTuple))
        key = keyValTuple[0], value = keyValTuple[1];
    if (!isString(key))
        throw new Error("invalid parameters to applyPairs");
    memo[key] = value;
    return memo;
}
exports.applyPairs = applyPairs;
function isInjectable(val) {
    if (isArray(val) && val.length) {
        var head = val.slice(0, -1), tail_1 = val.slice(-1);
        if (head.filter(exports.not(isString)).length || tail_1.filter(exports.not(isFunction)).length)
            return false;
    }
    return isFunction(val);
}
exports.isInjectable = isInjectable;
exports.isNull = function (o) { return o === null; };
exports.isPromise = and(isObject, pipe(exports.prop('then'), isFunction));
function fnToString(fn) {
    var _fn = pattern([
        [isArray, function (arr) { return arr.slice(-1)[0]; }],
        [exports.val(true), identity]
    ])(fn);
    return _fn && _fn.toString() || "undefined";
}
exports.fnToString = fnToString;
function maxLength(max, str) {
    if (str.length <= max)
        return str;
    return str.substr(0, max - 3) + "...";
}
exports.maxLength = maxLength;
function padString(length, str) {
    while (str.length < length)
        str += " ";
    return str;
}
exports.padString = padString;
function tail(collection) {
    return collection.length && collection[collection.length - 1] || undefined;
}
exports.tail = tail;
angular.module('ui.router.util', ['ng', 'ui.router.init']);
angular.module('ui.router.router', ['ui.router.util']);
angular.module('ui.router.state', ['ui.router.router', 'ui.router.util', 'ui.router.angular1']);
angular.module('ui.router', ['ui.router.init', 'ui.router.state', 'ui.router.angular1']);
angular.module('ui.router.compat', ['ui.router']);
//# sourceMappingURL=common.js.map