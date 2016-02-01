import { extend, val, isString, isFunction, removeFrom } from "../common/common";
import { Glob } from "../state/module";
export function matchState(state, matchCriteria) {
    let toMatch = isString(matchCriteria) ? [matchCriteria] : matchCriteria;
    function matchGlobs(_state) {
        for (let i = 0; i < toMatch.length; i++) {
            let glob = Glob.fromString(toMatch[i]);
            if ((glob && glob.matches(_state.name)) || (!glob && toMatch[i] === _state.name)) {
                return true;
            }
        }
        return false;
    }
    let matchFn = (isFunction(toMatch) ? toMatch : matchGlobs);
    return !!matchFn(state);
}
export class EventHook {
    constructor(matchCriteria, callback, options = {}) {
        this.callback = callback;
        this.matchCriteria = extend({ to: val(true), from: val(true) }, matchCriteria);
        this.priority = options.priority || 0;
    }
    matches(to, from) {
        return matchState(to, this.matchCriteria.to) && matchState(from, this.matchCriteria.from);
    }
}
function makeHookRegistrationFn(hooks, name) {
    return function (matchObject, callback, options = {}) {
        let eventHook = new EventHook(matchObject, callback, options);
        hooks[name].push(eventHook);
        return function deregisterEventHook() {
            removeFrom(hooks[name])(eventHook);
        };
    };
}
export class HookRegistry {
    constructor() {
        this._transitionEvents = {
            onBefore: [], onStart: [], onEnter: [], onRetain: [], onExit: [], onFinish: [], onSuccess: [], onError: []
        };
        this.getHooks = (name) => this._transitionEvents[name];
        this.onBefore = makeHookRegistrationFn(this._transitionEvents, "onBefore");
        this.onStart = makeHookRegistrationFn(this._transitionEvents, "onStart");
        this.onEnter = makeHookRegistrationFn(this._transitionEvents, "onEnter");
        this.onRetain = makeHookRegistrationFn(this._transitionEvents, "onRetain");
        this.onExit = makeHookRegistrationFn(this._transitionEvents, "onExit");
        this.onFinish = makeHookRegistrationFn(this._transitionEvents, "onFinish");
        this.onSuccess = makeHookRegistrationFn(this._transitionEvents, "onSuccess");
        this.onError = makeHookRegistrationFn(this._transitionEvents, "onError");
    }
    static mixin(source, target) {
        Object.keys(source._transitionEvents).concat(["getHooks"]).forEach(key => target[key] = source[key]);
    }
}
//# sourceMappingURL=hookRegistry.js.map