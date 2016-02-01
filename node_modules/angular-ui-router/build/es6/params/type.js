import { extend, isArray, isDefined, filter, map } from "../common/common";
function ArrayType(type, mode) {
    function arrayWrap(val) { return isArray(val) ? val : (isDefined(val) ? [val] : []); }
    function arrayUnwrap(val) {
        switch (val.length) {
            case 0: return undefined;
            case 1: return mode === "auto" ? val[0] : val;
            default: return val;
        }
    }
    function arrayHandler(callback, allTruthyMode) {
        return function handleArray(val) {
            let arr = arrayWrap(val);
            var result = map(arr, callback);
            return (allTruthyMode === true) ? filter(result, val => !val).length === 0 : arrayUnwrap(result);
        };
    }
    function arrayEqualsHandler(callback) {
        return function handleArray(val1, val2) {
            var left = arrayWrap(val1), right = arrayWrap(val2);
            if (left.length !== right.length)
                return false;
            for (var i = 0; i < left.length; i++) {
                if (!callback(left[i], right[i]))
                    return false;
            }
            return true;
        };
    }
    ['encode', 'decode', 'equals', '$normalize'].map(name => {
        this[name] = (name === 'equals' ? arrayEqualsHandler : arrayHandler)(type[name].bind(type));
    });
    extend(this, {
        name: type.name,
        pattern: type.pattern,
        is: arrayHandler(type.is.bind(type), true),
        $arrayMode: mode
    });
}
export class Type {
    constructor(def) {
        this.pattern = /.*/;
        extend(this, def);
    }
    is(val, key) { return true; }
    encode(val, key) { return val; }
    decode(val, key) { return val; }
    equals(a, b) { return a == b; }
    $subPattern() {
        var sub = this.pattern.toString();
        return sub.substr(1, sub.length - 2);
    }
    toString() {
        return `{Type:${this.name}}`;
    }
    $normalize(val) {
        return this.is(val) ? val : this.decode(val);
    }
    $asArray(mode, isSearch) {
        if (!mode)
            return this;
        if (mode === "auto" && !isSearch)
            throw new Error("'auto' array mode is for query parameters only");
        return new ArrayType(this, mode);
    }
}
//# sourceMappingURL=type.js.map