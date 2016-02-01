var trace_1 = require("../common/trace");
var coreservices_1 = require("../common/coreservices");
var common_1 = require("../common/common");
var module_1 = require("./module");
var module_2 = require("../path/module");
var module_3 = require("../state/module");
var module_4 = require("../params/module");
var module_5 = require("../resolve/module");
var transitionCount = 0, REJECT = new module_1.RejectFactory();
var stateSelf = common_1.prop("self");
var Transition = (function () {
    function Transition(fromPath, targetState) {
        var _this = this;
        this._deferred = coreservices_1.services.$q.defer();
        this.promise = this._deferred.promise;
        this.treeChanges = function () { return _this._treeChanges; };
        this.isActive = function () { return _this === _this._options.current(); };
        if (!targetState.valid()) {
            throw new Error(targetState.error());
        }
        module_1.HookRegistry.mixin(new module_1.HookRegistry(), this);
        this._options = common_1.extend({ current: common_1.val(this) }, targetState.options());
        this.$id = transitionCount++;
        var toPath = module_2.PathFactory.buildToPath(fromPath, targetState);
        this._treeChanges = module_2.PathFactory.treeChanges(fromPath, toPath, this._options.reloadState);
        module_2.PathFactory.bindTransitionResolve(this._treeChanges, this);
    }
    Transition.prototype.$from = function () {
        return common_1.tail(this._treeChanges.from).state;
    };
    Transition.prototype.$to = function () {
        return common_1.tail(this._treeChanges.to).state;
    };
    Transition.prototype.from = function () {
        return this.$from().self;
    };
    Transition.prototype.to = function () {
        return this.$to().self;
    };
    Transition.prototype.is = function (compare) {
        if (compare instanceof Transition) {
            return this.is({ to: compare.$to().name, from: compare.$from().name });
        }
        return !((compare.to && !module_1.matchState(this.$to(), compare.to)) ||
            (compare.from && !module_1.matchState(this.$from(), compare.from)));
    };
    Transition.prototype.params = function (pathname) {
        if (pathname === void 0) { pathname = "to"; }
        return this._treeChanges[pathname].map(common_1.prop("values")).reduce(common_1.mergeR, {});
    };
    Transition.prototype.resolves = function () {
        return common_1.map(common_1.tail(this._treeChanges.to).resolveContext.getResolvables(), function (res) { return res.data; });
    };
    Transition.prototype.addResolves = function (resolves, state) {
        if (state === void 0) { state = ""; }
        var stateName = (typeof state === "string") ? state : state.name;
        var topath = this._treeChanges.to;
        var targetNode = common_1.find(topath, function (node) { return node.state.name === stateName; });
        common_1.tail(topath).resolveContext.addResolvables(module_5.Resolvable.makeResolvables(resolves), targetNode.state);
    };
    Transition.prototype.previous = function () {
        return this._options.previous || null;
    };
    Transition.prototype.options = function () {
        return this._options;
    };
    Transition.prototype.entering = function () {
        return common_1.map(this._treeChanges.entering, common_1.prop('state')).map(stateSelf);
    };
    Transition.prototype.exiting = function () {
        return common_1.map(this._treeChanges.exiting, common_1.prop('state')).map(stateSelf).reverse();
    };
    Transition.prototype.retained = function () {
        return common_1.map(this._treeChanges.retained, common_1.prop('state')).map(stateSelf);
    };
    Transition.prototype.views = function (pathname, state) {
        if (pathname === void 0) { pathname = "entering"; }
        var path = this._treeChanges[pathname];
        return state ? common_1.find(path, common_1.propEq('state', state)).views : common_1.unnest(path.map(common_1.prop("views")));
    };
    Transition.prototype.redirect = function (targetState) {
        var newOptions = common_1.extend({}, this.options(), targetState.options(), { previous: this });
        targetState = new module_3.TargetState(targetState.identifier(), targetState.$state(), targetState.params(), newOptions);
        var redirectTo = new Transition(this._treeChanges.from, targetState);
        var redirectedPath = this.treeChanges().to;
        var matching = module_2.Node.matching(redirectTo.treeChanges().to, redirectedPath);
        var includeResolve = function (resolve, key) { return ['$stateParams', '$transition$'].indexOf(key) === -1; };
        matching.forEach(function (node, idx) { return common_1.extend(node.resolves, common_1.filter(redirectedPath[idx].resolves, includeResolve)); });
        return redirectTo;
    };
    Transition.prototype.ignored = function () {
        var _a = this._treeChanges, to = _a.to, from = _a.from;
        if (this._options.reload || common_1.tail(to).state !== common_1.tail(from).state)
            return false;
        var nodeSchemas = to.map(function (node) { return node.schema.filter(common_1.not(common_1.prop('dynamic'))); });
        var _b = [to, from].map(function (path) { return path.map(common_1.prop('values')); }), toValues = _b[0], fromValues = _b[1];
        var tuples = common_1.arrayTuples(nodeSchemas, toValues, fromValues);
        return tuples.map(function (_a) {
            var schema = _a[0], toVals = _a[1], fromVals = _a[2];
            return module_4.Param.equals(schema, toVals, fromVals);
        }).reduce(common_1.allTrueR, true);
    };
    Transition.prototype.hookBuilder = function () {
        return new module_1.HookBuilder(module_1.$transitions, this, {
            transition: this,
            current: this._options.current
        });
    };
    Transition.prototype.run = function () {
        var _this = this;
        var hookBuilder = this.hookBuilder();
        var runSynchronousHooks = module_1.TransitionHook.runSynchronousHooks;
        var runSuccessHooks = function () { return runSynchronousHooks(hookBuilder.getOnSuccessHooks(), {}, true); };
        var runErrorHooks = function ($error$) { return runSynchronousHooks(hookBuilder.getOnErrorHooks(), { $error$: $error$ }, true); };
        this.promise.then(runSuccessHooks, runErrorHooks);
        var syncResult = runSynchronousHooks(hookBuilder.getOnBeforeHooks());
        if (module_1.TransitionHook.isRejection(syncResult)) {
            var rejectReason = syncResult.reason;
            this._deferred.reject(rejectReason);
            return this.promise;
        }
        if (!this.valid()) {
            var error = new Error(this.error());
            this._deferred.reject(error);
            return this.promise;
        }
        if (this.ignored()) {
            trace_1.trace.traceTransitionIgnored(this);
            var ignored = REJECT.ignored();
            this._deferred.reject(ignored.reason);
            return this.promise;
        }
        var resolve = function () {
            _this._deferred.resolve(_this);
            trace_1.trace.traceSuccess(_this.$to(), _this);
        };
        var reject = function (error) {
            _this._deferred.reject(error);
            trace_1.trace.traceError(error, _this);
            return coreservices_1.services.$q.reject(error);
        };
        trace_1.trace.traceTransitionStart(this);
        var chain = hookBuilder.asyncHooks().reduce(function (_chain, step) { return _chain.then(step.invokeStep); }, syncResult);
        chain.then(resolve, reject);
        return this.promise;
    };
    Transition.prototype.valid = function () {
        return !this.error();
    };
    Transition.prototype.error = function () {
        var state = this.$to();
        if (state.self[common_1.abstractKey])
            return "Cannot transition to abstract state '" + state.name + "'";
        if (!module_4.Param.validates(state.parameters(), this.params()))
            return "Param values not valid for state '" + state.name + "'";
    };
    Transition.prototype.toString = function () {
        var fromStateOrName = this.from();
        var toStateOrName = this.to();
        var avoidEmptyHash = function (params) {
            return (params["#"] !== null && params["#"] !== undefined) ? params : common_1.omit(params, "#");
        };
        var id = this.$id, from = common_1.isObject(fromStateOrName) ? fromStateOrName.name : fromStateOrName, fromParams = common_1.toJson(avoidEmptyHash(this._treeChanges.from.map(common_1.prop('values')).reduce(common_1.mergeR, {}))), toValid = this.valid() ? "" : "(X) ", to = common_1.isObject(toStateOrName) ? toStateOrName.name : toStateOrName, toParams = common_1.toJson(avoidEmptyHash(this.params()));
        return "Transition#" + id + "( '" + from + "'" + fromParams + " -> " + toValid + "'" + to + "'" + toParams + " )";
    };
    return Transition;
})();
exports.Transition = Transition;
//# sourceMappingURL=transition.js.map