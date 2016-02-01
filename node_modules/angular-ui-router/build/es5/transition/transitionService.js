var transition_1 = require("./transition");
var hookRegistry_1 = require("./hookRegistry");
exports.defaultTransOpts = {
    location: true,
    relative: null,
    inherit: false,
    notify: true,
    reload: false,
    custom: {},
    current: function () { return null; }
};
var TransitionService = (function () {
    function TransitionService() {
        this._defaultErrorHandler = function $defaultErrorHandler($error$) {
            if ($error$ instanceof Error)
                console.log($error$);
        };
        this._reinit();
    }
    TransitionService.prototype.defaultErrorHandler = function (handler) {
        return this._defaultErrorHandler = handler || this._defaultErrorHandler;
    };
    TransitionService.prototype._reinit = function () {
        hookRegistry_1.HookRegistry.mixin(new hookRegistry_1.HookRegistry(), this);
    };
    TransitionService.prototype.create = function (fromPath, targetState) {
        return new transition_1.Transition(fromPath, targetState);
    };
    return TransitionService;
})();
exports.$transitions = new TransitionService();
$TransitionProvider.prototype = exports.$transitions;
function $TransitionProvider() {
    this._reinit.bind(exports.$transitions)();
    this.$get = function $get() {
        return exports.$transitions;
    };
}
exports.$transitionsProvider = $TransitionProvider;
angular.module('ui.router.state')
    .provider('$transitions', exports.$transitionsProvider);
//# sourceMappingURL=transitionService.js.map