let { isDefined, isFunction, isNumber, isString, isObject, isArray, forEach, extend, copy, noop, toJson, fromJson, equals, identity } = angular;
export { isDefined, isFunction, isNumber, isString, isObject, isArray, forEach, extend, copy, noop, toJson, fromJson, equals, identity };
export var abstractKey = 'abstract';
export function curry(fn) {
    let initial_args = [].slice.apply(arguments, [1]);
    let func_args_length = fn.length;
    function curried(args) {
        if (args.length >= func_args_length)
            return fn.apply(null, args);
        return function () {
            return curried(args.concat([].slice.apply(arguments)));
        };
    }
    return curried(initial_args);
}
export function compose() {
    let args = arguments;
    let start = args.length - 1;
    return function () {
        let i = start, result = args[start].apply(this, arguments);
        while (i--)
            result = args[i].call(this, result);
        return result;
    };
}
export function pipe(...funcs) {
    return compose.apply(null, [].slice.call(arguments).reverse());
}
export const prop = (name) => (obj) => obj && obj[name];
export const propEq = curry((name, val, obj) => obj && obj[name] === val);
export const parse = (name) => pipe.apply(null, name.split(".").map(prop));
export const not = (fn) => (...args) => !fn.apply(null, args);
export function and(fn1, fn2) {
    return (...args) => fn1.apply(null, args) && fn2.apply(null, args);
}
export function or(fn1, fn2) {
    return (...args) => fn1.apply(null, args) || fn2.apply(null, args);
}
export const is = ctor => obj => (obj != null && obj.constructor === ctor || obj instanceof ctor);
export const eq = (val) => (other) => val === other;
export const val = (v) => () => v;
export function invoke(fnName, args) {
    return (obj) => obj[fnName].apply(obj, args);
}
export function pattern(struct) {
    return function (val) {
        for (var i = 0; i < struct.length; i++) {
            if (struct[i][0](val))
                return struct[i][1](val);
        }
    };
}
export const inherit = (parent, extra) => extend(new (extend(function () { }, { prototype: parent }))(), extra);
const restArgs = (args, idx = 0) => Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(args, idx));
const inArray = (array, obj) => array.indexOf(obj) !== -1;
export const removeFrom = (array) => (obj) => {
    let idx = array.indexOf(obj);
    if (idx >= 0)
        array.splice(idx, 1);
    return array;
};
export function defaults(opts = {}, ...defaultsList) {
    let defaults = merge.apply(null, [{}].concat(defaultsList));
    return extend({}, defaults, pick(opts || {}, Object.keys(defaults)));
}
export function merge(dst, ...objs) {
    forEach(objs, function (obj) {
        forEach(obj, function (value, key) {
            if (!dst.hasOwnProperty(key))
                dst[key] = value;
        });
    });
    return dst;
}
export const mergeR = (memo, item) => extend(memo, item);
export function ancestors(first, second) {
    let path = [];
    for (var n in first.path) {
        if (first.path[n] !== second.path[n])
            break;
        path.push(first.path[n]);
    }
    return path;
}
export function equalForKeys(a, b, keys = Object.keys(a)) {
    for (var i = 0; i < keys.length; i++) {
        let k = keys[i];
        if (a[k] != b[k])
            return false;
    }
    return true;
}
function pickOmitImpl(predicate, obj) {
    let objCopy = {}, keys = restArgs(arguments, 2);
    for (var key in obj) {
        if (predicate(keys, key))
            objCopy[key] = obj[key];
    }
    return objCopy;
}
export function pick(obj) { return pickOmitImpl.apply(null, [inArray].concat(restArgs(arguments))); }
export function omit(obj) { return pickOmitImpl.apply(null, [not(inArray)].concat(restArgs(arguments))); }
export function pluck(collection, propName) {
    return map(collection, prop(propName));
}
export function filter(collection, callback) {
    let arr = isArray(collection), result = arr ? [] : {};
    let accept = arr ? x => result.push(x) : (x, key) => result[key] = x;
    forEach(collection, function (item, i) {
        if (callback(item, i))
            accept(item, i);
    });
    return result;
}
export function find(collection, callback) {
    let result;
    forEach(collection, function (item, i) {
        if (result)
            return;
        if (callback(item, i))
            result = item;
    });
    return result;
}
export function map(collection, callback) {
    let result = isArray(collection) ? [] : {};
    forEach(collection, (item, i) => result[i] = callback(item, i));
    return result;
}
export const values = (obj) => Object.keys(obj).map(key => obj[key]);
export const allTrueR = (memo, elem) => memo && elem;
export const anyTrueR = (memo, elem) => memo || elem;
export const pushR = (arr, obj) => { arr.push(obj); return arr; };
export const unnestR = (memo, elem) => memo.concat(elem);
export const flattenR = (memo, elem) => isArray(elem) ? memo.concat(elem.reduce(flattenR, [])) : pushR(memo, elem);
export const unnest = (arr) => arr.reduce(unnestR, []);
export const flatten = (arr) => arr.reduce(flattenR, []);
export function assertPredicate(fn, errMsg = "assert failure") {
    return (obj) => {
        if (!fn(obj))
            throw new Error(errMsg);
        return true;
    };
}
export const pairs = (object) => Object.keys(object).map(key => [key, object[key]]);
export function arrayTuples(...arrayArgs) {
    if (arrayArgs.length === 0)
        return [];
    let length = arrayArgs.reduce((min, arr) => Math.min(arr.length, min), 9007199254740991);
    return Array.apply(null, Array(length)).map((ignored, idx) => arrayArgs.map(arr => arr[idx]).reduce(pushR, []));
}
export function applyPairs(memo, keyValTuple) {
    let key, value;
    if (isArray(keyValTuple))
        [key, value] = keyValTuple;
    if (!isString(key))
        throw new Error("invalid parameters to applyPairs");
    memo[key] = value;
    return memo;
}
export function isInjectable(val) {
    if (isArray(val) && val.length) {
        let head = val.slice(0, -1), tail = val.slice(-1);
        if (head.filter(not(isString)).length || tail.filter(not(isFunction)).length)
            return false;
    }
    return isFunction(val);
}
export const isNull = o => o === null;
export const isPromise = and(isObject, pipe(prop('then'), isFunction));
export function fnToString(fn) {
    let _fn = pattern([
        [isArray, arr => arr.slice(-1)[0]],
        [val(true), identity]
    ])(fn);
    return _fn && _fn.toString() || "undefined";
}
export function maxLength(max, str) {
    if (str.length <= max)
        return str;
    return str.substr(0, max - 3) + "...";
}
export function padString(length, str) {
    while (str.length < length)
        str += " ";
    return str;
}
export function tail(collection) {
    return collection.length && collection[collection.length - 1] || undefined;
}
angular.module('ui.router.util', ['ng', 'ui.router.init']);
angular.module('ui.router.router', ['ui.router.util']);
angular.module('ui.router.state', ['ui.router.router', 'ui.router.util', 'ui.router.angular1']);
angular.module('ui.router', ['ui.router.init', 'ui.router.state', 'ui.router.angular1']);
angular.module('ui.router.compat', ['ui.router']);
//# sourceMappingURL=common.js.map