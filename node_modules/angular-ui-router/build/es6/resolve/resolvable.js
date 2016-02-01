import { extend, pick, map, filter, not, isFunction } from "../common/common";
import { services } from "../common/coreservices";
import { trace } from "../common/trace";
export class Resolvable {
    constructor(name, resolveFn, preResolvedData) {
        this.promise = undefined;
        extend(this, { name, resolveFn, deps: services.$injector.annotate(resolveFn), data: preResolvedData });
    }
    resolveResolvable(resolveContext, options = {}) {
        let { name, deps, resolveFn } = this;
        trace.traceResolveResolvable(this, options);
        var deferred = services.$q.defer();
        this.promise = deferred.promise;
        var ancestorsByName = resolveContext.getResolvables(null, { omitOwnLocals: [name] });
        var depResolvables = pick(ancestorsByName, deps);
        var depPromises = map(depResolvables, (resolvable) => resolvable.get(resolveContext, options));
        return services.$q.all(depPromises).then(locals => {
            try {
                var result = services.$injector.invoke(resolveFn, null, locals);
                deferred.resolve(result);
            }
            catch (error) {
                deferred.reject(error);
            }
            return this.promise;
        }).then(data => {
            this.data = data;
            trace.traceResolvableResolved(this, options);
            return this.promise;
        });
    }
    get(resolveContext, options) {
        return this.promise || this.resolveResolvable(resolveContext, options);
    }
    toString() {
        return `Resolvable(name: ${this.name}, requires: [${this.deps}])`;
    }
    static makeResolvables(resolves) {
        let invalid = filter(resolves, not(isFunction)), keys = Object.keys(invalid);
        if (keys.length)
            throw new Error(`Invalid resolve key/value: ${keys[0]}/${invalid[keys[0]]}`);
        return map(resolves, (fn, name) => new Resolvable(name, fn));
    }
}
//# sourceMappingURL=resolvable.js.map