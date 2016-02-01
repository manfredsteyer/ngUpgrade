import { defaults, extend, noop, not, isDefined, pattern, val, eq, is, isPromise, parse, fnToString, maxLength } from "../common/common";
import { trace } from "../common/trace";
import { services } from "../common/coreservices";
import { TransitionRejection, RejectFactory } from "./rejectFactory";
import { TargetState } from "../state/module";
let REJECT = new RejectFactory();
let defaultOptions = {
    async: true,
    rejectIfSuperseded: true,
    current: noop,
    transition: null,
    traceData: {}
};
export class TransitionHook {
    constructor(fn, locals, resolveContext, options) {
        this.fn = fn;
        this.locals = locals;
        this.resolveContext = resolveContext;
        this.options = options;
        this.isSuperseded = () => this.options.current() !== this.options.transition;
        this.mapHookResult = pattern([
            [this.isSuperseded, () => REJECT.superseded(this.options.current())],
            [eq(false), val(REJECT.aborted("Hook aborted transition"))],
            [is(TargetState), (target) => REJECT.redirected(target)],
            [isPromise, (promise) => promise.then(this.handleHookResult.bind(this))]
        ]);
        this.invokeStep = (moreLocals) => {
            let { options, fn, resolveContext } = this;
            let locals = extend({}, this.locals, moreLocals);
            trace.traceHookInvocation(this, options);
            if (options.rejectIfSuperseded && this.isSuperseded()) {
                return REJECT.superseded(options.current());
            }
            if (!options.async) {
                let hookResult = resolveContext.invokeNow(fn, locals, options);
                return this.handleHookResult(hookResult);
            }
            return resolveContext.invokeLater(fn, locals, options).then(this.handleHookResult.bind(this));
        };
        this.options = defaults(options, defaultOptions);
    }
    handleHookResult(hookResult) {
        if (!isDefined(hookResult))
            return undefined;
        trace.traceHookResult(hookResult, undefined, this.options);
        let transitionResult = this.mapHookResult(hookResult);
        if (transitionResult)
            trace.traceHookResult(hookResult, transitionResult, this.options);
        return transitionResult;
    }
    toString() {
        let { options, fn } = this;
        let event = parse("traceData.hookType")(options) || "internal", context = parse("traceData.context.state.name")(options) || parse("traceData.context")(options) || "unknown", name = fnToString(fn);
        return `${event} context: ${context}, ${maxLength(200, name)}`;
    }
    static runSynchronousHooks(hooks, locals = {}, swallowExceptions = false) {
        let results = [];
        for (let i = 0; i < hooks.length; i++) {
            try {
                results.push(hooks[i].invokeStep(locals));
            }
            catch (exception) {
                if (!swallowExceptions)
                    throw exception;
                console.log("Swallowed exception during synchronous hook handler: " + exception);
            }
        }
        let rejections = results.filter(TransitionHook.isRejection);
        if (rejections.length)
            return rejections[0];
        return results
            .filter(not(TransitionHook.isRejection))
            .filter(isPromise)
            .reduce((chain, promise) => chain.then(val(promise)), services.$q.when());
    }
    static isRejection(hookResult) {
        return hookResult && hookResult.reason instanceof TransitionRejection && hookResult;
    }
}
//# sourceMappingURL=transitionHook.js.map