import { forEach, extend, isObject, isDefined, isFunction } from "../common/common";
import { UrlMatcher, matcherConfig } from "./module";
import { Param, paramTypes } from "../params/module";
function getDefaultConfig() {
    return {
        strict: matcherConfig.strictMode(),
        caseInsensitive: matcherConfig.caseInsensitive()
    };
}
export class UrlMatcherFactory {
    constructor() {
        extend(this, { UrlMatcher, Param });
    }
    caseInsensitive(value) {
        return matcherConfig.caseInsensitive(value);
    }
    strictMode(value) {
        return matcherConfig.strictMode(value);
    }
    defaultSquashPolicy(value) {
        return matcherConfig.defaultSquashPolicy(value);
    }
    compile(pattern, config) {
        return new UrlMatcher(pattern, extend(getDefaultConfig(), config));
    }
    isMatcher(object) {
        if (!isObject(object))
            return false;
        var result = true;
        forEach(UrlMatcher.prototype, (val, name) => {
            if (isFunction(val))
                result = result && (isDefined(object[name]) && isFunction(object[name]));
        });
        return result;
    }
    ;
    type(name, definition, definitionFn) {
        var type = paramTypes.type(name, definition, definitionFn);
        return !isDefined(definition) ? type : this;
    }
    ;
    $get() {
        paramTypes.enqueue = false;
        paramTypes._flushTypeQueue();
        return this;
    }
    ;
}
//# sourceMappingURL=urlMatcherFactory.js.map