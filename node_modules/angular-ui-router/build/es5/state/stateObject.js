var module_1 = require("../common/module");
var State = (function () {
    function State(config) {
        module_1.extend(this, config);
    }
    State.prototype.is = function (ref) {
        return this === ref || this.self === ref || this.fqn() === ref;
    };
    State.prototype.fqn = function () {
        if (!this.parent || !(this.parent instanceof this.constructor))
            return this.name;
        var name = this.parent.fqn();
        return name ? name + "." + this.name : this.name;
    };
    State.prototype.root = function () {
        return this.parent && this.parent.root() || this;
    };
    State.prototype.parameters = function (opts) {
        opts = module_1.defaults(opts, { inherit: true });
        var inherited = opts.inherit && this.parent && this.parent.parameters() || [];
        return inherited.concat(module_1.values(this.params));
    };
    State.prototype.parameter = function (id, opts) {
        if (opts === void 0) { opts = {}; }
        return (this.url && this.url.parameter(id, opts) ||
            module_1.find(module_1.values(this.params), module_1.propEq('id', id)) ||
            opts.inherit && this.parent && this.parent.parameter(id));
    };
    State.prototype.toString = function () {
        return this.fqn();
    };
    return State;
})();
exports.State = State;
//# sourceMappingURL=stateObject.js.map