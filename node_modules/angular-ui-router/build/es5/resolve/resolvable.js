var common_1 = require("../common/common");
var coreservices_1 = require("../common/coreservices");
var trace_1 = require("../common/trace");
var Resolvable = (function () {
    function Resolvable(name, resolveFn, preResolvedData) {
        this.promise = undefined;
        common_1.extend(this, { name: name, resolveFn: resolveFn, deps: coreservices_1.services.$injector.annotate(resolveFn), data: preResolvedData });
    }
    Resolvable.prototype.resolveResolvable = function (resolveContext, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var _a = this, name = _a.name, deps = _a.deps, resolveFn = _a.resolveFn;
        trace_1.trace.traceResolveResolvable(this, options);
        var deferred = coreservices_1.services.$q.defer();
        this.promise = deferred.promise;
        var ancestorsByName = resolveContext.getResolvables(null, { omitOwnLocals: [name] });
        var depResolvables = common_1.pick(ancestorsByName, deps);
        var depPromises = common_1.map(depResolvables, function (resolvable) { return resolvable.get(resolveContext, options); });
        return coreservices_1.services.$q.all(depPromises).then(function (locals) {
            try {
                var result = coreservices_1.services.$injector.invoke(resolveFn, null, locals);
                deferred.resolve(result);
            }
            catch (error) {
                deferred.reject(error);
            }
            return _this.promise;
        }).then(function (data) {
            _this.data = data;
            trace_1.trace.traceResolvableResolved(_this, options);
            return _this.promise;
        });
    };
    Resolvable.prototype.get = function (resolveContext, options) {
        return this.promise || this.resolveResolvable(resolveContext, options);
    };
    Resolvable.prototype.toString = function () {
        return "Resolvable(name: " + this.name + ", requires: [" + this.deps + "])";
    };
    Resolvable.makeResolvables = function (resolves) {
        var invalid = common_1.filter(resolves, common_1.not(common_1.isFunction)), keys = Object.keys(invalid);
        if (keys.length)
            throw new Error("Invalid resolve key/value: " + keys[0] + "/" + invalid[keys[0]]);
        return common_1.map(resolves, function (fn, name) { return new Resolvable(name, fn); });
    };
    return Resolvable;
})();
exports.Resolvable = Resolvable;
//# sourceMappingURL=resolvable.js.map