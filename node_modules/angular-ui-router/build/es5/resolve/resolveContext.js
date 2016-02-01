var common_1 = require("../common/common");
var trace_1 = require("../common/trace");
var coreservices_1 = require("../common/coreservices");
var interface_1 = require("./interface");
var defaultResolvePolicy = interface_1.ResolvePolicy[interface_1.ResolvePolicy.LAZY];
var ResolveContext = (function () {
    function ResolveContext(_path) {
        this._path = _path;
        common_1.extend(this, {
            _nodeFor: function (state) {
                return common_1.find(this._path, common_1.propEq('state', state));
            },
            _pathTo: function (state) {
                var node = this._nodeFor(state);
                var elementIdx = this._path.indexOf(node);
                if (elementIdx === -1)
                    throw new Error("This path does not contain the state");
                return this._path.slice(0, elementIdx + 1);
            }
        });
    }
    ResolveContext.prototype.getResolvables = function (state, options) {
        options = common_1.defaults(options, { omitOwnLocals: [] });
        var offset = common_1.find(this._path, common_1.propEq(''));
        var path = (state ? this._pathTo(state) : this._path);
        var last = common_1.tail(path);
        return path.reduce(function (memo, node) {
            var omitProps = (node === last) ? options.omitOwnLocals : [];
            var filteredResolvables = common_1.omit(node.resolves, omitProps);
            return common_1.extend(memo, filteredResolvables);
        }, {});
    };
    ResolveContext.prototype.getResolvablesForFn = function (fn) {
        var deps = coreservices_1.services.$injector.annotate(fn);
        return common_1.pick(this.getResolvables(), deps);
    };
    ResolveContext.prototype.isolateRootTo = function (state) {
        return new ResolveContext(this._pathTo(state));
    };
    ResolveContext.prototype.addResolvables = function (resolvables, state) {
        common_1.extend(this._nodeFor(state).resolves, resolvables);
    };
    ResolveContext.prototype.getOwnResolvables = function (state) {
        return common_1.extend({}, this._nodeFor(state).resolves);
    };
    ResolveContext.prototype.resolvePath = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        trace_1.trace.traceResolvePath(this._path, options);
        var promiseForNode = function (node) { return _this.resolvePathElement(node.state, options); };
        return coreservices_1.services.$q.all(common_1.map(this._path, promiseForNode)).then(common_1.noop);
    };
    ResolveContext.prototype.resolvePathElement = function (state, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var policy = options && options.resolvePolicy;
        var policyOrdinal = interface_1.ResolvePolicy[policy || defaultResolvePolicy];
        var resolvables = this.getOwnResolvables(state);
        var matchesRequestedPolicy = function (resolvable) { return getPolicy(state.resolvePolicy, resolvable) >= policyOrdinal; };
        var matchingResolves = common_1.filter(resolvables, matchesRequestedPolicy);
        var getResolvePromise = function (resolvable) { return resolvable.get(_this.isolateRootTo(state), options); };
        var resolvablePromises = common_1.map(matchingResolves, getResolvePromise);
        trace_1.trace.traceResolvePathElement(this, matchingResolves, options);
        return coreservices_1.services.$q.all(resolvablePromises).then(common_1.noop);
    };
    ResolveContext.prototype.invokeLater = function (fn, locals, options) {
        var _this = this;
        if (locals === void 0) { locals = {}; }
        if (options === void 0) { options = {}; }
        var resolvables = this.getResolvablesForFn(fn);
        trace_1.trace.tracePathElementInvoke(common_1.tail(this._path), fn, Object.keys(resolvables), common_1.extend({ when: "Later" }, options));
        var getPromise = function (resolvable) { return resolvable.get(_this, options); };
        var promises = common_1.map(resolvables, getPromise);
        return coreservices_1.services.$q.all(promises).then(function () {
            try {
                return _this.invokeNow(fn, locals, options);
            }
            catch (error) {
                return coreservices_1.services.$q.reject(error);
            }
        });
    };
    ResolveContext.prototype.invokeNow = function (fn, locals, options) {
        if (options === void 0) { options = {}; }
        var resolvables = this.getResolvablesForFn(fn);
        trace_1.trace.tracePathElementInvoke(common_1.tail(this._path), fn, Object.keys(resolvables), common_1.extend({ when: "Now  " }, options));
        var resolvedLocals = common_1.map(resolvables, common_1.prop("data"));
        return coreservices_1.services.$injector.invoke(fn, null, common_1.extend({}, locals, resolvedLocals));
    };
    return ResolveContext;
})();
exports.ResolveContext = ResolveContext;
function getPolicy(stateResolvePolicyConf, resolvable) {
    var stateLevelPolicy = (common_1.isString(stateResolvePolicyConf) ? stateResolvePolicyConf : null);
    var resolveLevelPolicies = (common_1.isObject(stateResolvePolicyConf) ? stateResolvePolicyConf : {});
    var policyName = resolveLevelPolicies[resolvable.name] || stateLevelPolicy || defaultResolvePolicy;
    return interface_1.ResolvePolicy[policyName];
}
//# sourceMappingURL=resolveContext.js.map