import { map } from "../common/common";
export class ResolveInjector {
    constructor(_resolveContext, _state) {
        this._resolveContext = _resolveContext;
        this._state = _state;
    }
    invokeLater(injectedFn, locals) {
        return this._resolveContext.invokeLater(injectedFn, locals);
    }
    invokeNow(injectedFn, locals) {
        return this._resolveContext.invokeNow(null, injectedFn, locals);
    }
    getLocals(injectedFn) {
        const resolve = (r) => r.get(this._resolveContext);
        return map(this._resolveContext.getResolvablesForFn(injectedFn), resolve);
    }
}
//# sourceMappingURL=resolveInjector.js.map