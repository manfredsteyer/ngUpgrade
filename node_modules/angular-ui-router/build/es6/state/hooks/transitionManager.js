import { copy, prop } from "../../common/common";
import { Param } from "../../params/param";
import { TransitionRejection, RejectType } from "../../transition/rejectFactory";
import { TargetState } from "../targetState";
import { ViewHooks } from "./viewHooks";
import { EnterExitHooks } from "./enterExitHooks";
import { ResolveHooks } from "./resolveHooks";
export class TransitionManager {
    constructor(transition, $transitions, $urlRouter, $view, $state, $stateParams, $q, activeTransQ, changeHistory) {
        this.transition = transition;
        this.$transitions = $transitions;
        this.$urlRouter = $urlRouter;
        this.$view = $view;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.activeTransQ = activeTransQ;
        this.changeHistory = changeHistory;
        this.viewHooks = new ViewHooks(transition, $view);
        this.enterExitHooks = new EnterExitHooks(transition);
        this.resolveHooks = new ResolveHooks(transition);
        this.treeChanges = transition.treeChanges();
        this.registerUpdateGlobalState();
        this.viewHooks.registerHooks();
        this.enterExitHooks.registerHooks();
        this.resolveHooks.registerHooks();
    }
    runTransition() {
        this.activeTransQ.clear();
        this.activeTransQ.enqueue(this.transition);
        return this.transition.run()
            .then((trans) => trans.to())
            .catch(error => this.transRejected(error))
            .finally(() => this.activeTransQ.remove(this.transition));
    }
    registerUpdateGlobalState() {
        this.transition.onFinish({}, this.updateGlobalState.bind(this), { priority: -10000 });
    }
    updateGlobalState() {
        let { treeChanges, transition, $state, changeHistory } = this;
        $state.$current = transition.$to();
        $state.current = $state.$current.self;
        changeHistory.enqueue(treeChanges);
        this.updateStateParams();
    }
    transRejected(error) {
        let { transition, $state, $stateParams, $q } = this;
        if (error instanceof TransitionRejection) {
            if (error.type === RejectType.IGNORED) {
                let dynamic = $state.$current.parameters().filter(prop('dynamic'));
                if (!Param.equals(dynamic, $stateParams, transition.params())) {
                    this.updateStateParams();
                }
                return $state.current;
            }
            if (error.type === RejectType.SUPERSEDED && error.redirected && error.detail instanceof TargetState) {
                return this._redirectMgr(transition.redirect(error.detail)).runTransition();
            }
        }
        this.$transitions.defaultErrorHandler()(error);
        return $q.reject(error);
    }
    updateStateParams() {
        let { transition, $urlRouter, $state, $stateParams } = this;
        let options = transition.options();
        $state.params = transition.params();
        copy($state.params, $stateParams);
        $stateParams.$sync().$off();
        if (options.location && $state.$current.navigable) {
            $urlRouter.push($state.$current.navigable.url, $stateParams, { replace: options.location === 'replace' });
        }
        $urlRouter.update(true);
    }
    _redirectMgr(redirect) {
        let { $transitions, $urlRouter, $view, $state, $stateParams, $q, activeTransQ, changeHistory } = this;
        return new TransitionManager(redirect, $transitions, $urlRouter, $view, $state, $stateParams, $q, activeTransQ, changeHistory);
    }
}
//# sourceMappingURL=transitionManager.js.map