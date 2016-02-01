var common_1 = require("../../common/common");
var interface_1 = require("../../resolve/interface");
var LAZY = interface_1.ResolvePolicy[interface_1.ResolvePolicy.LAZY];
var EAGER = interface_1.ResolvePolicy[interface_1.ResolvePolicy.EAGER];
var ResolveHooks = (function () {
    function ResolveHooks(transition) {
        this.transition = transition;
    }
    ResolveHooks.prototype.registerHooks = function () {
        var treeChanges = this.transition.treeChanges();
        $eagerResolvePath.$inject = ['$transition$'];
        function $eagerResolvePath($transition$) {
            return common_1.tail(treeChanges.to).resolveContext.resolvePath(common_1.extend({ transition: $transition$ }, { resolvePolicy: EAGER }));
        }
        $lazyResolveEnteringState.$inject = ['$state$', '$transition$'];
        function $lazyResolveEnteringState($state$, $transition$) {
            var node = common_1.find(treeChanges.entering, common_1.propEq('state', $state$));
            return node.resolveContext.resolvePathElement(node.state, common_1.extend({ transition: $transition$ }, { resolvePolicy: LAZY }));
        }
        this.transition.onStart({}, $eagerResolvePath, { priority: 1000 });
        this.transition.onEnter({}, $lazyResolveEnteringState, { priority: 1000 });
    };
    return ResolveHooks;
})();
exports.ResolveHooks = ResolveHooks;
//# sourceMappingURL=resolveHooks.js.map