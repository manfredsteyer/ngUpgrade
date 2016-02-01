///<reference path="../typings/angularjs/angular.d.ts" />
System.register(['./services/flug-service', './ort-filter', './flug-service', './home/home', './flug-suchen/flug-suchen', './flug-edit/flug-edit', './components/validation/ort', './components/validation/async-ort', './components/validation/gdate', './app-module', './passagier-suchen/passagier-suchen', './flug-card/flug-card', './passagier-card/passagier-card', './services/passagier-service', './services/warenkorb-service', './warenkorb/warenkorb', 'angular2/http', './upgrade-adapter'], function(exports_1) {
    var flug_service_1, ort_filter_1, home_1, flug_suchen_1, flug_edit_1, ort_1, async_ort_1, gdate_1, app_module_1, passagier_suchen_1, flug_card_1, passagier_card_1, passagier_service_1, warenkorb_service_1, warenkorb_1, http_1, upgrade_adapter_1;
    return {
        setters:[
            function (flug_service_1_1) {
                flug_service_1 = flug_service_1_1;
            },
            function (ort_filter_1_1) {
                ort_filter_1 = ort_filter_1_1;
            },
            function (_1) {},
            function (home_1_1) {
                home_1 = home_1_1;
            },
            function (flug_suchen_1_1) {
                flug_suchen_1 = flug_suchen_1_1;
            },
            function (flug_edit_1_1) {
                flug_edit_1 = flug_edit_1_1;
            },
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
            },
            function (passagier_suchen_1_1) {
                passagier_suchen_1 = passagier_suchen_1_1;
            },
            function (flug_card_1_1) {
                flug_card_1 = flug_card_1_1;
            },
            function (passagier_card_1_1) {
                passagier_card_1 = passagier_card_1_1;
            },
            function (passagier_service_1_1) {
                passagier_service_1 = passagier_service_1_1;
            },
            function (warenkorb_service_1_1) {
                warenkorb_service_1 = warenkorb_service_1_1;
            },
            function (warenkorb_1_1) {
                warenkorb_1 = warenkorb_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (upgrade_adapter_1_1) {
                upgrade_adapter_1 = upgrade_adapter_1_1;
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
                }).state('passagier-suchen', {
                    url: '/passagier-suchen',
                    template: '<passagier-suchen></passagier-suchen>'
                });
            });
            app_module_1.app.directive('ort', ort_1.OrtValidatorFactory.create);
            app_module_1.app.directive('asyncOrt', async_ort_1.AsyncOrtValidatorFactory.create);
            app_module_1.app.directive('gdate', gdate_1.GDateValidatorFactory.create);
            app_module_1.app.directive('passagierCard', passagier_card_1.PassagierCardFactory.create);
            app_module_1.app.controller('home', home_1.Home);
            app_module_1.app.controller('flugSuchen', flug_suchen_1.FlugSuchen);
            app_module_1.app.controller('flugEdit', flug_edit_1.FlugEdit);
            app_module_1.app.filter('ort', ort_filter_1.OrtFilter.createFilter);
            app_module_1.app.constant('baseUrl', 'http://www.angular.at');
            //
            // Ab hier erfolgt das Registrieren von ng2-Konstrukten
            // und somit auch der Downgrade von ng2 auf ng1
            // Damit der PassagierService in Angular2-Konstrukten
            // genutzt werden kann, bekommt er ein Upgrade.
            // Ein weiteres Upgrade findet man direkt in der Komponente 
            // PassagierSuchen: Hier erhält passagierCard für den
            // Einsatz in der Angular2-Komponente PassagierSuchen
            // ein Upgrade.
            //
            app_module_1.app.directive('passagierSuchen', upgrade_adapter_1.upgradeAdapter.downgradeNg2Component(passagier_suchen_1.PassagierSuchen));
            app_module_1.app.directive('flugCard', upgrade_adapter_1.upgradeAdapter.downgradeNg2Component(flug_card_1.FlugCard));
            app_module_1.app.directive('warenkorb', upgrade_adapter_1.upgradeAdapter.downgradeNg2Component(warenkorb_1.Warenkorb));
            app_module_1.app.service('passagierService', passagier_service_1.PassagierService);
            upgrade_adapter_1.upgradeAdapter.upgradeNg1Provider('passagierService');
            upgrade_adapter_1.upgradeAdapter.addProvider(flug_service_1.FlugService);
            upgrade_adapter_1.upgradeAdapter.addProvider(http_1.HTTP_PROVIDERS);
            app_module_1.app.factory('flugService', upgrade_adapter_1.upgradeAdapter.downgradeNg2Provider(flug_service_1.FlugService));
            upgrade_adapter_1.upgradeAdapter.addProvider(warenkorb_service_1.WarenkorbService);
            app_module_1.app.factory('warenkorbService', upgrade_adapter_1.upgradeAdapter.downgradeNg2Provider(warenkorb_service_1.WarenkorbService));
            //
            // Bootstrapping über den upgradeAdapter
            // und nicht wie zuvor über Angular-Anwendung
            //
            // angular.bootstrap(document, ['app']);
            upgrade_adapter_1.upgradeAdapter.bootstrap(document.body, ['app']);
        }
    }
});
//# sourceMappingURL=app.js.map