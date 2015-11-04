System.register([], function(exports_1) {
    var AsyncOrtValidatorFactory;
    return {
        setters:[],
        execute: function() {
            AsyncOrtValidatorFactory = (function () {
                function AsyncOrtValidatorFactory() {
                }
                AsyncOrtValidatorFactory.create = function ($timeout, $q) {
                    var cities = ['Graz', 'Hamburg', 'Wien'];
                    return {
                        require: 'ngModel',
                        link: function (scope, element, attrs, ngModel) {
                            ngModel.$asyncValidators.asyncOrt = function (value) {
                                return $timeout(function () {
                                    return $q.reject();
                                }, 1000);
                            };
                        }
                    };
                };
                return AsyncOrtValidatorFactory;
            })();
            exports_1("AsyncOrtValidatorFactory", AsyncOrtValidatorFactory);
        }
    }
});
//# sourceMappingURL=async-ort.js.map