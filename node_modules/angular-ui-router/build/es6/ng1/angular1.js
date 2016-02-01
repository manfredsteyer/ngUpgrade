import { Router } from "../router";
import { services } from "../common/coreservices";
import { isObject } from "../common/common";
let app = angular.module("ui.router.angular1", []);
export function annotateController(controllerExpression) {
    let $injector = services.$injector;
    let $controller = $injector.get("$controller");
    let oldInstantiate = $injector.instantiate;
    try {
        let deps;
        $injector.instantiate = function fakeInstantiate(constructorFunction) {
            $injector.instantiate = oldInstantiate;
            deps = $injector.annotate(constructorFunction);
        };
        $controller(controllerExpression, { $scope: {} });
        return deps;
    }
    finally {
        $injector.instantiate = oldInstantiate;
    }
}
runBlock.$inject = ['$injector', '$q'];
function runBlock($injector, $q) {
    services.$injector = $injector;
    services.$q = $q;
}
app.run(runBlock);
const bindFunctions = (fnNames, from, to) => fnNames.forEach(name => to[name] = from[name].bind(from));
let router = null;
ng1UIRouter.$inject = ['$locationProvider'];
function ng1UIRouter($locationProvider) {
    router = new Router();
    bindFunctions(['hashPrefix'], $locationProvider, services.locationConfig);
    this.$get = $get;
    $get.$inject = ['$location', '$browser', '$sniffer'];
    function $get($location, $browser, $sniffer) {
        services.locationConfig.html5Mode = function () {
            var html5Mode = $locationProvider.html5Mode();
            html5Mode = isObject(html5Mode) ? html5Mode.enabled : html5Mode;
            return html5Mode && $sniffer.history;
        };
        bindFunctions(["replace", "url", "path", "search", "hash"], $location, services.location);
        bindFunctions(['port', 'protocol', 'host'], $location, services.locationConfig);
        bindFunctions(['baseHref'], $browser, services.locationConfig);
        return router;
    }
}
angular.module('ui.router.init', []).provider("ng1UIRouter", ng1UIRouter);
angular.module('ui.router.util').provider('$urlMatcherFactory', ['ng1UIRouterProvider', () => router.urlMatcherFactory]);
angular.module('ui.router.router').provider('$urlRouter', ['ng1UIRouterProvider', () => router.urlRouterProvider]);
angular.module('ui.router.state').provider('$state', ['ng1UIRouterProvider', () => router.stateProvider]);
angular.module('ui.router.init').run(['ng1UIRouter', function (ng1UIRouter) { }]);
angular.module('ui.router.state').run(['$state', function ($state) { }]);
angular.module('ui.router.util').run(['$urlMatcherFactory', function ($urlMatcherFactory) { }]);
//# sourceMappingURL=angular1.js.map