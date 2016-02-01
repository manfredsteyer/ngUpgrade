import { isInjectable, extend, isDefined, isString, isArray, filter, map, prop, propEq, applyPairs } from "../common/common";
import { services } from "../common/coreservices";
import { matcherConfig } from "../url/urlMatcherConfig";
import { Type } from "./type";
import { paramTypes } from "./paramTypes";
let hasOwn = Object.prototype.hasOwnProperty;
let isShorthand = cfg => ["value", "type", "squash", "array", "dynamic"].filter(hasOwn.bind(cfg || {})).length === 0;
var DefType;
(function (DefType) {
    DefType[DefType["PATH"] = 0] = "PATH";
    DefType[DefType["SEARCH"] = 1] = "SEARCH";
    DefType[DefType["CONFIG"] = 2] = "CONFIG";
})(DefType || (DefType = {}));
export class Param {
    constructor(id, type, config, location) {
        config = unwrapShorthand(config);
        type = getType(config, type, location);
        var arrayMode = getArrayMode();
        type = arrayMode ? type.$asArray(arrayMode, location === DefType.SEARCH) : type;
        var isOptional = config.value !== undefined;
        var dynamic = config.dynamic === true;
        var squash = getSquashPolicy(config, isOptional);
        var replace = getReplace(config, arrayMode, isOptional, squash);
        function unwrapShorthand(config) {
            config = isShorthand(config) && { value: config } || config;
            return extend(config, {
                $$fn: isInjectable(config.value) ? config.value : () => config.value
            });
        }
        function getType(config, urlType, location) {
            if (config.type && urlType && urlType.name !== 'string')
                throw new Error(`Param '${id}' has two type configurations.`);
            if (config.type && urlType && urlType.name === 'string' && paramTypes.type(config.type))
                return paramTypes.type(config.type);
            if (urlType)
                return urlType;
            if (!config.type)
                return (location === DefType.CONFIG ? paramTypes.type("any") : paramTypes.type("string"));
            return config.type instanceof Type ? config.type : paramTypes.type(config.type);
        }
        function getArrayMode() {
            var arrayDefaults = { array: (location === DefType.SEARCH ? "auto" : false) };
            var arrayParamNomenclature = id.match(/\[\]$/) ? { array: true } : {};
            return extend(arrayDefaults, arrayParamNomenclature, config).array;
        }
        function getSquashPolicy(config, isOptional) {
            var squash = config.squash;
            if (!isOptional || squash === false)
                return false;
            if (!isDefined(squash) || squash == null)
                return matcherConfig.defaultSquashPolicy();
            if (squash === true || isString(squash))
                return squash;
            throw new Error(`Invalid squash policy: '${squash}'. Valid policies: false, true, or arbitrary string`);
        }
        function getReplace(config, arrayMode, isOptional, squash) {
            var replace, configuredKeys, defaultPolicy = [
                { from: "", to: (isOptional || arrayMode ? undefined : "") },
                { from: null, to: (isOptional || arrayMode ? undefined : "") }
            ];
            replace = isArray(config.replace) ? config.replace : [];
            if (isString(squash))
                replace.push({ from: squash, to: undefined });
            configuredKeys = map(replace, prop("from"));
            return filter(defaultPolicy, item => configuredKeys.indexOf(item.from) === -1).concat(replace);
        }
        extend(this, { id, type, location, squash, replace, isOptional, dynamic, config, array: arrayMode });
    }
    isDefaultValue(value) {
        return this.isOptional && this.type.equals(this.value(), value);
    }
    value(value) {
        const $$getDefaultValue = () => {
            if (!services.$injector)
                throw new Error("Injectable functions cannot be called at configuration time");
            var defaultValue = services.$injector.invoke(this.config.$$fn);
            if (defaultValue !== null && defaultValue !== undefined && !this.type.is(defaultValue))
                throw new Error(`Default value (${defaultValue}) for parameter '${this.id}' is not an instance of Type (${this.type.name})`);
            return defaultValue;
        };
        const $replace = (value) => {
            var replacement = map(filter(this.replace, propEq('from', value)), prop("to"));
            return replacement.length ? replacement[0] : value;
        };
        value = $replace(value);
        return !isDefined(value) ? $$getDefaultValue() : this.type.$normalize(value);
    }
    isSearch() {
        return this.location === DefType.SEARCH;
    }
    validates(value) {
        if ((!isDefined(value) || value === null) && this.isOptional)
            return true;
        const normalized = this.type.$normalize(value);
        if (!this.type.is(normalized))
            return false;
        const encoded = this.type.encode(normalized);
        if (isString(encoded) && !this.type.pattern.exec(encoded))
            return false;
        return true;
    }
    toString() {
        return `{Param:${this.id} ${this.type} squash: '${this.squash}' optional: ${this.isOptional}}`;
    }
    static fromConfig(id, type, config) {
        return new Param(id, type, config, DefType.CONFIG);
    }
    static fromPath(id, type, config) {
        return new Param(id, type, config, DefType.PATH);
    }
    static fromSearch(id, type, config) {
        return new Param(id, type, config, DefType.SEARCH);
    }
    static values(params, values) {
        values = values || {};
        return params.map(param => [param.id, param.value(values[param.id])]).reduce(applyPairs, {});
    }
    static equals(params, values1, values2) {
        values1 = values1 || {};
        values2 = values2 || {};
        return params.map(param => param.type.equals(values1[param.id], values2[param.id])).indexOf(false) === -1;
    }
    static validates(params, values) {
        values = values || {};
        return params.map(param => param.validates(values[param.id])).indexOf(false) === -1;
    }
}
//# sourceMappingURL=param.js.map