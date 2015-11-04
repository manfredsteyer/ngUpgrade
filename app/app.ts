///<reference path="../typings/angularjs/angular.d.ts" />
import { FlugService } from 'flug-service';
import * as angular from 'angular';
import 'angular-i18n/angular-locale_de-AT';
import 'angular-ui-router';
import { OrtFilter } from 'ort-filter';
import 'flug-service';
import 'home/home';
import 'flug-suchen/flug-suchen';
import 'flug-edit/flug-edit';
import { OrtValidatorFactory } from './components/validation/ort';
import { AsyncOrtValidatorFactory } from './components/validation/async-ort';
import { GDateValidatorFactory } from './components/validation/gdate';
import { app } from 'app-module';


app.config(function ($stateProvider, $urlRouterProvider) {

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


app.directive('ort', OrtValidatorFactory.create);
app.directive('asyncOrt', AsyncOrtValidatorFactory.create);
app.directive('gdate', GDateValidatorFactory.create);

// app.controller('home', Home);
// app.controller('flugSuchen', FlugSuchen);
// app.controller('flugEdit', FlugEdit);

// app.service('flugService', FlugService);
app.filter('ort', OrtFilter.createFilter)

app.constant('baseUrl', 'http://www.angular.at');

// <body ng-app='app'> ... </body>
angular.element(document).ready(() => { 
	angular.bootstrap(document, ['app']);
});