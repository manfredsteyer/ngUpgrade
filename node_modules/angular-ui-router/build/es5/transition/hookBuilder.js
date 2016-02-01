var common_1 = require("../common/common");
var module_1 = require("./module");
var successErrorOptions = {
    async: false,
    rejectIfSuperseded: false
};
var HookBuilder = (function () {
    function HookBuilder($transitions, transition, baseHookOptions) {
        var _this = this;
        this.$transitions = $transitions;
        this.transition = transition;
        this.baseHookOptions = baseHookOptions;
        this.getOnBeforeHooks = function () { return _this._buildTransitionHooks("onBefore", {}, { async: false }); };
        this.getOnStartHooks = function () { return _this._buildTransitionHooks("onStart"); };
        this.getOnExitHooks = function () { return _this._buildNodeHooks("onExit", _this.treeChanges.exiting.reverse(), function (node) { return _this._toFrom({ from: node.state }); }); };
        this.getOnRetainHooks = function () { return _this._buildNodeHooks("onRetain", _this.treeChanges.retained, function (node) { return _this._toFrom(); }); };
        this.getOnEnterHooks = function () { return _this._buildNodeHooks("onEnter", _this.treeChanges.entering, function (node) { return _this._toFrom({ to: node.state }); }); };
        this.getOnFinishHooks = function () { return _this._buildTransitionHooks("onFinish", { $treeChanges$: _this.treeChanges }); };
        this.getOnSuccessHooks = function () { return _this._buildTransitionHooks("onSuccess", {}, { async: false, rejectIfSuperseded: false }); };
        this.getOnErrorHooks = function () { return _this._buildTransitionHooks("onError", {}, { async: false, rejectIfSuperseded: false }); };
        this.treeChanges = transition.treeChanges();
        this.toState = common_1.tail(this.treeChanges.to).state;
        this.fromState = common_1.tail(this.treeChanges.from).state;
        this.transitionOptions = transition.options();
    }
    HookBuilder.prototype.asyncHooks = function () {
        var onStartHooks = this.getOnStartHooks();
        var onExitHooks = this.getOnExitHooks();
        var onRetainHooks = this.getOnRetainHooks();
        var onEnterHooks = this.getOnEnterHooks();
        var onFinishHooks = this.getOnFinishHooks();
        return common_1.flatten([onStartHooks, onExitHooks, onRetainHooks, onEnterHooks, onFinishHooks]).filter(common_1.identity);
    };
    HookBuilder.prototype._toFrom = function (toFromOverride) {
        return common_1.extend({ to: this.toState, from: this.fromState }, toFromOverride);
    };
    HookBuilder.prototype._buildTransitionHooks = function (hookType, locals, options) {
        var _this = this;
        if (locals === void 0) { locals = {}; }
        if (options === void 0) { options = {}; }
        var context = this.treeChanges.to, node = common_1.tail(context);
        options.traceData = { hookType: hookType, context: context };
        var transitionHook = function (eventHook) { return _this.buildHook(node, eventHook.callback, locals, options); };
        return this._matchingHooks(hookType, this._toFrom()).map(transitionHook);
    };
    HookBuilder.prototype._buildNodeHooks = function (hookType, path, toFromFn, locals, options) {
        var _this = this;
        if (locals === void 0) { locals = {}; }
        if (options === void 0) { options = {}; }
        var hooksForNode = function (node) {
            var toFrom = toFromFn(node);
            options.traceData = { hookType: hookType, context: node };
            locals.$state$ = node.state;
            var transitionHook = function (eventHook) { return _this.buildHook(node, eventHook.callback, locals, options); };
            return _this._matchingHooks(hookType, toFrom).map(transitionHook);
        };
        return path.map(hooksForNode);
    };
    HookBuilder.prototype.buildHook = function (node, fn, locals, options) {
        if (options === void 0) { options = {}; }
        var _options = common_1.extend({}, this.baseHookOptions, options);
        return new module_1.TransitionHook(fn, common_1.extend({}, locals), node.resolveContext, _options);
    };
    HookBuilder.prototype._matchingHooks = function (hookName, matchCriteria) {
        var matchFilter = function (hook) { return hook.matches(matchCriteria.to, matchCriteria.from); };
        var prioritySort = function (l, r) { return r.priority - l.priority; };
        return [this.transition, this.$transitions]
            .map(function (reg) { return reg.getHooks(hookName); })
            .filter(common_1.assertPredicate(common_1.isArray, "broken event named: " + hookName))
            .reduce(common_1.unnestR)
            .filter(matchFilter)
            .sort(prioritySort);
    };
    return HookBuilder;
})();
exports.HookBuilder = HookBuilder;
//# sourceMappingURL=hookBuilder.js.map