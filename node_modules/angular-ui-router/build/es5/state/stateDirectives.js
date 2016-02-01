var common_1 = require("../common/common");
var module_1 = require("../transition/module");
function parseStateRef(ref, current) {
    var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
    if (preparsed)
        ref = current + '(' + preparsed[1] + ')';
    parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
    if (!parsed || parsed.length !== 4)
        throw new Error("Invalid state ref '" + ref + "'");
    return { state: parsed[1], paramExpr: parsed[3] || null };
}
function stateContext(el) {
    var stateData = el.parent().inheritedData('$uiView');
    if (stateData && stateData.context && stateData.context.name) {
        return stateData.context;
    }
}
$StateRefDirective.$inject = ['$state', '$timeout'];
function $StateRefDirective($state, $timeout) {
    return {
        restrict: 'A',
        require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
        link: function (scope, element, attrs, uiSrefActive) {
            var ref = parseStateRef(attrs.uiSref, $state.current.name);
            var params = null, base = stateContext(element) || $state.$current;
            var newHref = null, isAnchor = element.prop("tagName") === "A";
            var isForm = element[0].nodeName === "FORM";
            var attr = isForm ? "action" : "href", nav = true;
            var srefOpts = scope.$eval(attrs.uiSrefOpts);
            var defaultSrefOpts = { relative: base, inherit: true };
            var options = common_1.defaults(srefOpts, defaultSrefOpts, module_1.defaultTransOpts);
            var update = function (newVal) {
                if (newVal)
                    params = common_1.copy(newVal);
                if (!nav)
                    return;
                newHref = $state.href(ref.state, params, options);
                var activeDirective = uiSrefActive[1] || uiSrefActive[0];
                if (activeDirective) {
                    activeDirective.$$addStateInfo(ref.state, params);
                }
                if (newHref === null) {
                    nav = false;
                    return false;
                }
                attrs.$set(attr, newHref);
            };
            if (ref.paramExpr) {
                scope.$watch(ref.paramExpr, function (newVal) { if (newVal !== params)
                    update(newVal); }, true);
                params = common_1.copy(scope.$eval(ref.paramExpr));
            }
            update();
            if (isForm)
                return;
            element.bind("click", function (e) {
                var button = e.which || e.button;
                if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || element.attr('target'))) {
                    var transition = $timeout(function () {
                        $state.go(ref.state, params, options);
                    });
                    e.preventDefault();
                    var ignorePreventDefaultCount = isAnchor && !newHref ? 1 : 0;
                    e.preventDefault = function () {
                        if (ignorePreventDefaultCount-- <= 0)
                            $timeout.cancel(transition);
                    };
                }
            });
        }
    };
}
$StateRefActiveDirective.$inject = ['$state', '$stateParams', '$interpolate'];
function $StateRefActiveDirective($state, $stateParams, $interpolate) {
    return {
        restrict: "A",
        controller: ['$scope', '$element', '$attrs', '$timeout', '$transitions', function ($scope, $element, $attrs, $timeout, $transitions) {
                var states = [], activeClasses = {}, activeEqClass;
                activeEqClass = $interpolate($attrs.uiSrefActiveEq || '', false)($scope);
                var uiSrefActive = $scope.$eval($attrs.uiSrefActive) || $interpolate($attrs.uiSrefActive || '', false)($scope);
                if (common_1.isObject(uiSrefActive)) {
                    common_1.forEach(uiSrefActive, function (stateOrName, activeClass) {
                        if (common_1.isString(stateOrName)) {
                            var ref = parseStateRef(stateOrName, $state.current.name);
                            addState(ref.state, $scope.$eval(ref.paramExpr), activeClass);
                        }
                    });
                }
                this.$$addStateInfo = function (newState, newParams) {
                    if (common_1.isObject(uiSrefActive) && states.length > 0) {
                        return;
                    }
                    addState(newState, newParams, uiSrefActive);
                    update();
                };
                $scope.$on('$stateChangeSuccess', update);
                function addState(stateName, stateParams, activeClass) {
                    var state = $state.get(stateName, stateContext($element));
                    var stateHash = createStateHash(stateName, stateParams);
                    states.push({
                        state: state || { name: stateName },
                        params: stateParams,
                        hash: stateHash
                    });
                    activeClasses[stateHash] = activeClass;
                }
                updateAfterTransition.$inject = ['$transition$'];
                function updateAfterTransition($transition$) { $transition$.promise.then(update); }
                ;
                var deregisterFn = $transitions.onStart({}, updateAfterTransition);
                $scope.$on('$destroy', deregisterFn);
                function createStateHash(state, params) {
                    if (!common_1.isString(state)) {
                        throw new Error('state should be a string');
                    }
                    if (common_1.isObject(params)) {
                        return state + common_1.toJson(params);
                    }
                    params = $scope.$eval(params);
                    if (common_1.isObject(params)) {
                        return state + common_1.toJson(params);
                    }
                    return state;
                }
                function update() {
                    for (var i = 0; i < states.length; i++) {
                        if (anyMatch(states[i].state, states[i].params)) {
                            addClass($element, activeClasses[states[i].hash]);
                        }
                        else {
                            removeClass($element, activeClasses[states[i].hash]);
                        }
                        if (exactMatch(states[i].state, states[i].params)) {
                            addClass($element, activeEqClass);
                        }
                        else {
                            removeClass($element, activeEqClass);
                        }
                    }
                }
                function addClass(el, className) { $timeout(function () { el.addClass(className); }); }
                function removeClass(el, className) { el.removeClass(className); }
                function anyMatch(state, params) { return $state.includes(state.name, params); }
                function exactMatch(state, params) { return $state.is(state.name, params); }
            }]
    };
}
angular.module('ui.router.state')
    .directive('uiSref', $StateRefDirective)
    .directive('uiSrefActive', $StateRefActiveDirective)
    .directive('uiSrefActiveEq', $StateRefActiveDirective);
//# sourceMappingURL=stateDirectives.js.map