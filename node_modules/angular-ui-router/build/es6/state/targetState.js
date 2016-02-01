export class TargetState {
    constructor(_identifier, _definition, _params = {}, _options = {}) {
        this._identifier = _identifier;
        this._definition = _definition;
        this._options = _options;
        this._params = _params || {};
    }
    name() {
        return this._definition && this._definition.name || this._identifier;
    }
    identifier() {
        return this._identifier;
    }
    params() {
        return this._params;
    }
    $state() {
        return this._definition;
    }
    state() {
        return this._definition && this._definition.self;
    }
    options() {
        return this._options;
    }
    exists() {
        return !!(this._definition && this._definition.self);
    }
    valid() {
        return !this.error();
    }
    error() {
        let base = this.options().relative;
        if (!this._definition && !!base) {
            let stateName = base.name ? base.name : base;
            return `Could not resolve '${this.name()}' from state '${stateName}'`;
        }
        if (!this._definition)
            return `No such state '${this.name()}'`;
        if (!this._definition.self)
            return `State '${this.name()}' has an invalid definition`;
    }
}
//# sourceMappingURL=targetState.js.map