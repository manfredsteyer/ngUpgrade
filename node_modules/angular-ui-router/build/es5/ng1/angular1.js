var router_1 = require("../router");
var coreservices_1 = require("../common/coreservices");
var common_1 = require("../common/common");
var app = angular.module("ui.router.angular1", []);
function annotateController(controllerExpression) {
    var $injector = coreservices_1.services.$injector;
    var $controller = $injector.get("$controller");
    var oldInstantiate = $injector.instantiate;
    try {
        var deps;
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
exports.annotateController = annotateController;
runBlock.$inject = ['$injector', '$q'];
function runBlock($injector, $q) {
    coreservices_1.services.$injector = $injector;
    coreservices_1.services.$q = $q;
}
app.run(runBlock);
var bindFunctions = function (fnNames, from, to) {
    return fnNames.forEach(function (name) { return to[name] = from[name].bind(from); });
};
var router = null;
ng1UIRouter.$inject = ['$locationProvider'];
function ng1UIRouter($locationProvider) {
    router = new router_1.Router();
    bindFunctions(['hashPrefix'], $locationProvider, coreservices_1.services.locationConfig);
    this.$get = $get;
    $get.$inject = ['$location', '$browser', '$sniffer'];
    function $get($location, $browser, $sniffer) {
        coreservices_1.services.locationConfig.html5Mode = function () {
            var html5Mode = $locationProvider.html5Mode();
            html5Mode = common_1.isObject(html5Mode) ? html5Mode.enabled : html5Mode;
            return html5Mode && $sniffer.history;
        };
        bindFunctions(["replace", "url", "path", "search", "hash"], $location, coreservices_1.services.location);
        bindFunctions(['port', 'protocol', 'host'], $location, coreservices_1.services.locationConfig);
        bindFunctions(['baseHref'], $browser, coreservices_1.services.locationConfig);
        return router;
    }
}
angular.module('ui.router.init', []).provider("ng1UIRouter", ng1UIRouter);
angular.module('ui.router.util').provider('$urlMatcherFactory', ['ng1UIRouterProvider', function () { return router.urlMatcherFactory; }]);
angular.module('ui.router.router').provider('$urlRouter', ['ng1UIRouterProvider', function () { return router.urlRouterProvider; }]);
angular.module('ui.router.state').provider('$state', ['ng1UIRouterProvider', function () { return router.stateProvider; }]);
angular.module('ui.router.init').run(['ng1UIRouter', function (ng1UIRouter) { }]);
angular.module('ui.router.state').run(['$state', function ($state) { }]);
angular.module('ui.router.util').run(['$urlMatcherFactory', function ($urlMatcherFactory) { }]);
//# sourceMappingURL=angular1.js.map