var common_1 = require("../common/common");
var module_1 = require("../params/module");
function quoteRegExp(string, param) {
    var surroundPattern = ['', ''], result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
    if (!param)
        return result;
    switch (param.squash) {
        case false:
            surroundPattern = ['(', ')' + (param.isOptional ? '?' : '')];
            break;
        case true:
            surroundPattern = ['?(', ')?'];
            break;
        default:
            surroundPattern = [("(" + param.squash + "|"), ')?'];
            break;
    }
    return result + surroundPattern[0] + param.type.pattern.source + surroundPattern[1];
}
var memoizeTo = function (obj, prop, fn) { return obj[prop] = obj[prop] || fn(); };
var UrlMatcher = (function () {
    function UrlMatcher(pattern, config) {
        var _this = this;
        this.pattern = pattern;
        this.config = config;
        this._cache = { path: [], pattern: null };
        this._children = [];
        this._params = [];
        this._segments = [];
        this._compiled = [];
        this.config = common_1.defaults(this.config, {
            params: {},
            strict: true,
            caseInsensitive: false,
            paramMap: common_1.identity
        });
        var placeholder = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, searchPlaceholder = /([:]?)([\w\[\]-]+)|\{([\w\[\]-]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, last = 0, m, patterns = [];
        var checkParamErrors = function (id) {
            if (!UrlMatcher.nameValidator.test(id))
                throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
            if (common_1.find(_this._params, common_1.propEq('id', id)))
                throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
        };
        var matchDetails = function (m, isSearch) {
            var id = m[2] || m[3], regexp = isSearch ? m[4] : m[4] || (m[1] === '*' ? '.*' : null);
            return {
                id: id,
                regexp: regexp,
                cfg: _this.config.params[id],
                segment: pattern.substring(last, m.index),
                type: !regexp ? null : module_1.paramTypes.type(regexp || "string") || common_1.inherit(module_1.paramTypes.type("string"), {
                    pattern: new RegExp(regexp, _this.config.caseInsensitive ? 'i' : undefined)
                })
            };
        };
        var p, param, segment;
        while ((m = placeholder.exec(pattern))) {
            p = matchDetails(m, false);
            if (p.segment.indexOf('?') >= 0)
                break;
            checkParamErrors(p.id);
            this._params.push(module_1.Param.fromPath(p.id, p.type, this.config.paramMap(p.cfg, false)));
            this._segments.push(p.segment);
            patterns.push([p.segment, common_1.tail(this._params)]);
            last = placeholder.lastIndex;
        }
        segment = pattern.substring(last);
        var i = segment.indexOf('?');
        if (i >= 0) {
            var search = segment.substring(i);
            segment = segment.substring(0, i);
            if (search.length > 0) {
                last = 0;
                while ((m = searchPlaceholder.exec(search))) {
                    p = matchDetails(m, true);
                    checkParamErrors(p.id);
                    this._params.push(module_1.Param.fromSearch(p.id, p.type, this.config.paramMap(p.cfg, true)));
                    last = placeholder.lastIndex;
                }
            }
        }
        this._segments.push(segment);
        common_1.extend(this, {
            _compiled: patterns.map(function (pattern) { return quoteRegExp.apply(null, pattern); }).concat(quoteRegExp(segment)),
            prefix: this._segments[0]
        });
        Object.freeze(this);
    }
    UrlMatcher.prototype.append = function (url) {
        this._children.push(url);
        common_1.forEach(url._cache, function (val, key) { return url._cache[key] = common_1.isArray(val) ? [] : null; });
        url._cache.path = this._cache.path.concat(this);
        return url;
    };
    UrlMatcher.prototype.isRoot = function () {
        return this._cache.path.length === 0;
    };
    UrlMatcher.prototype.toString = function () {
        return this.pattern;
    };
    UrlMatcher.prototype.exec = function (path, search, hash, options) {
        var _this = this;
        if (search === void 0) { search = {}; }
        if (options === void 0) { options = {}; }
        var match = memoizeTo(this._cache, 'pattern', function () {
            return new RegExp([
                '^',
                common_1.unnest(_this._cache.path.concat(_this).map(common_1.prop('_compiled'))).join(''),
                _this.config.strict === false ? '\/?' : '',
                '$'
            ].join(''), _this.config.caseInsensitive ? 'i' : undefined);
        }).exec(path);
        if (!match)
            return null;
        var allParams = this.parameters(), pathParams = allParams.filter(function (param) { return !param.isSearch(); }), searchParams = allParams.filter(function (param) { return param.isSearch(); }), nPathSegments = this._cache.path.concat(this).map(function (urlm) { return urlm._segments.length - 1; }).reduce(function (a, x) { return a + x; }), values = {};
        if (nPathSegments !== match.length - 1)
            throw new Error("Unbalanced capture group in route '" + this.pattern + "'");
        function decodePathArray(string) {
            var reverseString = function (str) { return str.split("").reverse().join(""); };
            var unquoteDashes = function (str) { return str.replace(/\\-/g, "-"); };
            var split = reverseString(string).split(/-(?!\\)/);
            var allReversed = common_1.map(split, reverseString);
            return common_1.map(allReversed, unquoteDashes).reverse();
        }
        for (var i = 0; i < nPathSegments; i++) {
            var param = pathParams[i];
            var value = match[i + 1];
            for (var j = 0; j < param.replace; j++) {
                if (param.replace[j].from === value)
                    value = param.replace[j].to;
            }
            if (value && param.array === true)
                value = decodePathArray(value);
            values[param.id] = param.value(value);
        }
        common_1.forEach(searchParams, function (param) {
            values[param.id] = param.value(search[param.id]);
        });
        if (hash)
            values["#"] = hash;
        return values;
    };
    UrlMatcher.prototype.parameters = function (opts) {
        if (opts === void 0) { opts = {}; }
        if (opts.inherit === false)
            return this._params;
        return common_1.unnest(this._cache.path.concat(this).map(common_1.prop('_params')));
    };
    UrlMatcher.prototype.parameter = function (id, opts) {
        if (opts === void 0) { opts = {}; }
        var parent = common_1.tail(this._cache.path);
        return (common_1.find(this._params, common_1.propEq('id', id)) ||
            (opts.inherit !== false && parent && parent.parameter(id)) ||
            null);
    };
    UrlMatcher.prototype.validates = function (params) {
        var _this = this;
        var validParamVal = function (param, val) { return !param || param.validates(val); };
        return common_1.pairs(params || {}).map(function (_a) {
            var key = _a[0], val = _a[1];
            return validParamVal(_this.parameter(key), val);
        }).reduce(common_1.allTrueR, true);
    };
    UrlMatcher.prototype.format = function (values) {
        if (values === void 0) { values = {}; }
        var segments = this._segments, result = segments[0], search = false, params = this.parameters({ inherit: false }), parent = common_1.tail(this._cache.path);
        if (!this.validates(values))
            return null;
        function encodeDashes(str) {
            return encodeURIComponent(str).replace(/-/g, function (c) { return ("%5C%" + c.charCodeAt(0).toString(16).toUpperCase()); });
        }
        params.map(function (param, i) {
            var isPathParam = i < segments.length - 1;
            var value = param.value(values[param.id]);
            var isDefaultValue = param.isDefaultValue(value);
            var squash = isDefaultValue ? param.squash : false;
            var encoded = param.type.encode(value);
            if (!isPathParam) {
                if (encoded == null || (isDefaultValue && squash !== false))
                    return;
                if (!common_1.isArray(encoded))
                    encoded = [encoded];
                encoded = common_1.map(encoded, encodeURIComponent).join("&" + param.id + "=");
                result += (search ? '&' : '?') + (param.id + "=" + encoded);
                search = true;
                return;
            }
            result += (function (segment, result) {
                if (squash === true)
                    return segment.match(result.match(/\/$/) ? /\/?(.*)/ : /(.*)/)[1];
                if (common_1.isString(squash))
                    return squash + segment;
                if (squash !== false)
                    return "";
                if (encoded == null)
                    return segment;
                if (common_1.isArray(encoded))
                    return common_1.map(encoded, encodeDashes).join("-") + segment;
                if (param.type.raw)
                    return encoded + segment;
                return encodeURIComponent(encoded) + segment;
            })(segments[i + 1], result);
        });
        if (values["#"])
            result += "#" + values["#"];
        var processedParams = ['#'].concat(params.map(common_1.prop('id')));
        return (parent && parent.format(common_1.omit(values, processedParams)) || '') + result;
    };
    UrlMatcher.nameValidator = /^\w+(-+\w+)*(?:\[\])?$/;
    return UrlMatcher;
})();
exports.UrlMatcher = UrlMatcher;
//# sourceMappingURL=urlMatcher.js.map