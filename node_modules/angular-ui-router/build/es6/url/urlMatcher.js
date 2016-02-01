import { map, prop, propEq, defaults, extend, inherit, identity, isArray, isString, unnest, tail, forEach, find, omit, pairs, allTrueR } from "../common/common";
import { Param, paramTypes } from "../params/module";
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
            surroundPattern = [`(${param.squash}|`, ')?'];
            break;
    }
    return result + surroundPattern[0] + param.type.pattern.source + surroundPattern[1];
}
const memoizeTo = (obj, prop, fn) => obj[prop] = obj[prop] || fn();
export class UrlMatcher {
    constructor(pattern, config) {
        this.pattern = pattern;
        this.config = config;
        this._cache = { path: [], pattern: null };
        this._children = [];
        this._params = [];
        this._segments = [];
        this._compiled = [];
        this.config = defaults(this.config, {
            params: {},
            strict: true,
            caseInsensitive: false,
            paramMap: identity
        });
        var placeholder = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, searchPlaceholder = /([:]?)([\w\[\]-]+)|\{([\w\[\]-]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, last = 0, m, patterns = [];
        const checkParamErrors = (id) => {
            if (!UrlMatcher.nameValidator.test(id))
                throw new Error(`Invalid parameter name '${id}' in pattern '${pattern}'`);
            if (find(this._params, propEq('id', id)))
                throw new Error(`Duplicate parameter name '${id}' in pattern '${pattern}'`);
        };
        const matchDetails = (m, isSearch) => {
            var id = m[2] || m[3], regexp = isSearch ? m[4] : m[4] || (m[1] === '*' ? '.*' : null);
            return {
                id,
                regexp,
                cfg: this.config.params[id],
                segment: pattern.substring(last, m.index),
                type: !regexp ? null : paramTypes.type(regexp || "string") || inherit(paramTypes.type("string"), {
                    pattern: new RegExp(regexp, this.config.caseInsensitive ? 'i' : undefined)
                })
            };
        };
        var p, param, segment;
        while ((m = placeholder.exec(pattern))) {
            p = matchDetails(m, false);
            if (p.segment.indexOf('?') >= 0)
                break;
            checkParamErrors(p.id);
            this._params.push(Param.fromPath(p.id, p.type, this.config.paramMap(p.cfg, false)));
            this._segments.push(p.segment);
            patterns.push([p.segment, tail(this._params)]);
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
                    this._params.push(Param.fromSearch(p.id, p.type, this.config.paramMap(p.cfg, true)));
                    last = placeholder.lastIndex;
                }
            }
        }
        this._segments.push(segment);
        extend(this, {
            _compiled: patterns.map(pattern => quoteRegExp.apply(null, pattern)).concat(quoteRegExp(segment)),
            prefix: this._segments[0]
        });
        Object.freeze(this);
    }
    append(url) {
        this._children.push(url);
        forEach(url._cache, (val, key) => url._cache[key] = isArray(val) ? [] : null);
        url._cache.path = this._cache.path.concat(this);
        return url;
    }
    isRoot() {
        return this._cache.path.length === 0;
    }
    toString() {
        return this.pattern;
    }
    exec(path, search = {}, hash, options = {}) {
        var match = memoizeTo(this._cache, 'pattern', () => {
            return new RegExp([
                '^',
                unnest(this._cache.path.concat(this).map(prop('_compiled'))).join(''),
                this.config.strict === false ? '\/?' : '',
                '$'
            ].join(''), this.config.caseInsensitive ? 'i' : undefined);
        }).exec(path);
        if (!match)
            return null;
        var allParams = this.parameters(), pathParams = allParams.filter(param => !param.isSearch()), searchParams = allParams.filter(param => param.isSearch()), nPathSegments = this._cache.path.concat(this).map(urlm => urlm._segments.length - 1).reduce((a, x) => a + x), values = {};
        if (nPathSegments !== match.length - 1)
            throw new Error(`Unbalanced capture group in route '${this.pattern}'`);
        function decodePathArray(string) {
            const reverseString = (str) => str.split("").reverse().join("");
            const unquoteDashes = (str) => str.replace(/\\-/g, "-");
            var split = reverseString(string).split(/-(?!\\)/);
            var allReversed = map(split, reverseString);
            return map(allReversed, unquoteDashes).reverse();
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
        forEach(searchParams, param => {
            values[param.id] = param.value(search[param.id]);
        });
        if (hash)
            values["#"] = hash;
        return values;
    }
    parameters(opts = {}) {
        if (opts.inherit === false)
            return this._params;
        return unnest(this._cache.path.concat(this).map(prop('_params')));
    }
    parameter(id, opts = {}) {
        const parent = tail(this._cache.path);
        return (find(this._params, propEq('id', id)) ||
            (opts.inherit !== false && parent && parent.parameter(id)) ||
            null);
    }
    validates(params) {
        const validParamVal = (param, val) => !param || param.validates(val);
        return pairs(params || {}).map(([key, val]) => validParamVal(this.parameter(key), val)).reduce(allTrueR, true);
    }
    format(values = {}) {
        var segments = this._segments, result = segments[0], search = false, params = this.parameters({ inherit: false }), parent = tail(this._cache.path);
        if (!this.validates(values))
            return null;
        function encodeDashes(str) {
            return encodeURIComponent(str).replace(/-/g, c => `%5C%${c.charCodeAt(0).toString(16).toUpperCase()}`);
        }
        params.map((param, i) => {
            var isPathParam = i < segments.length - 1;
            var value = param.value(values[param.id]);
            var isDefaultValue = param.isDefaultValue(value);
            var squash = isDefaultValue ? param.squash : false;
            var encoded = param.type.encode(value);
            if (!isPathParam) {
                if (encoded == null || (isDefaultValue && squash !== false))
                    return;
                if (!isArray(encoded))
                    encoded = [encoded];
                encoded = map(encoded, encodeURIComponent).join(`&${param.id}=`);
                result += (search ? '&' : '?') + (`${param.id}=${encoded}`);
                search = true;
                return;
            }
            result += ((segment, result) => {
                if (squash === true)
                    return segment.match(result.match(/\/$/) ? /\/?(.*)/ : /(.*)/)[1];
                if (isString(squash))
                    return squash + segment;
                if (squash !== false)
                    return "";
                if (encoded == null)
                    return segment;
                if (isArray(encoded))
                    return map(encoded, encodeDashes).join("-") + segment;
                if (param.type.raw)
                    return encoded + segment;
                return encodeURIComponent(encoded) + segment;
            })(segments[i + 1], result);
        });
        if (values["#"])
            result += "#" + values["#"];
        var processedParams = ['#'].concat(params.map(prop('id')));
        return (parent && parent.format(omit(values, processedParams)) || '') + result;
    }
}
UrlMatcher.nameValidator = /^\w+(-+\w+)*(?:\[\])?$/;
//# sourceMappingURL=urlMatcher.js.map