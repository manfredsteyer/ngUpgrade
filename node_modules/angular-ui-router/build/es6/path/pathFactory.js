import { extend, find, prop, propEq, pick, omit, not, curry, tail, mergeR } from "../common/common";
import { TargetState } from "../state/module";
import { Node } from "../path/module";
import { ResolveContext, Resolvable, ResolveInjector } from "../resolve/module";
export class PathFactory {
    constructor() {
    }
    static makeTargetState(path) {
        let state = tail(path).state;
        return new TargetState(state, state, path.map(prop("values")).reduce(mergeR, {}));
    }
    static buildToPath(fromPath, targetState) {
        let toParams = targetState.params();
        const toParamsNodeFn = PathFactory.makeParamsNode(toParams);
        let toPath = targetState.$state().path.map(toParamsNodeFn);
        if (targetState.options().inherit)
            toPath = PathFactory.inheritParams(fromPath, toPath, Object.keys(toParams));
        return toPath;
    }
    static inheritParams(fromPath, toPath, toKeys = []) {
        function nodeParamVals(path, state) {
            let node = find(path, propEq('state', state));
            return extend({}, node && node.values);
        }
        let makeInheritedParamsNode = curry(function (_fromPath, _toKeys, toNode) {
            let toParamVals = extend({}, toNode && toNode.values);
            let incomingParamVals = pick(toParamVals, _toKeys);
            toParamVals = omit(toParamVals, _toKeys);
            let fromParamVals = nodeParamVals(_fromPath, toNode.state) || {};
            let ownParamVals = extend(toParamVals, fromParamVals, incomingParamVals);
            return new Node(toNode.state, ownParamVals);
        });
        return toPath.map(makeInheritedParamsNode(fromPath, toKeys));
    }
    static bindTransNodesToPath(resolvePath) {
        let resolveContext = new ResolveContext(resolvePath);
        resolvePath.forEach((node) => {
            node.resolveContext = resolveContext.isolateRootTo(node.state);
            node.resolveInjector = new ResolveInjector(node.resolveContext, node.state);
            node.resolves.$stateParams = new Resolvable("$stateParams", () => node.values, node.values);
        });
        return resolvePath;
    }
    static treeChanges(fromPath, toPath, reloadState) {
        let keep = 0, max = Math.min(fromPath.length, toPath.length);
        const staticParams = (state) => state.parameters({ inherit: false }).filter(not(prop('dynamic'))).map(prop('id'));
        const nodesMatch = (node1, node2) => node1.equals(node2, staticParams(node1.state));
        while (keep < max && fromPath[keep].state !== reloadState && nodesMatch(fromPath[keep], toPath[keep])) {
            keep++;
        }
        function applyToParams(retainedNode, idx) {
            return Node.clone(retainedNode, { values: toPath[idx].values });
        }
        let from, retained, exiting, entering, to;
        let retainedWithToParams, enteringResolvePath, toResolvePath;
        from = fromPath;
        retained = from.slice(0, keep);
        exiting = from.slice(keep);
        retainedWithToParams = retained.map(applyToParams);
        enteringResolvePath = toPath.slice(keep);
        toResolvePath = (retainedWithToParams).concat(enteringResolvePath);
        to = PathFactory.bindTransNodesToPath(toResolvePath);
        entering = to.slice(keep);
        return { from, to, retained, exiting, entering };
    }
    static bindTransitionResolve(treeChanges, transition) {
        let rootNode = treeChanges.to[0];
        rootNode.resolves.$transition$ = new Resolvable('$transition$', () => transition, transition);
    }
}
PathFactory.makeParamsNode = curry((params, state) => new Node(state, params));
//# sourceMappingURL=pathFactory.js.map