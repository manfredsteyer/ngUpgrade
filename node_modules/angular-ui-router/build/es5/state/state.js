var common_1 = require("../common/common");
var queue_1 = require("../common/queue");
var module_1 = require("./module");
var module_2 = require("../transition/module");
var module_3 = require("../path/module");
var transitionManager_1 = require("./hooks/transitionManager");
var module_4 = require("../params/module");
function $StateProvider($urlRouterProvider, $urlMatcherFactoryProvider) {
    var root, states = {};
    var $state = function $state() { };
    var matcher = new module_1.StateMatcher(states);
    var builder = new module_1.StateBuilder(function () { return root; }, matcher, $urlMatcherFactoryProvider);
    var stateQueue = new module_1.StateQueueManager(states, builder, $urlRouterProvider, $state);
    var transQueue = new queue_1.Queue();
    var treeChangesQueue = new queue_1.Queue();
    var rejectFactory = new module_2.RejectFactory();
    this.decorator = decorator;
    function decorator(name, func) {
        return builder.builder(name, func) || this;
    }
    this.state = state;
    function state(name, definition) {
        if (common_1.isObject(name)) {
            definition = name;
        }
        else {
            definition.name = name;
        }
        stateQueue.register(definition);
        return this;
    }
    var invalidCallbacks = [];
    this.onInvalid = onInvalid;
    function onInvalid(callback) {
        invalidCallbacks.push(callback);
    }
    this.$get = $get;
    $get.$inject = ['$q', '$injector', '$view', '$stateParams', '$urlRouter', '$transitions'];
    function $get($q, $injector, $view, $stateParams, $urlRouter, _$transition) {
        function handleInvalidTargetState(fromPath, $to$) {
            var latestThing = function () { return transQueue.peekTail() || treeChangesQueue.peekTail(); };
            var latest = latestThing();
            var $from$ = module_3.PathFactory.makeTargetState(fromPath);
            var callbackQueue = new queue_1.Queue([].concat(invalidCallbacks));
            var invokeCallback = function (callback) { return $q.when($injector.invoke(callback, null, { $to$: $to$, $from$: $from$ })); };
            function checkForRedirect(result) {
                if (!(result instanceof module_1.TargetState)) {
                    return;
                }
                var target = result;
                target = $state.target(target.identifier(), target.params(), target.options());
                if (!target.valid())
                    return rejectFactory.invalid(target.error());
                if (latestThing() !== latest)
                    return rejectFactory.superseded();
                return $state.transitionTo(target.identifier(), target.params(), target.options());
            }
            function invokeNextCallback() {
                var nextCallback = callbackQueue.dequeue();
                if (nextCallback === undefined)
                    return rejectFactory.invalid($to$.error());
                return invokeCallback(nextCallback).then(checkForRedirect).then(function (result) { return result || invokeNextCallback(); });
            }
            return invokeNextCallback();
        }
        var $transitions = _$transition;
        var rootStateDef = {
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
        var rootPath = function () { return module_3.PathFactory.bindTransNodesToPath([new module_3.Node(root, {})]); };
        $view.rootContext(root);
        common_1.extend($state, {
            params: new module_4.StateParams(),
            current: root.self,
            $current: root,
            transition: null
        });
        stateQueue.flush($state);
        stateQueue.autoFlush = true;
        $state.reload = function reload(reloadState) {
            return $state.transitionTo($state.current, $stateParams, {
                reload: common_1.isDefined(reloadState) ? reloadState : true,
                inherit: false,
                notify: false
            });
        };
        $state.go = function go(to, params, options) {
            var defautGoOpts = { relative: $state.$current, inherit: true };
            var transOpts = common_1.defaults(options, defautGoOpts, module_2.defaultTransOpts);
            return $state.transitionTo(to, params, transOpts);
        };
        $state.target = function target(identifier, params, options) {
            if (options === void 0) { options = {}; }
            var stateDefinition = matcher.find(identifier, options.relative);
            return new module_1.TargetState(identifier, stateDefinition, params, options);
        };
        $state.transitionTo = function transitionTo(to, toParams, options) {
            if (toParams === void 0) { toParams = {}; }
            if (options === void 0) { options = {}; }
            options = common_1.defaults(options, module_2.defaultTransOpts);
            options = common_1.extend(options, { current: transQueue.peekTail.bind(transQueue) });
            if (common_1.isObject(options.reload) && !options.reload.name)
                throw new Error('Invalid reload state object');
            options.reloadState = options.reload === true ? $state.$current.path[0] : matcher.find(options.reload, options.relative);
            if (options.reload && !options.reloadState)
                throw new Error("No such reload state '" + (common_1.isString(options.reload) ? options.reload : options.reload.name) + "'");
            var ref = $state.target(to, toParams, options);
            var latestTreeChanges = treeChangesQueue.peekTail();
            var currentPath = latestTreeChanges ? latestTreeChanges.to : rootPath();
            if (!ref.exists())
                return handleInvalidTargetState(currentPath, ref);
            if (!ref.valid())
                return $q.reject(ref.error());
            var transition = $transitions.create(currentPath, ref);
            var tMgr = new transitionManager_1.TransitionManager(transition, $transitions, $urlRouter, $view, $state, $stateParams, $q, transQueue, treeChangesQueue);
            var transitionPromise = tMgr.runTransition();
            return common_1.extend(transitionPromise, { transition: transition });
        };
        $state.is = function is(stateOrName, params, options) {
            options = common_1.defaults(options, { relative: $state.$current });
            var state = matcher.find(stateOrName, options.relative);
            if (!common_1.isDefined(state))
                return undefined;
            if ($state.$current !== state)
                return false;
            return common_1.isDefined(params) && params !== null ? module_4.Param.equals(state.parameters(), $stateParams, params) : true;
        };
        $state.includes = function includes(stateOrName, params, options) {
            options = common_1.defaults(options, { relative: $state.$current });
            var glob = common_1.isString(stateOrName) && module_1.Glob.fromString(stateOrName);
            if (glob) {
                if (!glob.matches($state.$current.name))
                    return false;
                stateOrName = $state.$current.name;
            }
            var state = matcher.find(stateOrName, options.relative), include = $state.$current.includes;
            if (!common_1.isDefined(state))
                return undefined;
            if (!common_1.isDefined(include[state.name]))
                return false;
            return params ? common_1.equalForKeys(module_4.Param.values(state.parameters(), params), $stateParams, Object.keys(params)) : true;
        };
        $state.href = function href(stateOrName, params, options) {
            var defaultHrefOpts = {
                lossy: true,
                inherit: true,
                absolute: false,
                relative: $state.$current
            };
            options = common_1.defaults(options, defaultHrefOpts);
            var state = matcher.find(stateOrName, options.relative);
            if (!common_1.isDefined(state))
                return null;
            if (options.inherit)
                params = $stateParams.$inherit(params || {}, $state.$current, state);
            var nav = (state && options.lossy) ? state.navigable : state;
            if (!nav || nav.url === undefined || nav.url === null) {
                return null;
            }
            return $urlRouter.href(nav.url, module_4.Param.values(state.parameters(), params), {
                absolute: options.absolute
            });
        };
        $state.get = function (stateOrName, base) {
            if (arguments.length === 0)
                return Object.keys(states).map(function (name) { return states[name].self; });
            var found = matcher.find(stateOrName, base || $state.$current);
            return found && found.self || null;
        };
        return $state;
    }
}
exports.$StateProvider = $StateProvider;
//# sourceMappingURL=state.js.map