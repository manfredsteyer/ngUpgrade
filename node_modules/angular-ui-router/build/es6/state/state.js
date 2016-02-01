import { extend, defaults, equalForKeys, isDefined, isObject, isString } from "../common/common";
import { Queue } from "../common/queue";
import { Glob, StateQueueManager, StateBuilder, StateMatcher, TargetState } from "./module";
import { RejectFactory, defaultTransOpts } from "../transition/module";
import { PathFactory, Node } from "../path/module";
import { TransitionManager } from "./hooks/transitionManager";
import { Param, StateParams } from "../params/module";
export function $StateProvider($urlRouterProvider, $urlMatcherFactoryProvider) {
    let root, states = {};
    let $state = function $state() { };
    let matcher = new StateMatcher(states);
    let builder = new StateBuilder(() => root, matcher, $urlMatcherFactoryProvider);
    let stateQueue = new StateQueueManager(states, builder, $urlRouterProvider, $state);
    let transQueue = new Queue();
    let treeChangesQueue = new Queue();
    let rejectFactory = new RejectFactory();
    this.decorator = decorator;
    function decorator(name, func) {
        return builder.builder(name, func) || this;
    }
    this.state = state;
    function state(name, definition) {
        if (isObject(name)) {
            definition = name;
        }
        else {
            definition.name = name;
        }
        stateQueue.register(definition);
        return this;
    }
    let invalidCallbacks = [];
    this.onInvalid = onInvalid;
    function onInvalid(callback) {
        invalidCallbacks.push(callback);
    }
    this.$get = $get;
    $get.$inject = ['$q', '$injector', '$view', '$stateParams', '$urlRouter', '$transitions'];
    function $get($q, $injector, $view, $stateParams, $urlRouter, _$transition) {
        function handleInvalidTargetState(fromPath, $to$) {
            const latestThing = () => transQueue.peekTail() || treeChangesQueue.peekTail();
            let latest = latestThing();
            let $from$ = PathFactory.makeTargetState(fromPath);
            let callbackQueue = new Queue([].concat(invalidCallbacks));
            const invokeCallback = (callback) => $q.when($injector.invoke(callback, null, { $to$, $from$ }));
            function checkForRedirect(result) {
                if (!(result instanceof TargetState)) {
                    return;
                }
                let target = result;
                target = $state.target(target.identifier(), target.params(), target.options());
                if (!target.valid())
                    return rejectFactory.invalid(target.error());
                if (latestThing() !== latest)
                    return rejectFactory.superseded();
                return $state.transitionTo(target.identifier(), target.params(), target.options());
            }
            function invokeNextCallback() {
                let nextCallback = callbackQueue.dequeue();
                if (nextCallback === undefined)
                    return rejectFactory.invalid($to$.error());
                return invokeCallback(nextCallback).then(checkForRedirect).then(result => result || invokeNextCallback());
            }
            return invokeNextCallback();
        }
        let $transitions = _$transition;
        let rootStateDef = {
            name: '',
            url: '^',
            views: null,
            params: {
                '#': { value: null, type: 'hash' }
            },
            abstract: true
        };
        root = stateQueue.register(rootStateDef, true);
        root.navigable = null;
        const rootPath = () => PathFactory.bindTransNodesToPath([new Node(root, {})]);
        $view.rootContext(root);
        extend($state, {
            params: new StateParams(),
            current: root.self,
            $current: root,
            transition: null
        });
        stateQueue.flush($state);
        stateQueue.autoFlush = true;
        $state.reload = function reload(reloadState) {
            return $state.transitionTo($state.current, $stateParams, {
                reload: isDefined(reloadState) ? reloadState : true,
                inherit: false,
                notify: false
            });
        };
        $state.go = function go(to, params, options) {
            let defautGoOpts = { relative: $state.$current, inherit: true };
            let transOpts = defaults(options, defautGoOpts, defaultTransOpts);
            return $state.transitionTo(to, params, transOpts);
        };
        $state.target = function target(identifier, params, options = {}) {
            let stateDefinition = matcher.find(identifier, options.relative);
            return new TargetState(identifier, stateDefinition, params, options);
        };
        $state.transitionTo = function transitionTo(to, toParams = {}, options = {}) {
            options = defaults(options, defaultTransOpts);
            options = extend(options, { current: transQueue.peekTail.bind(transQueue) });
            if (isObject(options.reload) && !options.reload.name)
                throw new Error('Invalid reload state object');
            options.reloadState = options.reload === true ? $state.$current.path[0] : matcher.find(options.reload, options.relative);
            if (options.reload && !options.reloadState)
                throw new Error(`No such reload state '${(isString(options.reload) ? options.reload : options.reload.name)}'`);
            let ref = $state.target(to, toParams, options);
            let latestTreeChanges = treeChangesQueue.peekTail();
            let currentPath = latestTreeChanges ? latestTreeChanges.to : rootPath();
            if (!ref.exists())
                return handleInvalidTargetState(currentPath, ref);
            if (!ref.valid())
                return $q.reject(ref.error());
            let transition = $transitions.create(currentPath, ref);
            let tMgr = new TransitionManager(transition, $transitions, $urlRouter, $view, $state, $stateParams, $q, transQueue, treeChangesQueue);
            let transitionPromise = tMgr.runTransition();
            return extend(transitionPromise, { transition });
        };
        $state.is = function is(stateOrName, params, options) {
            options = defaults(options, { relative: $state.$current });
            let state = matcher.find(stateOrName, options.relative);
            if (!isDefined(state))
                return undefined;
            if ($state.$current !== state)
                return false;
            return isDefined(params) && params !== null ? Param.equals(state.parameters(), $stateParams, params) : true;
        };
        $state.includes = function includes(stateOrName, params, options) {
            options = defaults(options, { relative: $state.$current });
            let glob = isString(stateOrName) && Glob.fromString(stateOrName);
            if (glob) {
                if (!glob.matches($state.$current.name))
                    return false;
                stateOrName = $state.$current.name;
            }
            let state = matcher.find(stateOrName, options.relative), include = $state.$current.includes;
            if (!isDefined(state))
                return undefined;
            if (!isDefined(include[state.name]))
                return false;
            return params ? equalForKeys(Param.values(state.parameters(), params), $stateParams, Object.keys(params)) : true;
        };
        $state.href = function href(stateOrName, params, options) {
            let defaultHrefOpts = {
                lossy: true,
                inherit: true,
                absolute: false,
                relative: $state.$current
            };
            options = defaults(options, defaultHrefOpts);
            let state = matcher.find(stateOrName, options.relative);
            if (!isDefined(state))
                return null;
            if (options.inherit)
                params = $stateParams.$inherit(params || {}, $state.$current, state);
            let nav = (state && options.lossy) ? state.navigable : state;
            if (!nav || nav.url === undefined || nav.url === null) {
                return null;
            }
            return $urlRouter.href(nav.url, Param.values(state.parameters(), params), {
                absolute: options.absolute
            });
        };
        $state.get = function (stateOrName, base) {
            if (arguments.length === 0)
                return Object.keys(states).map(function (name) { return states[name].self; });
            let found = matcher.find(stateOrName, base || $state.$current);
            return found && found.self || null;
        };
        return $state;
    }
}
//# sourceMappingURL=state.js.map