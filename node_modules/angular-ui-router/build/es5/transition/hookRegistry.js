var common_1 = require("../common/common");
var module_1 = require("../state/module");
function matchState(state, matchCriteria) {
    var toMatch = common_1.isString(matchCriteria) ? [matchCriteria] : matchCriteria;
    function matchGlobs(_state) {
        for (var i = 0; i < toMatch.length; i++) {
            var glob = module_1.Glob.fromString(toMatch[i]);
            if ((glob && glob.matches(_state.name)) || (!glob && toMatch[i] === _state.name)) {
                return true;
            }
        }
        return false;
    }
    var matchFn = (common_1.isFunction(toMatch) ? toMatch : matchGlobs);
    return !!matchFn(state);
}
exports.matchState = matchState;
var EventHook = (function () {
    function EventHook(matchCriteria, callback, options) {
        if (options === void 0) { options = {}; }
        this.callback = callback;
        this.matchCriteria = common_1.extend({ to: common_1.val(true), from: common_1.val(true) }, matchCriteria);
        this.priority = options.priority || 0;
    }
    EventHook.prototype.matches = function (to, from) {
        return matchState(to, this.matchCriteria.to) && matchState(from, this.matchCriteria.from);
    };
    return EventHook;
})();
exports.EventHook = EventHook;
function makeHookRegistrationFn(hooks, name) {
    return function (matchObject, callback, options) {
        if (options === void 0) { options = {}; }
        var eventHook = new EventHook(matchObject, callback, options);
        hooks[name].push(eventHook);
        return function deregisterEventHook() {
            common_1.removeFrom(hooks[name])(eventHook);
        };
    };
}
var HookRegistry = (function () {
    function HookRegistry() {
        var _this = this;
        this._transitionEvents = {
            onBefore: [], onStart: [], onEnter: [], onRetain: [], onExit: [], onFinish: [], onSuccess: [], onError: []
        };
        this.getHooks = function (name) { return _this._transitionEvents[name]; };
        this.onBefore = makeHookRegistrationFn(this._transitionEvents, "onBefore");
        this.onStart = makeHookRegistrationFn(this._transitionEvents, "onStart");
        this.onEnter = makeHookRegistrationFn(this._transitionEvents, "onEnter");
        this.onRetain = makeHookRegistrationFn(this._transitionEvents, "onRetain");
        this.onExit = makeHookRegistrationFn(this._transitionEvents, "onExit");
        this.onFinish = makeHookRegistrationFn(this._transitionEvents, "onFinish");
        this.onSuccess = makeHookRegistrationFn(this._transitionEvents, "onSuccess");
        this.onError = makeHookRegistrationFn(this._transitionEvents, "onError");
    }
    HookRegistry.mixin = function (source, target) {
        Object.keys(source._transitionEvents).concat(["getHooks"]).forEach(function (key) { return target[key] = source[key]; });
    };
    return HookRegistry;
})();
exports.HookRegistry = HookRegistry;
//# sourceMappingURL=hookRegistry.js.map