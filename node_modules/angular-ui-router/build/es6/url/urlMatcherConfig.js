import { isDefined, isString } from "../common/common";
class MatcherConfig {
    constructor() {
        this._isCaseInsensitive = false;
        this._isStrictMode = true;
        this._defaultSquashPolicy = false;
    }
    caseInsensitive(value) {
        return this._isCaseInsensitive = isDefined(value) ? value : this._isCaseInsensitive;
    }
    strictMode(value) {
        return this._isStrictMode = isDefined(value) ? value : this._isStrictMode;
    }
    defaultSquashPolicy(value) {
        if (isDefined(value) && value !== true && value !== false && !isString(value))
            throw new Error(`Invalid squash policy: ${value}. Valid policies: false, true, arbitrary-string`);
        return this._defaultSquashPolicy = isDefined(value) ? value : this._defaultSquashPolicy;
    }
}
export let matcherConfig = new MatcherConfig();
//# sourceMappingURL=urlMatcherConfig.js.map