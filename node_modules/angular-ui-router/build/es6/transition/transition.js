import { trace } from "../common/trace";
import { services } from "../common/coreservices";
import { map, find, extend, filter, mergeR, unnest, tail, omit, isObject, not, prop, propEq, toJson, val, abstractKey, arrayTuples, allTrueR } from "../common/common";
import { $transitions, TransitionHook, HookRegistry, matchState, HookBuilder, RejectFactory } from "./module";
import { Node, PathFactory } from "../path/module";
import { TargetState } from "../state/module";
import { Param } from "../params/module";
import { Resolvable } from "../resolve/module";
let transitionCount = 0, REJECT = new RejectFactory();
const stateSelf = prop("self");
export class Transition {
    constructor(fromPath, targetState) {
        this._deferred = services.$q.defer();
        this.promise = this._deferred.promise;
        this.treeChanges = () => this._treeChanges;
        this.isActive = () => this === this._options.current();
        if (!targetState.valid()) {
            throw new Error(targetState.error());
        }
        HookRegistry.mixin(new HookRegistry(), this);
        this._options = extend({ current: val(this) }, targetState.options());
        this.$id = transitionCount++;
        let toPath = PathFactory.buildToPath(fromPath, targetState);
        this._treeChanges = PathFactory.treeChanges(fromPath, toPath, this._options.reloadState);
        PathFactory.bindTransitionResolve(this._treeChanges, this);
    }
    $from() {
        return tail(this._treeChanges.from).state;
    }
    $to() {
        return tail(this._treeChanges.to).state;
    }
    from() {
        return this.$from().self;
    }
    to() {
        return this.$to().self;
    }
    is(compare) {
        if (compare instanceof Transition) {
            return this.is({ to: compare.$to().name, from: compare.$from().name });
        }
        return !((compare.to && !matchState(this.$to(), compare.to)) ||
            (compare.from && !matchState(this.$from(), compare.from)));
    }
    params(pathname = "to") {
        return this._treeChanges[pathname].map(prop("values")).reduce(mergeR, {});
    }
    resolves() {
        return map(tail(this._treeChanges.to).resolveContext.getResolvables(), res => res.data);
    }
    addResolves(resolves, state = "") {
        let stateName = (typeof state === "string") ? state : state.name;
        let topath = this._treeChanges.to;
        let targetNode = find(topath, node => node.state.name === stateName);
        tail(topath).resolveContext.addResolvables(Resolvable.makeResolvables(resolves), targetNode.state);
    }
    previous() {
        return this._options.previous || null;
    }
    options() {
        return this._options;
    }
    entering() {
        return map(this._treeChanges.entering, prop('state')).map(stateSelf);
    }
    exiting() {
        return map(this._treeChanges.exiting, prop('state')).map(stateSelf).reverse();
    }
    retained() {
        return map(this._treeChanges.retained, prop('state')).map(stateSelf);
    }
    views(pathname = "entering", state) {
        let path = this._treeChanges[pathname];
        return state ? find(path, propEq('state', state)).views : unnest(path.map(prop("views")));
    }
    redirect(targetState) {
        let newOptions = extend({}, this.options(), targetState.options(), { previous: this });
        targetState = new TargetState(targetState.identifier(), targetState.$state(), targetState.params(), newOptions);
        let redirectTo = new Transition(this._treeChanges.from, targetState);
        let redirectedPath = this.treeChanges().to;
        let matching = Node.matching(redirectTo.treeChanges().to, redirectedPath);
        const includeResolve = (resolve, key) => ['$stateParams', '$transition$'].indexOf(key) === -1;
        matching.forEach((node, idx) => extend(node.resolves, filter(redirectedPath[idx].resolves, includeResolve)));
        return redirectTo;
    }
    ignored() {
        let { to, from } = this._treeChanges;
        if (this._options.reload || tail(to).state !== tail(from).state)
            return false;
        let nodeSchemas = to.map(node => node.schema.filter(not(prop('dynamic'))));
        let [toValues, fromValues] = [to, from].map(path => path.map(prop('values')));
        let tuples = arrayTuples(nodeSchemas, toValues, fromValues);
        return tuples.map(([schema, toVals, fromVals]) => Param.equals(schema, toVals, fromVals)).reduce(allTrueR, true);
    }
    hookBuilder() {
        return new HookBuilder($transitions, this, {
            transition: this,
            current: this._options.current
        });
    }
    run() {
        let hookBuilder = this.hookBuilder();
        let runSynchronousHooks = TransitionHook.runSynchronousHooks;
        const runSuccessHooks = () => runSynchronousHooks(hookBuilder.getOnSuccessHooks(), {}, true);
        const runErrorHooks = ($error$) => runSynchronousHooks(hookBuilder.getOnErrorHooks(), { $error$ }, true);
        this.promise.then(runSuccessHooks, runErrorHooks);
        let syncResult = runSynchronousHooks(hookBuilder.getOnBeforeHooks());
        if (TransitionHook.isRejection(syncResult)) {
            let rejectReason = syncResult.reason;
            this._deferred.reject(rejectReason);
            return this.promise;
        }
        if (!this.valid()) {
            let error = new Error(this.error());
            this._deferred.reject(error);
            return this.promise;
        }
        if (this.ignored()) {
            trace.traceTransitionIgnored(this);
            let ignored = REJECT.ignored();
            this._deferred.reject(ignored.reason);
            return this.promise;
        }
        const resolve = () => {
            this._deferred.resolve(this);
            trace.traceSuccess(this.$to(), this);
        };
        const reject = (error) => {
            this._deferred.reject(error);
            trace.traceError(error, this);
            return services.$q.reject(error);
        };
        trace.traceTransitionStart(this);
        let chain = hookBuilder.asyncHooks().reduce((_chain, step) => _chain.then(step.invokeStep), syncResult);
        chain.then(resolve, reject);
        return this.promise;
    }
    valid() {
        return !this.error();
    }
    error() {
        let state = this.$to();
        if (state.self[abstractKey])
            return `Cannot transition to abstract state '${state.name}'`;
        if (!Param.validates(state.parameters(), this.params()))
            return `Param values not valid for state '${state.name}'`;
    }
    toString() {
        let fromStateOrName = this.from();
        let toStateOrName = this.to();
        const avoidEmptyHash = (params) => (params["#"] !== null && params["#"] !== undefined) ? params : omit(params, "#");
        let id = this.$id, from = isObject(fromStateOrName) ? fromStateOrName.name : fromStateOrName, fromParams = toJson(avoidEmptyHash(this._treeChanges.from.map(prop('values')).reduce(mergeR, {}))), toValid = this.valid() ? "" : "(X) ", to = isObject(toStateOrName) ? toStateOrName.name : toStateOrName, toParams = toJson(avoidEmptyHash(this.params()));
        return `Transition#${id}( '${from}'${fromParams} -> ${toValid}'${to}'${toParams} )`;
    }
}
//# sourceMappingURL=transition.js.map