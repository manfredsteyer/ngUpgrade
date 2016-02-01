var common_1 = require("../common/common");
var trace_1 = require("../common/trace");
$ViewDirective.$inject = ['$view', '$animate', '$uiViewScroll', '$interpolate', '$q'];
function $ViewDirective($view, $animate, $uiViewScroll, $interpolate, $q) {
    function getRenderer(attrs, scope) {
        return {
            enter: function (element, target, cb) {
                if (angular.version.minor > 2) {
                    $animate.enter(element, null, target).then(cb);
                }
                else {
                    $animate.enter(element, null, target, cb);
                }
            },
            leave: function (element, cb) {
                if (angular.version.minor > 2) {
                    $animate.leave(element).then(cb);
                }
                else {
                    $animate.leave(element, cb);
                }
            }
        };
    }
    function configsEqual(config1, config2) {
        return config1 === config2;
    }
    var rootData = {
        context: $view.rootContext()
    };
    var directive = {
        count: 0,
        restrict: 'ECA',
        terminal: true,
        priority: 400,
        transclude: 'element',
        compile: function (tElement, tAttrs, $transclude) {
            return function (scope, $element, attrs) {
                var previousEl, currentEl, currentScope, unregister, onloadExp = attrs.onload || '', autoScrollExp = attrs.autoscroll, renderer = getRenderer(attrs, scope), viewConfig = undefined, inherited = $element.inheritedData('$uiView') || rootData, name = $interpolate(attrs.uiView || attrs.name || '')(scope) || '$default';
                var viewData = {
                    id: directive.count++,
                    name: name,
                    fqn: inherited.name ? inherited.fqn + "." + name : name,
                    config: null,
                    configUpdated: configUpdatedCallback,
                    get creationContext() { return inherited.context; }
                };
                trace_1.trace.traceUiViewEvent("Linking", viewData);
                function configUpdatedCallback(config) {
                    if (configsEqual(viewConfig, config))
                        return;
                    trace_1.trace.traceUiViewConfigUpdated(viewData, config && config.context);
                    viewConfig = config;
                    updateView(config);
                }
                $element.data('$uiView', viewData);
                updateView();
                unregister = $view.registerUiView(viewData);
                scope.$on("$destroy", function () {
                    trace_1.trace.traceUiViewEvent("Destroying/Unregistering", viewData);
                    unregister();
                });
                function cleanupLastView() {
                    if (previousEl) {
                        trace_1.trace.traceUiViewEvent("Removing    (previous) el", viewData);
                        previousEl.remove();
                        previousEl = null;
                    }
                    if (currentScope) {
                        trace_1.trace.traceUiViewEvent("Destroying  (previous) scope", viewData);
                        currentScope.$destroy();
                        currentScope = null;
                    }
                    if (currentEl) {
                        trace_1.trace.traceUiViewEvent("Animate out (previous)", viewData);
                        renderer.leave(currentEl, function () {
                            previousEl = null;
                        });
                        previousEl = currentEl;
                        currentEl = null;
                    }
                }
                function updateView(config) {
                    config = config || {};
                    var newScope = scope.$new();
                    trace_1.trace.traceUiViewScopeCreated(viewData, newScope);
                    common_1.extend(viewData, {
                        context: config.context,
                        $template: config.template,
                        $controller: config.controller,
                        $controllerAs: config.controllerAs,
                        $locals: config.locals
                    });
                    var cloned = $transclude(newScope, function (clone) {
                        renderer.enter(clone.data('$uiView', viewData), $element, function onUiViewEnter() {
                            if (currentScope) {
                                currentScope.$emit('$viewContentAnimationEnded');
                            }
                            if (common_1.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
                                $uiViewScroll(clone);
                            }
                        });
                        cleanupLastView();
                    });
                    currentEl = cloned;
                    currentScope = newScope;
                    currentScope.$emit('$viewContentLoaded', config || viewConfig);
                    currentScope.$eval(onloadExp);
                }
            };
        }
    };
    return directive;
}
$ViewDirectiveFill.$inject = ['$compile', '$controller', '$interpolate', '$injector', '$q'];
function $ViewDirectiveFill($compile, $controller, $interpolate, $injector, $q) {
    return {
        restrict: 'ECA',
        priority: -400,
        compile: function (tElement) {
            var initial = tElement.html();
            return function (scope, $element) {
                var data = $element.data('$uiView');
                if (!data)
                    return;
                $element.html(data.$template || initial);
                trace_1.trace.traceUiViewFill(data, $element.html());
                var link = $compile($element.contents());
                var controller = data.$controller;
                var controllerAs = data.$controllerAs;
                if (controller) {
                    var locals = data.$locals;
                    var controllerInstance = $controller(controller, common_1.extend(locals, { $scope: scope }));
                    if (controllerAs)
                        scope[controllerAs] = controllerInstance;
                    $element.data('$ngControllerController', controllerInstance);
                    $element.children().data('$ngControllerController', controllerInstance);
                }
                link(scope);
            };
        }
    };
}
angular.module('ui.router.state').directive('uiView', $ViewDirective);
angular.module('ui.router.state').directive('uiView', $ViewDirectiveFill);
//# sourceMappingURL=viewDirective.js.map