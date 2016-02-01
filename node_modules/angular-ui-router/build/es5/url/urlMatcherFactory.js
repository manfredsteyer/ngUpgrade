var common_1 = require("../common/common");
var module_1 = require("./module");
var module_2 = require("../params/module");
function getDefaultConfig() {
    return {
        strict: module_1.matcherConfig.strictMode(),
        caseInsensitive: module_1.matcherConfig.caseInsensitive()
    };
}
var UrlMatcherFactory = (function () {
    function UrlMatcherFactory() {
        common_1.extend(this, { UrlMatcher: module_1.UrlMatcher, Param: module_2.Param });
    }
    UrlMatcherFactory.prototype.caseInsensitive = function (value) {
        return module_1.matcherConfig.caseInsensitive(value);
    };
    UrlMatcherFactory.prototype.strictMode = function (value) {
        return module_1.matcherConfig.strictMode(value);
    };
    UrlMatcherFactory.prototype.defaultSquashPolicy = function (value) {
        return module_1.matcherConfig.defaultSquashPolicy(value);
    };
    UrlMatcherFactory.prototype.compile = function (pattern, config) {
        return new module_1.UrlMatcher(pattern, common_1.extend(getDefaultConfig(), config));
    };
    UrlMatcherFactory.prototype.isMatcher = function (object) {
        if (!common_1.isObject(object))
            return false;
        var result = true;
        common_1.forEach(module_1.UrlMatcher.prototype, function (val, name) {
            if (common_1.isFunction(val))
                result = result && (common_1.isDefined(object[name]) && common_1.isFunction(object[name]));
        });
        return result;
    };
    ;
    UrlMatcherFactory.prototype.type = function (name, definition, definitionFn) {
        var type = module_2.paramTypes.type(name, definition, definitionFn);
        return !common_1.isDefined(definition) ? type : this;
    };
    ;
    UrlMatcherFactory.prototype.$get = function () {
        module_2.paramTypes.enqueue = false;
        module_2.paramTypes._flushTypeQueue();
        return this;
    };
    ;
    return UrlMatcherFactory;
})();
exports.UrlMatcherFactory = UrlMatcherFactory;
//# sourceMappingURL=urlMatcherFactory.js.map