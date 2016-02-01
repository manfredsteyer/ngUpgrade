var common_1 = require("../common/common");
var trace_1 = require("../common/trace");
var coreservices_1 = require("../common/coreservices");
var rejectFactory_1 = require("./rejectFactory");
var module_1 = require("../state/module");
var REJECT = new rejectFactory_1.RejectFactory();
var defaultOptions = {
    async: true,
    rejectIfSuperseded: true,
    current: common_1.noop,
    transition: null,
    traceData: {}
};
var TransitionHook = (function () {
    function TransitionHook(fn, locals, resolveContext, options) {
        var _this = this;
        this.fn = fn;
        this.locals = locals;
        this.resolveContext = resolveContext;
        this.options = options;
        this.isSuperseded = function () { return _this.options.current() !== _this.options.transition; };
        this.mapHookResult = common_1.pattern([
            [this.isSuperseded, function () { return REJECT.superseded(_this.options.current()); }],
            [common_1.eq(false), common_1.val(REJECT.aborted("Hook aborted transition"))],
            [common_1.is(module_1.TargetState), function (target) { return REJECT.redirected(target); }],
            [common_1.isPromise, function (promise) { return promise.then(_this.handleHookResult.bind(_this)); }]
        ]);
        this.invokeStep = function (moreLocals) {
            var _a = _this, options = _a.options, fn = _a.fn, resolveContext = _a.resolveContext;
            var locals = common_1.extend({}, _this.locals, moreLocals);
            trace_1.trace.traceHookInvocation(_this, options);
            if (options.rejectIfSuperseded && _this.isSuperseded()) {
                return REJECT.superseded(options.current());
            }
            if (!options.async) {
                var hookResult = resolveContext.invokeNow(fn, locals, options);
                return _this.handleHookResult(hookResult);
            }
            return resolveContext.invokeLater(fn, locals, options).then(_this.handleHookResult.bind(_this));
        };
        this.options = common_1.defaults(options, defaultOptions);
    }
    TransitionHook.prototype.handleHookResult = function (hookResult) {
        if (!common_1.isDefined(hookResult))
            return undefined;
        trace_1.trace.traceHookResult(hookResult, undefined, this.options);
        var transitionResult = this.mapHookResult(hookResult);
        if (transitionResult)
            trace_1.trace.traceHookResult(hookResult, transitionResult, this.options);
        return transitionResult;
    };
    TransitionHook.prototype.toString = function () {
        var _a = this, options = _a.options, fn = _a.fn;
        var event = common_1.parse("traceData.hookType")(options) || "internal", context = common_1.parse("traceData.context.state.name")(options) || common_1.parse("traceData.context")(options) || "unknown", name = common_1.fnToString(fn);
        return event + " context: " + context + ", " + common_1.maxLength(200, name);
    };
    TransitionHook.runSynchronousHooks = function (hooks, locals, swallowExceptions) {
        if (locals === void 0) { locals = {}; }
        if (swallowExceptions === void 0) { swallowExceptions = false; }
        var results = [];
        for (var i = 0; i < hooks.length; i++) {
            try {
                results.push(hooks[i].invokeStep(locals));
            }
            catch (exception) {
                if (!swallowExceptions)
                    throw exception;
                console.log("Swallowed exception during synchronous hook handler: " + exception);
            }
        }
        var rejections = results.filter(TransitionHook.isRejection);
        if (rejections.length)
            return rejections[0];
        return results
            .filter(common_1.not(TransitionHook.isRejection))
            .filter(common_1.isPromise)
            .reduce(function (chain, promise) { return chain.then(common_1.val(promise)); }, coreservices_1.services.$q.when());
    };
    TransitionHook.isRejection = function (hookResult) {
        return hookResult && hookResult.reason instanceof rejectFactory_1.TransitionRejection && hookResult;
    };
    return TransitionHook;
})();
exports.TransitionHook = TransitionHook;
//# sourceMappingURL=transitionHook.js.map