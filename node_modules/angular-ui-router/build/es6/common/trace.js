import { isNull, isPromise, isNumber, fnToString, maxLength, padString, isInjectable, is, invoke, not, val, pattern, parse, isDefined, identity } from "../common/common";
import { Resolvable } from "../resolve/resolvable";
import { Transition } from "../transition/transition";
import { TransitionRejection } from "../transition/rejectFactory";
function promiseToString(p) {
    if (is(TransitionRejection)(p.reason))
        return p.reason.toString();
    return `Promise(${JSON.stringify(p)})`;
}
function functionToString(fn) {
    let fnStr = fnToString(fn);
    let namedFunctionMatch = fnStr.match(/^(function [^ ]+\([^)]*\))/);
    return namedFunctionMatch ? namedFunctionMatch[1] : fnStr;
}
const uiViewString = (viewData) => `ui-view id#${viewData.id}, contextual name '${viewData.name}@${viewData.creationContext}', fqn: '${viewData.fqn}'`;
const viewConfigString = (viewConfig) => `ViewConfig targeting ui-view: '${viewConfig.uiViewName}@${viewConfig.uiViewContextAnchor}', context: '${viewConfig.context.name}'`;
function normalizedCat(input) {
    return isNumber(input) ? Category[input] : Category[Category[input]];
}
function stringify(o) {
    let format = pattern([
        [not(isDefined), val("undefined")],
        [isNull, val("null")],
        [isPromise, promiseToString],
        [is(Transition), invoke("toString")],
        [is(Resolvable), invoke("toString")],
        [isInjectable, functionToString],
        [val(true), identity]
    ]);
    return JSON.stringify(o, (key, val) => format(val)).replace(/\\"/g, '"');
}
var Category;
(function (Category) {
    Category[Category["RESOLVE"] = 0] = "RESOLVE";
    Category[Category["TRANSITION"] = 1] = "TRANSITION";
    Category[Category["HOOK"] = 2] = "HOOK";
    Category[Category["INVOKE"] = 3] = "INVOKE";
    Category[Category["UIVIEW"] = 4] = "UIVIEW";
    Category[Category["VIEWCONFIG"] = 5] = "VIEWCONFIG";
})(Category || (Category = {}));
class Trace {
    constructor() {
        this._enabled = {};
        this.enable = (...categories) => this._set(true, categories);
        this.disable = (...categories) => this._set(false, categories);
        this.approximateDigests = 0;
    }
    _set(enabled, categories) {
        if (!categories.length) {
            categories = Object.keys(Category)
                .filter(k => isNaN(parseInt(k, 10)))
                .map(key => Category[key]);
        }
        categories.map(normalizedCat).forEach(category => this._enabled[category] = enabled);
    }
    enabled(category) {
        return !!this._enabled[normalizedCat(category)];
    }
    traceTransitionStart(transition) {
        if (!this.enabled(Category.TRANSITION))
            return;
        let tid = transition.$id, digest = this.approximateDigests, transitionStr = stringify(transition);
        console.log(`Transition #${tid} Digest #${digest}: Started  -> ${transitionStr}`);
    }
    traceTransitionIgnored(transition) {
        if (!this.enabled(Category.TRANSITION))
            return;
        let tid = transition.$id, digest = this.approximateDigests, transitionStr = stringify(transition);
        console.log(`Transition #${tid} Digest #${digest}: Ignored  <> ${transitionStr}`);
    }
    traceHookInvocation(step, options) {
        if (!this.enabled(Category.HOOK))
            return;
        let tid = parse("transition.$id")(options), digest = this.approximateDigests, event = parse("traceData.hookType")(options) || "internal", context = parse("traceData.context.state.name")(options) || parse("traceData.context")(options) || "unknown", name = functionToString(step.fn);
        console.log(`Transition #${tid} Digest #${digest}:   Hook -> ${event} context: ${context}, ${maxLength(200, name)}`);
    }
    traceHookResult(hookResult, transitionResult, transitionOptions) {
        if (!this.enabled(Category.HOOK))
            return;
        let tid = parse("transition.$id")(transitionOptions), digest = this.approximateDigests, hookResultStr = stringify(hookResult), transitionResultStr = stringify(transitionResult);
        console.log(`Transition #${tid} Digest #${digest}:   <- Hook returned: ${maxLength(200, hookResultStr)}, transition result: ${maxLength(200, transitionResultStr)}`);
    }
    traceResolvePath(path, options) {
        if (!this.enabled(Category.RESOLVE))
            return;
        let tid = parse("transition.$id")(options), digest = this.approximateDigests, pathStr = path && path.toString(), policyStr = options && options.resolvePolicy;
        console.log(`Transition #${tid} Digest #${digest}:         Resolving ${pathStr} (${policyStr})`);
    }
    traceResolvePathElement(pathElement, resolvablePromises, options) {
        if (!this.enabled(Category.RESOLVE))
            return;
        if (!resolvablePromises.length)
            return;
        let tid = parse("transition.$id")(options), digest = this.approximateDigests, resolvablePromisesStr = Object.keys(resolvablePromises).join(", "), pathElementStr = pathElement && pathElement.toString(), policyStr = options && options.resolvePolicy;
        console.log(`Transition #${tid} Digest #${digest}:         Resolve ${pathElementStr} resolvables: [${resolvablePromisesStr}] (${policyStr})`);
    }
    traceResolveResolvable(resolvable, options) {
        if (!this.enabled(Category.RESOLVE))
            return;
        let tid = parse("transition.$id")(options), digest = this.approximateDigests, resolvableStr = resolvable && resolvable.toString();
        console.log(`Transition #${tid} Digest #${digest}:               Resolving -> ${resolvableStr}`);
    }
    traceResolvableResolved(resolvable, options) {
        if (!this.enabled(Category.RESOLVE))
            return;
        let tid = parse("transition.$id")(options), digest = this.approximateDigests, resolvableStr = resolvable && resolvable.toString(), result = stringify(resolvable.data);
        console.log(`Transition #${tid} Digest #${digest}:               <- Resolved  ${resolvableStr} to: ${maxLength(200, result)}`);
    }
    tracePathElementInvoke(node, fn, deps, options) {
        if (!this.enabled(Category.INVOKE))
            return;
        let tid = parse("transition.$id")(options), digest = this.approximateDigests, stateName = node && node.state && node.state.toString(), fnName = functionToString(fn);
        console.log(`Transition #${tid} Digest #${digest}:         Invoke ${options.when}: context: ${stateName} ${maxLength(200, fnName)}`);
    }
    traceError(error, transition) {
        if (!this.enabled(Category.TRANSITION))
            return;
        let tid = transition.$id, digest = this.approximateDigests, transitionStr = stringify(transition);
        console.log(`Transition #${tid} Digest #${digest}: <- Rejected ${transitionStr}, reason: ${error}`);
    }
    traceSuccess(finalState, transition) {
        if (!this.enabled(Category.TRANSITION))
            return;
        let tid = transition.$id, digest = this.approximateDigests, state = finalState.name, transitionStr = stringify(transition);
        console.log(`Transition #${tid} Digest #${digest}: <- Success  ${transitionStr}, final state: ${state}`);
    }
    traceUiViewEvent(event, viewData, extra = "") {
        if (!this.enabled(Category.UIVIEW))
            return;
        console.log(`ui-view: ${padString(30, event)} ${uiViewString(viewData)}${extra}`);
    }
    traceUiViewConfigUpdated(viewData, context) {
        if (!this.enabled(Category.UIVIEW))
            return;
        this.traceUiViewEvent("Updating", viewData, ` with ViewConfig from context='${context}'`);
    }
    traceUiViewScopeCreated(viewData, newScope) {
        if (!this.enabled(Category.UIVIEW))
            return;
        this.traceUiViewEvent("Created scope for", viewData, `, scope #${newScope.$id}`);
    }
    traceUiViewFill(viewData, html) {
        if (!this.enabled(Category.UIVIEW))
            return;
        this.traceUiViewEvent("Fill", viewData, ` with: ${maxLength(200, html)}`);
    }
    traceViewServiceEvent(event, viewConfig) {
        if (!this.enabled(Category.VIEWCONFIG))
            return;
        console.log(`$view.ViewConfig: ${event} ${viewConfigString(viewConfig)}`);
    }
    traceViewServiceUiViewEvent(event, viewData) {
        if (!this.enabled(Category.VIEWCONFIG))
            return;
        console.log(`$view.ViewConfig: ${event} ${uiViewString(viewData)}`);
    }
}
let trace = new Trace();
export { trace };
watchDigests.$inject = ['$rootScope'];
function watchDigests($rootScope) {
    $rootScope.$watch(function () { trace.approximateDigests++; });
}
angular.module("ui.router").run(watchDigests);
angular.module("ui.router").service("$trace", () => trace);
//# sourceMappingURL=trace.js.map