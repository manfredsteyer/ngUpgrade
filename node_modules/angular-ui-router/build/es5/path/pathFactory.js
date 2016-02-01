var common_1 = require("../common/common");
var module_1 = require("../state/module");
var module_2 = require("../path/module");
var module_3 = require("../resolve/module");
var PathFactory = (function () {
    function PathFactory() {
    }
    PathFactory.makeTargetState = function (path) {
        var state = common_1.tail(path).state;
        return new module_1.TargetState(state, state, path.map(common_1.prop("values")).reduce(common_1.mergeR, {}));
    };
    PathFactory.buildToPath = function (fromPath, targetState) {
        var toParams = targetState.params();
        var toParamsNodeFn = PathFactory.makeParamsNode(toParams);
        var toPath = targetState.$state().path.map(toParamsNodeFn);
        if (targetState.options().inherit)
            toPath = PathFactory.inheritParams(fromPath, toPath, Object.keys(toParams));
        return toPath;
    };
    PathFactory.inheritParams = function (fromPath, toPath, toKeys) {
        if (toKeys === void 0) { toKeys = []; }
        function nodeParamVals(path, state) {
            var node = common_1.find(path, common_1.propEq('state', state));
            return common_1.extend({}, node && node.values);
        }
        var makeInheritedParamsNode = common_1.curry(function (_fromPath, _toKeys, toNode) {
            var toParamVals = common_1.extend({}, toNode && toNode.values);
            var incomingParamVals = common_1.pick(toParamVals, _toKeys);
            toParamVals = common_1.omit(toParamVals, _toKeys);
            var fromParamVals = nodeParamVals(_fromPath, toNode.state) || {};
            var ownParamVals = common_1.extend(toParamVals, fromParamVals, incomingParamVals);
            return new module_2.Node(toNode.state, ownParamVals);
        });
        return toPath.map(makeInheritedParamsNode(fromPath, toKeys));
    };
    PathFactory.bindTransNodesToPath = function (resolvePath) {
        var resolveContext = new module_3.ResolveContext(resolvePath);
        resolvePath.forEach(function (node) {
            node.resolveContext = resolveContext.isolateRootTo(node.state);
            node.resolveInjector = new module_3.ResolveInjector(node.resolveContext, node.state);
            node.resolves.$stateParams = new module_3.Resolvable("$stateParams", function () { return node.values; }, node.values);
        });
        return resolvePath;
    };
    PathFactory.treeChanges = function (fromPath, toPath, reloadState) {
        var keep = 0, max = Math.min(fromPath.length, toPath.length);
        var staticParams = function (state) { return state.parameters({ inherit: false }).filter(common_1.not(common_1.prop('dynamic'))).map(common_1.prop('id')); };
        var nodesMatch = function (node1, node2) { return node1.equals(node2, staticParams(node1.state)); };
        while (keep < max && fromPath[keep].state !== reloadState && nodesMatch(fromPath[keep], toPath[keep])) {
            keep++;
        }
        function applyToParams(retainedNode, idx) {
            return module_2.Node.clone(retainedNode, { values: toPath[idx].values });
        }
        var from, retained, exiting, entering, to;
        var retainedWithToParams, enteringResolvePath, toResolvePath;
        from = fromPath;
        retained = from.slice(0, keep);
        exiting = from.slice(keep);
        retainedWithToParams = retained.map(applyToParams);
        enteringResolvePath = toPath.slice(keep);
        toResolvePath = (retainedWithToParams).concat(enteringResolvePath);
        to = PathFactory.bindTransNodesToPath(toResolvePath);
        entering = to.slice(keep);
        return { from: from, to: to, retained: retained, exiting: exiting, entering: entering };
    };
    PathFactory.bindTransitionResolve = function (treeChanges, transition) {
        var rootNode = treeChanges.to[0];
        rootNode.resolves.$transition$ = new module_3.Resolvable('$transition$', function () { return transition; }, transition);
    };
    PathFactory.makeParamsNode = common_1.curry(function (params, state) { return new module_2.Node(state, params); });
    return PathFactory;
})();
exports.PathFactory = PathFactory;
//# sourceMappingURL=pathFactory.js.map