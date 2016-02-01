var common_1 = require("../common/common");
function ArrayType(type, mode) {
    var _this = this;
    function arrayWrap(val) { return common_1.isArray(val) ? val : (common_1.isDefined(val) ? [val] : []); }
    function arrayUnwrap(val) {
        switch (val.length) {
            case 0: return undefined;
            case 1: return mode === "auto" ? val[0] : val;
            default: return val;
        }
    }
    function arrayHandler(callback, allTruthyMode) {
        return function handleArray(val) {
            var arr = arrayWrap(val);
            var result = common_1.map(arr, callback);
            return (allTruthyMode === true) ? common_1.filter(result, function (val) { return !val; }).length === 0 : arrayUnwrap(result);
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
    ['encode', 'decode', 'equals', '$normalize'].map(function (name) {
        _this[name] = (name === 'equals' ? arrayEqualsHandler : arrayHandler)(type[name].bind(type));
    });
    common_1.extend(this, {
        name: type.name,
        pattern: type.pattern,
        is: arrayHandler(type.is.bind(type), true),
        $arrayMode: mode
    });
}
var Type = (function () {
    function Type(def) {
        this.pattern = /.*/;
        common_1.extend(this, def);
    }
    Type.prototype.is = function (val, key) { return true; };
    Type.prototype.encode = function (val, key) { return val; };
    Type.prototype.decode = function (val, key) { return val; };
    Type.prototype.equals = function (a, b) { return a == b; };
    Type.prototype.$subPattern = function () {
        var sub = this.pattern.toString();
        return sub.substr(1, sub.length - 2);
    };
    Type.prototype.toString = function () {
        return "{Type:" + this.name + "}";
    };
    Type.prototype.$normalize = function (val) {
        return this.is(val) ? val : this.decode(val);
    };
    Type.prototype.$asArray = function (mode, isSearch) {
        if (!mode)
            return this;
        if (mode === "auto" && !isSearch)
            throw new Error("'auto' array mode is for query parameters only");
        return new ArrayType(this, mode);
    };
    return Type;
})();
exports.Type = Type;
//# sourceMappingURL=type.js.map