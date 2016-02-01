import { extend, defaults, values, find, propEq } from "../common/module";
export class State {
    constructor(config) {
        extend(this, config);
    }
    is(ref) {
        return this === ref || this.self === ref || this.fqn() === ref;
    }
    fqn() {
        if (!this.parent || !(this.parent instanceof this.constructor))
            return this.name;
        let name = this.parent.fqn();
        return name ? name + "." + this.name : this.name;
    }
    root() {
        return this.parent && this.parent.root() || this;
    }
    parameters(opts) {
        opts = defaults(opts, { inherit: true });
        var inherited = opts.inherit && this.parent && this.parent.parameters() || [];
        return inherited.concat(values(this.params));
    }
    parameter(id, opts = {}) {
        return (this.url && this.url.parameter(id, opts) ||
            find(values(this.params), propEq('id', id)) ||
            opts.inherit && this.parent && this.parent.parameter(id));
    }
    toString() {
        return this.fqn();
    }
}
//# sourceMappingURL=stateObject.js.map