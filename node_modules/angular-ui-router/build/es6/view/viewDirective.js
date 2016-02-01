import { extend, isDefined } from "../common/common";
import { trace } from "../common/trace";
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
    let rootData = {
        context: $view.rootContext()
    };
    let directive = {
        count: 0,
        restrict: 'ECA',
        terminal: true,
        priority: 400,
        transclude: 'element',
        compile: function (tElement, tAttrs, $transclude) {
            return function (scope, $element, attrs) {
                let previousEl, currentEl, currentScope, unregister, onloadExp = attrs.onload || '', autoScrollExp = attrs.autoscroll, renderer = getRenderer(attrs, scope), viewConfig = undefined, inherited = $element.inheritedData('$uiView') || rootData, name = $interpolate(attrs.uiView || attrs.name || '')(scope) || '$default';
                let viewData = {
                    id: directive.count++,
                    name: name,
                    fqn: inherited.name ? inherited.fqn + "." + name : name,
                    config: null,
                    configUpdated: configUpdatedCallback,
                    get creationContext() { return inherited.context; }
                };
                trace.traceUiViewEvent("Linking", viewData);
                function configUpdatedCallback(config) {
                    if (configsEqual(viewConfig, config))
                        return;
                    trace.traceUiViewConfigUpdated(viewData, config && config.context);
                    viewConfig = config;
                    updateView(config);
                }
                $element.data('$uiView', viewData);
                updateView();
                unregister = $view.registerUiView(viewData);
                scope.$on("$destroy", function () {
                    trace.traceUiViewEvent("Destroying/Unregistering", viewData);
                    unregister();
                });
                function cleanupLastView() {
                    if (previousEl) {
                        trace.traceUiViewEvent("Removing    (previous) el", viewData);
                        previousEl.remove();
                        previousEl = null;
                    }
                    if (currentScope) {
                        trace.traceUiViewEvent("Destroying  (previous) scope", viewData);
                        currentScope.$destroy();
                        currentScope = null;
                    }
                    if (currentEl) {
                        trace.traceUiViewEvent("Animate out (previous)", viewData);
                        renderer.leave(currentEl, function () {
                            previousEl = null;
                        });
                        previousEl = currentEl;
                        currentEl = null;
                    }
                }
                function updateView(config) {
                    config = config || {};
                    let newScope = scope.$new();
                    trace.traceUiViewScopeCreated(viewData, newScope);
                    extend(viewData, {
                        context: config.context,
                        $template: config.template,
                        $controller: config.controller,
                        $controllerAs: config.controllerAs,
                        $locals: config.locals
                    });
                    let cloned = $transclude(newScope, function (clone) {
                        renderer.enter(clone.data('$uiView', viewData), $element, function onUiViewEnter() {
                            if (currentScope) {
                                currentScope.$emit('$viewContentAnimationEnded');
                            }
                            if (isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
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
            let initial = tElement.html();
            return function (scope, $element) {
                let data = $element.data('$uiView');
                if (!data)
                    return;
                $element.html(data.$template || initial);
                trace.traceUiViewFill(data, $element.html());
                let link = $compile($element.contents());
                let controller = data.$controller;
                let controllerAs = data.$controllerAs;
                if (controller) {
                    let locals = data.$locals;
                    let controllerInstance = $controller(controller, extend(locals, { $scope: scope }));
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