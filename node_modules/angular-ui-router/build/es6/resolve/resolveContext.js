import { find, filter, map, noop, tail, defaults, extend, prop, propEq, pick, omit, isString, isObject } from "../common/common";
import { trace } from "../common/trace";
import { services } from "../common/coreservices";
import { ResolvePolicy } from "./interface";
let defaultResolvePolicy = ResolvePolicy[ResolvePolicy.LAZY];
export class ResolveContext {
    constructor(_path) {
        this._path = _path;
        extend(this, {
            _nodeFor(state) {
                return find(this._path, propEq('state', state));
            },
            _pathTo(state) {
                let node = this._nodeFor(state);
                let elementIdx = this._path.indexOf(node);
                if (elementIdx === -1)
                    throw new Error("This path does not contain the state");
                return this._path.slice(0, elementIdx + 1);
            }
        });
    }
    getResolvables(state, options) {
        options = defaults(options, { omitOwnLocals: [] });
        const offset = find(this._path, propEq(''));
        const path = (state ? this._pathTo(state) : this._path);
        const last = tail(path);
        return path.reduce((memo, node) => {
            let omitProps = (node === last) ? options.omitOwnLocals : [];
            let filteredResolvables = omit(node.resolves, omitProps);
            return extend(memo, filteredResolvables);
        }, {});
    }
    getResolvablesForFn(fn) {
        let deps = services.$injector.annotate(fn);
        return pick(this.getResolvables(), deps);
    }
    isolateRootTo(state) {
        return new ResolveContext(this._pathTo(state));
    }
    addResolvables(resolvables, state) {
        extend(this._nodeFor(state).resolves, resolvables);
    }
    getOwnResolvables(state) {
        return extend({}, this._nodeFor(state).resolves);
    }
    resolvePath(options = {}) {
        trace.traceResolvePath(this._path, options);
        const promiseForNode = (node) => this.resolvePathElement(node.state, options);
        return services.$q.all(map(this._path, promiseForNode)).then(noop);
    }
    resolvePathElement(state, options = {}) {
        let policy = options && options.resolvePolicy;
        let policyOrdinal = ResolvePolicy[policy || defaultResolvePolicy];
        let resolvables = this.getOwnResolvables(state);
        const matchesRequestedPolicy = resolvable => getPolicy(state.resolvePolicy, resolvable) >= policyOrdinal;
        let matchingResolves = filter(resolvables, matchesRequestedPolicy);
        const getResolvePromise = (resolvable) => resolvable.get(this.isolateRootTo(state), options);
        let resolvablePromises = map(matchingResolves, getResolvePromise);
        trace.traceResolvePathElement(this, matchingResolves, options);
        return services.$q.all(resolvablePromises).then(noop);
    }
    invokeLater(fn, locals = {}, options = {}) {
        let resolvables = this.getResolvablesForFn(fn);
        trace.tracePathElementInvoke(tail(this._path), fn, Object.keys(resolvables), extend({ when: "Later" }, options));
        const getPromise = (resolvable) => resolvable.get(this, options);
        let promises = map(resolvables, getPromise);
        return services.$q.all(promises).then(() => {
            try {
                return this.invokeNow(fn, locals, options);
            }
            catch (error) {
                return services.$q.reject(error);
            }
        });
    }
    invokeNow(fn, locals, options = {}) {
        let resolvables = this.getResolvablesForFn(fn);
        trace.tracePathElementInvoke(tail(this._path), fn, Object.keys(resolvables), extend({ when: "Now  " }, options));
        let resolvedLocals = map(resolvables, prop("data"));
        return services.$injector.invoke(fn, null, extend({}, locals, resolvedLocals));
    }
}
function getPolicy(stateResolvePolicyConf, resolvable) {
    let stateLevelPolicy = (isString(stateResolvePolicyConf) ? stateResolvePolicyConf : null);
    let resolveLevelPolicies = (isObject(stateResolvePolicyConf) ? stateResolvePolicyConf : {});
    let policyName = resolveLevelPolicies[resolvable.name] || stateLevelPolicy || defaultResolvePolicy;
    return ResolvePolicy[policyName];
}
//# sourceMappingURL=resolveContext.js.map