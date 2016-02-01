import { Transition } from "./transition";
import { HookRegistry } from "./hookRegistry";
export let defaultTransOpts = {
    location: true,
    relative: null,
    inherit: false,
    notify: true,
    reload: false,
    custom: {},
    current: () => null
};
class TransitionService {
    constructor() {
        this._defaultErrorHandler = function $defaultErrorHandler($error$) {
            if ($error$ instanceof Error)
                console.log($error$);
        };
        this._reinit();
    }
    defaultErrorHandler(handler) {
        return this._defaultErrorHandler = handler || this._defaultErrorHandler;
    }
    _reinit() {
        HookRegistry.mixin(new HookRegistry(), this);
    }
    create(fromPath, targetState) {
        return new Transition(fromPath, targetState);
    }
}
export let $transitions = new TransitionService();
$TransitionProvider.prototype = $transitions;
function $TransitionProvider() {
    this._reinit.bind($transitions)();
    this.$get = function $get() {
        return $transitions;
    };
}
export let $transitionsProvider = $TransitionProvider;
angular.module('ui.router.state')
    .provider('$transitions', $transitionsProvider);
//# sourceMappingURL=transitionService.js.map