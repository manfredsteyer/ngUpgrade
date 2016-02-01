import { extend, prop, propEq, applyPairs, map, find, allTrueR, values } from "../common/common";
import { Resolvable } from "../resolve/module";
import { ViewConfig } from "../view/view";
export class Node {
    constructor(state, params, resolves = {}) {
        this.state = state;
        this.schema = state.parameters({ inherit: false });
        const getParamVal = (paramDef) => [paramDef.id, paramDef.value(params[paramDef.id])];
        this.values = this.schema.reduce((memo, pDef) => applyPairs(memo, getParamVal(pDef)), {});
        this.resolves = extend(map(state.resolve, (fn, name) => new Resolvable(name, fn)), resolves);
        const makeViewConfig = (viewDeclarationObj, rawViewName) => new ViewConfig({ rawViewName, viewDeclarationObj, context: state, params });
        this.views = values(map(state.views, makeViewConfig));
    }
    parameter(name) {
        return find(this.schema, propEq("id", name));
    }
    equals(node, keys = this.schema.map(prop('id'))) {
        const paramValsEq = key => this.parameter(key).type.equals(this.values[key], node.values[key]);
        return this.state === node.state && keys.map(paramValsEq).reduce(allTrueR, true);
    }
    static clone(node, update = {}) {
        return new Node(node.state, (update.values || node.values), (update.resolves || node.resolves));
    }
    static matching(first, second) {
        let matchedCount = first.reduce((prev, node, i) => prev === i && i < second.length && node.state === second[i].state ? i + 1 : prev, 0);
        return first.slice(0, matchedCount);
    }
}
//# sourceMappingURL=node.js.map