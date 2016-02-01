var common_1 = require("../common/common");
var ResolveInjector = (function () {
    function ResolveInjector(_resolveContext, _state) {
        this._resolveContext = _resolveContext;
        this._state = _state;
    }
    ResolveInjector.prototype.invokeLater = function (injectedFn, locals) {
        return this._resolveContext.invokeLater(injectedFn, locals);
    };
    ResolveInjector.prototype.invokeNow = function (injectedFn, locals) {
        return this._resolveContext.invokeNow(null, injectedFn, locals);
    };
    ResolveInjector.prototype.getLocals = function (injectedFn) {
        var _this = this;
        var resolve = function (r) { return r.get(_this._resolveContext); };
        return common_1.map(this._resolveContext.getResolvablesForFn(injectedFn), resolve);
    };
    return ResolveInjector;
})();
exports.ResolveInjector = ResolveInjector;
//# sourceMappingURL=resolveInjector.js.map