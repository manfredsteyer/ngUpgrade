import { extend, tail, isArray, assertPredicate, unnestR, flatten, identity } from "../common/common";
import { TransitionHook } from "./module";
let successErrorOptions = {
    async: false,
    rejectIfSuperseded: false
};
export class HookBuilder {
    constructor($transitions, transition, baseHookOptions) {
        this.$transitions = $transitions;
        this.transition = transition;
        this.baseHookOptions = baseHookOptions;
        this.getOnBeforeHooks = () => this._buildTransitionHooks("onBefore", {}, { async: false });
        this.getOnStartHooks = () => this._buildTransitionHooks("onStart");
        this.getOnExitHooks = () => this._buildNodeHooks("onExit", this.treeChanges.exiting.reverse(), (node) => this._toFrom({ from: node.state }));
        this.getOnRetainHooks = () => this._buildNodeHooks("onRetain", this.treeChanges.retained, (node) => this._toFrom());
        this.getOnEnterHooks = () => this._buildNodeHooks("onEnter", this.treeChanges.entering, (node) => this._toFrom({ to: node.state }));
        this.getOnFinishHooks = () => this._buildTransitionHooks("onFinish", { $treeChanges$: this.treeChanges });
        this.getOnSuccessHooks = () => this._buildTransitionHooks("onSuccess", {}, { async: false, rejectIfSuperseded: false });
        this.getOnErrorHooks = () => this._buildTransitionHooks("onError", {}, { async: false, rejectIfSuperseded: false });
        this.treeChanges = transition.treeChanges();
        this.toState = tail(this.treeChanges.to).state;
        this.fromState = tail(this.treeChanges.from).state;
        this.transitionOptions = transition.options();
    }
    asyncHooks() {
        let onStartHooks = this.getOnStartHooks();
        let onExitHooks = this.getOnExitHooks();
        let onRetainHooks = this.getOnRetainHooks();
        let onEnterHooks = this.getOnEnterHooks();
        let onFinishHooks = this.getOnFinishHooks();
        return flatten([onStartHooks, onExitHooks, onRetainHooks, onEnterHooks, onFinishHooks]).filter(identity);
    }
    _toFrom(toFromOverride) {
        return extend({ to: this.toState, from: this.fromState }, toFromOverride);
    }
    _buildTransitionHooks(hookType, locals = {}, options = {}) {
        let context = this.treeChanges.to, node = tail(context);
        options.traceData = { hookType, context };
        const transitionHook = eventHook => this.buildHook(node, eventHook.callback, locals, options);
        return this._matchingHooks(hookType, this._toFrom()).map(transitionHook);
    }
    _buildNodeHooks(hookType, path, toFromFn, locals = {}, options = {}) {
        const hooksForNode = (node) => {
            let toFrom = toFromFn(node);
            options.traceData = { hookType, context: node };
            locals.$state$ = node.state;
            const transitionHook = eventHook => this.buildHook(node, eventHook.callback, locals, options);
            return this._matchingHooks(hookType, toFrom).map(transitionHook);
        };
        return path.map(hooksForNode);
    }
    buildHook(node, fn, locals, options = {}) {
        let _options = extend({}, this.baseHookOptions, options);
        return new TransitionHook(fn, extend({}, locals), node.resolveContext, _options);
    }
    _matchingHooks(hookName, matchCriteria) {
        const matchFilter = hook => hook.matches(matchCriteria.to, matchCriteria.from);
        const prioritySort = (l, r) => r.priority - l.priority;
        return [this.transition, this.$transitions]
            .map((reg) => reg.getHooks(hookName))
            .filter(assertPredicate(isArray, `broken event named: ${hookName}`))
            .reduce(unnestR)
            .filter(matchFilter)
            .sort(prioritySort);
    }
}
//# sourceMappingURL=hookBuilder.js.map