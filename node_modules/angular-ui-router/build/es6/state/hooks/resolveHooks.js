import { extend, find, propEq, tail } from "../../common/common";
import { ResolvePolicy } from "../../resolve/interface";
let LAZY = ResolvePolicy[ResolvePolicy.LAZY];
let EAGER = ResolvePolicy[ResolvePolicy.EAGER];
export class ResolveHooks {
    constructor(transition) {
        this.transition = transition;
    }
    registerHooks() {
        let treeChanges = this.transition.treeChanges();
        $eagerResolvePath.$inject = ['$transition$'];
        function $eagerResolvePath($transition$) {
            return tail(treeChanges.to).resolveContext.resolvePath(extend({ transition: $transition$ }, { resolvePolicy: EAGER }));
        }
        $lazyResolveEnteringState.$inject = ['$state$', '$transition$'];
        function $lazyResolveEnteringState($state$, $transition$) {
            let node = find(treeChanges.entering, propEq('state', $state$));
            return node.resolveContext.resolvePathElement(node.state, extend({ transition: $transition$ }, { resolvePolicy: LAZY }));
        }
        this.transition.onStart({}, $eagerResolvePath, { priority: 1000 });
        this.transition.onEnter({}, $lazyResolveEnteringState, { priority: 1000 });
    }
}
//# sourceMappingURL=resolveHooks.js.map