import { find, propEq, noop } from "../../common/common";
import { services } from "../../common/coreservices";
import { annotateController } from "../../ng1/angular1";
export class ViewHooks {
    constructor(transition, $view) {
        this.transition = transition;
        this.$view = $view;
        this.treeChanges = transition.treeChanges();
        this.enteringViews = transition.views("entering");
        this.exitingViews = transition.views("exiting");
    }
    loadAllEnteringViews() {
        const loadView = (vc) => {
            let resolveInjector = find(this.treeChanges.to, propEq('state', vc.context)).resolveInjector;
            return this.$view.load(vc, resolveInjector);
        };
        return services.$q.all(this.enteringViews.map(loadView)).then(noop);
    }
    loadAllControllerLocals() {
        const loadLocals = (vc) => {
            let deps = annotateController(vc.controller);
            let resolveInjector = find(this.treeChanges.to, propEq('state', vc.context)).resolveInjector;
            function $loadControllerLocals() { }
            $loadControllerLocals.$inject = deps;
            return services.$q.all(resolveInjector.getLocals($loadControllerLocals)).then((locals) => vc.locals = locals);
        };
        let loadAllLocals = this.enteringViews.filter(vc => !!vc.controller).map(loadLocals);
        return services.$q.all(loadAllLocals).then(noop);
    }
    updateViews() {
        let $view = this.$view;
        this.exitingViews.forEach((viewConfig) => $view.reset(viewConfig));
        this.enteringViews.forEach((viewConfig) => $view.registerStateViewConfig(viewConfig));
        $view.sync();
    }
    registerHooks() {
        if (this.enteringViews.length) {
            this.transition.onStart({}, this.loadAllEnteringViews.bind(this));
            this.transition.onFinish({}, this.loadAllControllerLocals.bind(this));
        }
        if (this.exitingViews.length || this.enteringViews.length)
            this.transition.onSuccess({}, this.updateViews.bind(this));
    }
}
//# sourceMappingURL=viewHooks.js.map