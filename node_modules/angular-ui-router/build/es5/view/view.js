"use strict";
var common_1 = require("../common/common");
var module_1 = require("../common/module");
function normalizeUiViewTarget(rawViewName) {
    if (rawViewName === void 0) { rawViewName = ""; }
    var viewAtContext = rawViewName.split("@");
    var uiViewName = viewAtContext[0] || "$default";
    var uiViewContextAnchor = common_1.isString(viewAtContext[1]) ? viewAtContext[1] : "^";
    var relativeViewNameSugar = /^(\^(?:\.\^)*)\.(.*$)/.exec(uiViewName);
    if (relativeViewNameSugar) {
        uiViewContextAnchor = relativeViewNameSugar[1];
        uiViewName = relativeViewNameSugar[2];
    }
    if (uiViewName.charAt(0) === '!') {
        uiViewName = uiViewName.substr(1);
        uiViewContextAnchor = "";
    }
    return { uiViewName: uiViewName, uiViewContextAnchor: uiViewContextAnchor };
}
var ViewConfig = (function () {
    function ViewConfig(stateViewConfig) {
        var _a = normalizeUiViewTarget(stateViewConfig.rawViewName), uiViewName = _a.uiViewName, uiViewContextAnchor = _a.uiViewContextAnchor;
        var relativeMatch = /^(\^(?:\.\^)*)$/;
        if (relativeMatch.exec(uiViewContextAnchor)) {
            var anchor = uiViewContextAnchor.split(".").reduce((function (anchor, x) { return anchor.parent; }), stateViewConfig.context);
            uiViewContextAnchor = anchor.name;
        }
        common_1.extend(this, common_1.pick(stateViewConfig, "viewDeclarationObj", "params", "context", "locals"), { uiViewName: uiViewName, uiViewContextAnchor: uiViewContextAnchor });
        this.controllerAs = stateViewConfig.viewDeclarationObj.controllerAs;
    }
    ViewConfig.prototype.hasTemplate = function () {
        var viewDef = this.viewDeclarationObj;
        return !!(viewDef.template || viewDef.templateUrl || viewDef.templateProvider);
    };
    ViewConfig.prototype.getTemplate = function ($factory, injector) {
        return $factory.fromConfig(this.viewDeclarationObj, this.params, injector.invokeLater.bind(injector));
    };
    ViewConfig.prototype.getController = function (injector) {
        var provider = this.viewDeclarationObj.controllerProvider;
        return common_1.isInjectable(provider) ? injector.invokeLater(provider, {}) : this.viewDeclarationObj.controller;
    };
    return ViewConfig;
})();
exports.ViewConfig = ViewConfig;
$View.$inject = ['$rootScope', '$templateFactory', '$q', '$timeout'];
function $View($rootScope, $templateFactory, $q, $timeout) {
    var uiViews = [];
    var viewConfigs = [];
    var match = function (obj1) {
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        return function (obj2) { return keys.reduce((function (memo, key) { return memo && obj1[key] === obj2[key]; }), true); };
    };
    this.rootContext = function (context) {
        return context ? this._rootContext = context : this._rootContext;
    };
    this.load = function load(viewConfig, injector) {
        if (!viewConfig.hasTemplate())
            throw new Error("No template configuration specified for '" + viewConfig.uiViewName + "@" + viewConfig.uiViewContextAnchor + "'");
        var promises = {
            template: $q.when(viewConfig.getTemplate($templateFactory, injector)),
            controller: $q.when(viewConfig.getController(injector))
        };
        return $q.all(promises).then(function (results) {
            module_1.trace.traceViewServiceEvent("Loaded", viewConfig);
            return common_1.extend(viewConfig, results);
        });
    };
    this.reset = function reset(viewConfig) {
        module_1.trace.traceViewServiceEvent("<- Removing", viewConfig);
        viewConfigs.filter(match(viewConfig, "uiViewName", "context")).forEach(common_1.removeFrom(viewConfigs));
    };
    this.registerStateViewConfig = function (viewConfig) {
        module_1.trace.traceViewServiceEvent("-> Registering", viewConfig);
        viewConfigs.push(viewConfig);
    };
    this.sync = function () {
        var uiViewsByFqn = uiViews.map(function (uiv) { return [uiv.fqn, uiv]; }).reduce(common_1.applyPairs, {});
        var matches = common_1.curry(function (uiView, viewConfig) {
            var vcSegments = viewConfig.uiViewName.split(".");
            var uivSegments = uiView.fqn.split(".");
            if (!angular.equals(vcSegments, uivSegments.slice(0 - vcSegments.length)))
                return false;
            var negOffset = (1 - vcSegments.length) || undefined;
            var fqnToFirstSegment = uivSegments.slice(0, negOffset).join(".");
            var uiViewContext = uiViewsByFqn[fqnToFirstSegment].creationContext;
            return viewConfig.uiViewContextAnchor === (uiViewContext && uiViewContext.name);
        });
        function uiViewDepth(uiView) {
            return uiView.fqn.split(".").length;
        }
        function viewConfigDepth(config) {
            var context = config.context, count = 0;
            while (++count && context.parent)
                context = context.parent;
            return count;
        }
        var depthCompare = common_1.curry(function (depthFn, posNeg, left, right) { return posNeg * (depthFn(left) - depthFn(right)); });
        var matchingConfigPair = function (uiView) {
            var matchingConfigs = viewConfigs.filter(matches(uiView));
            if (matchingConfigs.length > 1)
                matchingConfigs.sort(depthCompare(viewConfigDepth, -1));
            return [uiView, matchingConfigs[0]];
        };
        var configureUiView = function (_a) {
            var uiView = _a[0], viewConfig = _a[1];
            if (uiViews.indexOf(uiView) !== -1)
                uiView.configUpdated(viewConfig);
        };
        uiViews.sort(depthCompare(uiViewDepth, 1)).map(matchingConfigPair).forEach(configureUiView);
    };
    this.registerUiView = function register(uiView) {
        module_1.trace.traceViewServiceUiViewEvent("-> Registering", uiView);
        var fqnMatches = function (uiv) { return uiv.fqn === uiView.fqn; };
        if (uiViews.filter(fqnMatches).length)
            module_1.trace.traceViewServiceUiViewEvent("!!!! duplicate uiView named:", uiView);
        uiViews.push(uiView);
        this.sync();
        return function () {
            var idx = uiViews.indexOf(uiView);
            if (idx <= 0) {
                module_1.trace.traceViewServiceUiViewEvent("Tried removing non-registered uiView", uiView);
                return;
            }
            module_1.trace.traceViewServiceUiViewEvent("<- Deregistering", uiView);
            common_1.removeFrom(uiViews)(uiView);
        };
    };
    this.available = function () { return uiViews.map(common_1.prop("fqn")); };
    this.active = function () { return uiViews.filter(common_1.prop("$config")).map(common_1.prop("name")); };
}
angular.module('ui.router.state').service('$view', $View);
//# sourceMappingURL=view.js.map