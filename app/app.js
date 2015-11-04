System.register(['angular', 'angular-i18n/angular-locale_de-AT', 'angular-ui-router', 'ort-filter', 'flug-service', 'home/home', 'flug-suchen/flug-suchen', 'flug-edit/flug-edit', './components/validation/ort', './components/validation/async-ort', './components/validation/gdate', 'app-module'], function(exports_1) {
    var angular, ort_filter_1, ort_1, async_ort_1, gdate_1, app_module_1;
    return {
        setters:[
            function (angular_1) {
                angular = angular_1;
            },
            function (_1) {},
            function (_2) {},
            function (ort_filter_1_1) {
                ort_filter_1 = ort_filter_1_1;
            },
            function (_3) {},
            function (_4) {},
            function (_5) {},
            function (_6) {},
            function (ort_1_1) {
                ort_1 = ort_1_1;
            },
            function (async_ort_1_1) {
                async_ort_1 = async_ort_1_1;
            },
            function (gdate_1_1) {
                gdate_1 = gdate_1_1;
            },
            function (app_module_1_1) {
                app_module_1 = app_module_1_1;
            }],
        execute: function() {
            app_module_1.app.config(function ($stateProvider, $urlRouterProvider) {
                // Routen definieren
                $urlRouterProvider.otherwise("/home");
                $stateProvider.state('home', {
                    url: '/home',
                    templateUrl: '/app/home/home.html',
                    controller: 'home',
                    controllerAs: 'home'
                }).state('flug-suchen', {
                    url: '/flug-suchen',
                    templateUrl: '/app/flug-suchen/flug-suchen.html',
                    controller: 'flugSuchen',
                    controllerAs: 'flugSuchen'
                }).state('flug-edit', {
                    url: '/flug-edit/:id',
                    templateUrl: '/app/flug-edit/flug-edit.html',
                    controller: 'flugEdit',
                    controllerAs: 'flugEdit'
                });
            });
            app_module_1.app.directive('ort', ort_1.OrtValidatorFactory.create);
            app_module_1.app.directive('asyncOrt', async_ort_1.AsyncOrtValidatorFactory.create);
            app_module_1.app.directive('gdate', gdate_1.GDateValidatorFactory.create);
            // app.controller('home', Home);
            // app.controller('flugSuchen', FlugSuchen);
            // app.controller('flugEdit', FlugEdit);
            // app.service('flugService', FlugService);
            app_module_1.app.filter('ort', ort_filter_1.OrtFilter.createFilter);
            app_module_1.app.constant('baseUrl', 'http://www.angular.at');
            // <body ng-app='app'> ... </body>
            angular.element(document).ready(function () {
                angular.bootstrap(document, ['app']);
            });
        }
    }
});
//# sourceMappingURL=app.js.map