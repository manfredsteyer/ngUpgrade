var common_1 = require("../../common/common");
var param_1 = require("../../params/param");
var rejectFactory_1 = require("../../transition/rejectFactory");
var targetState_1 = require("../targetState");
var viewHooks_1 = require("./viewHooks");
var enterExitHooks_1 = require("./enterExitHooks");
var resolveHooks_1 = require("./resolveHooks");
var TransitionManager = (function () {
    function TransitionManager(transition, $transitions, $urlRouter, $view, $state, $stateParams, $q, activeTransQ, changeHistory) {
        this.transition = transition;
        this.$transitions = $transitions;
        this.$urlRouter = $urlRouter;
        this.$view = $view;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.activeTransQ = activeTransQ;
        this.changeHistory = changeHistory;
        this.viewHooks = new viewHooks_1.ViewHooks(transition, $view);
        this.enterExitHooks = new enterExitHooks_1.EnterExitHooks(transition);
        this.resolveHooks = new resolveHooks_1.ResolveHooks(transition);
        this.treeChanges = transition.treeChanges();
        this.registerUpdateGlobalState();
        this.viewHooks.registerHooks();
        this.enterExitHooks.registerHooks();
        this.resolveHooks.registerHooks();
    }
    TransitionManager.prototype.runTransition = function () {
        var _this = this;
        this.activeTransQ.clear();
        this.activeTransQ.enqueue(this.transition);
        return this.transition.run()
            .then(function (trans) { return trans.to(); })
            .catch(function (error) { return _this.transRejected(error); })
            .finally(function () { return _this.activeTransQ.remove(_this.transition); });
    };
    TransitionManager.prototype.registerUpdateGlobalState = function () {
        this.transition.onFinish({}, this.updateGlobalState.bind(this), { priority: -10000 });
    };
    TransitionManager.prototype.updateGlobalState = function () {
        var _a = this, treeChanges = _a.treeChanges, transition = _a.transition, $state = _a.$state, changeHistory = _a.changeHistory;
        $state.$current = transition.$to();
        $state.current = $state.$current.self;
        changeHistory.enqueue(treeChanges);
        this.updateStateParams();
    };
    TransitionManager.prototype.transRejected = function (error) {
        var _a = this, transition = _a.transition, $state = _a.$state, $stateParams = _a.$stateParams, $q = _a.$q;
        if (error instanceof rejectFactory_1.TransitionRejection) {
            if (error.type === rejectFactory_1.RejectType.IGNORED) {
                var dynamic = $state.$current.parameters().filter(common_1.prop('dynamic'));
                if (!param_1.Param.equals(dynamic, $stateParams, transition.params())) {
                    this.updateStateParams();
                }
                return $state.current;
            }
            if (error.type === rejectFactory_1.RejectType.SUPERSEDED && error.redirected && error.detail instanceof targetState_1.TargetState) {
                return this._redirectMgr(transition.redirect(error.detail)).runTransition();
            }
        }
        this.$transitions.defaultErrorHandler()(error);
        return $q.reject(error);
    };
    TransitionManager.prototype.updateStateParams = function () {
        var _a = this, transition = _a.transition, $urlRouter = _a.$urlRouter, $state = _a.$state, $stateParams = _a.$stateParams;
        var options = transition.options();
        $state.params = transition.params();
        common_1.copy($state.params, $stateParams);
        $stateParams.$sync().$off();
        if (options.location && $state.$current.navigable) {
            $urlRouter.push($state.$current.navigable.url, $stateParams, { replace: options.location === 'replace' });
        }
        $urlRouter.update(true);
    };
    TransitionManager.prototype._redirectMgr = function (redirect) {
        var _a = this, $transitions = _a.$transitions, $urlRouter = _a.$urlRouter, $view = _a.$view, $state = _a.$state, $stateParams = _a.$stateParams, $q = _a.$q, activeTransQ = _a.activeTransQ, changeHistory = _a.changeHistory;
        return new TransitionManager(redirect, $transitions, $urlRouter, $view, $state, $stateParams, $q, activeTransQ, changeHistory);
    };
    return TransitionManager;
})();
exports.TransitionManager = TransitionManager;
//# sourceMappingURL=transitionManager.js.map