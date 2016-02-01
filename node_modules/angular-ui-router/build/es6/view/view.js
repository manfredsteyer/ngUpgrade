"use strict";
import { isInjectable, isString, extend, curry, applyPairs, prop, pick, removeFrom } from "../common/common";
import { trace } from "../common/module";
function normalizeUiViewTarget(rawViewName = "") {
    let viewAtContext = rawViewName.split("@");
    let uiViewName = viewAtContext[0] || "$default";
    let uiViewContextAnchor = isString(viewAtContext[1]) ? viewAtContext[1] : "^";
    let relativeViewNameSugar = /^(\^(?:\.\^)*)\.(.*$)/.exec(uiViewName);
    if (relativeViewNameSugar) {
        uiViewContextAnchor = relativeViewNameSugar[1];
        uiViewName = relativeViewNameSugar[2];
    }
    if (uiViewName.charAt(0) === '!') {
        uiViewName = uiViewName.substr(1);
        uiViewContextAnchor = "";
    }
    return { uiViewName, uiViewContextAnchor };
}
export class ViewConfig {
    constructor(stateViewConfig) {
        let { uiViewName, uiViewContextAnchor } = normalizeUiViewTarget(stateViewConfig.rawViewName);
        let relativeMatch = /^(\^(?:\.\^)*)$/;
        if (relativeMatch.exec(uiViewContextAnchor)) {
            let anchor = uiViewContextAnchor.split(".").reduce(((anchor, x) => anchor.parent), stateViewConfig.context);
            uiViewContextAnchor = anchor.name;
        }
        extend(this, pick(stateViewConfig, "viewDeclarationObj", "params", "context", "locals"), { uiViewName, uiViewContextAnchor });
        this.controllerAs = stateViewConfig.viewDeclarationObj.controllerAs;
    }
    hasTemplate() {
        let viewDef = this.viewDeclarationObj;
        return !!(viewDef.template || viewDef.templateUrl || viewDef.templateProvider);
    }
    getTemplate($factory, injector) {
        return $factory.fromConfig(this.viewDeclarationObj, this.params, injector.invokeLater.bind(injector));
    }
    getController(injector) {
        let provider = this.viewDeclarationObj.controllerProvider;
        return isInjectable(provider) ? injector.invokeLater(provider, {}) : this.viewDeclarationObj.controller;
    }
}
$View.$inject = ['$rootScope', '$templateFactory', '$q', '$timeout'];
function $View($rootScope, $templateFactory, $q, $timeout) {
    let uiViews = [];
    let viewConfigs = [];
    const match = (obj1, ...keys) => (obj2) => keys.reduce(((memo, key) => memo && obj1[key] === obj2[key]), true);
    this.rootContext = function (context) {
        return context ? this._rootContext = context : this._rootContext;
    };
    this.load = function load(viewConfig, injector) {
        if (!viewConfig.hasTemplate())
            throw new Error(`No template configuration specified for '${viewConfig.uiViewName}@${viewConfig.uiViewContextAnchor}'`);
        let promises = {
            template: $q.when(viewConfig.getTemplate($templateFactory, injector)),
            controller: $q.when(viewConfig.getController(injector))
        };
        return $q.all(promises).then((results) => {
            trace.traceViewServiceEvent("Loaded", viewConfig);
            return extend(viewConfig, results);
        });
    };
    this.reset = function reset(viewConfig) {
        trace.traceViewServiceEvent("<- Removing", viewConfig);
        viewConfigs.filter(match(viewConfig, "uiViewName", "context")).forEach(removeFrom(viewConfigs));
    };
    this.registerStateViewConfig = function (viewConfig) {
        trace.traceViewServiceEvent("-> Registering", viewConfig);
        viewConfigs.push(viewConfig);
    };
    this.sync = () => {
        let uiViewsByFqn = uiViews.map(uiv => [uiv.fqn, uiv]).reduce(applyPairs, {});
        const matches = curry(function (uiView, viewConfig) {
            let vcSegments = viewConfig.uiViewName.split(".");
            let uivSegments = uiView.fqn.split(".");
            if (!angular.equals(vcSegments, uivSegments.slice(0 - vcSegments.length)))
                return false;
            let negOffset = (1 - vcSegments.length) || undefined;
            let fqnToFirstSegment = uivSegments.slice(0, negOffset).join(".");
            let uiViewContext = uiViewsByFqn[fqnToFirstSegment].creationContext;
            return viewConfig.uiViewContextAnchor === (uiViewContext && uiViewContext.name);
        });
        function uiViewDepth(uiView) {
            return uiView.fqn.split(".").length;
        }
        function viewConfigDepth(config) {
            let context = config.context, count = 0;
            while (++count && context.parent)
                context = context.parent;
            return count;
        }
        const depthCompare = curry((depthFn, posNeg, left, right) => posNeg * (depthFn(left) - depthFn(right)));
        const matchingConfigPair = uiView => {
            let matchingConfigs = viewConfigs.filter(matches(uiView));
            if (matchingConfigs.length > 1)
                matchingConfigs.sort(depthCompare(viewConfigDepth, -1));
            return [uiView, matchingConfigs[0]];
        };
        const configureUiView = ([uiView, viewConfig]) => {
            if (uiViews.indexOf(uiView) !== -1)
                uiView.configUpdated(viewConfig);
        };
        uiViews.sort(depthCompare(uiViewDepth, 1)).map(matchingConfigPair).forEach(configureUiView);
    };
    this.registerUiView = function register(uiView) {
        trace.traceViewServiceUiViewEvent("-> Registering", uiView);
        const fqnMatches = uiv => uiv.fqn === uiView.fqn;
        if (uiViews.filter(fqnMatches).length)
            trace.traceViewServiceUiViewEvent("!!!! duplicate uiView named:", uiView);
        uiViews.push(uiView);
        this.sync();
        return () => {
            let idx = uiViews.indexOf(uiView);
            if (idx <= 0) {
                trace.traceViewServiceUiViewEvent("Tried removing non-registered uiView", uiView);
                return;
            }
            trace.traceViewServiceUiViewEvent("<- Deregistering", uiView);
            removeFrom(uiViews)(uiView);
        };
    };
    this.available = () => uiViews.map(prop("fqn"));
    this.active = () => uiViews.filter(prop("$config")).map(prop("name"));
}
angular.module('ui.router.state').service('$view', $View);
//# sourceMappingURL=view.js.map