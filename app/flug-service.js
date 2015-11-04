System.register(['decorators/injectable'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
            case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
            case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
            case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
        }
    };
    var injectable_1;
    var FlugService;
    return {
        setters:[
            function (injectable_1_1) {
                injectable_1 = injectable_1_1;
            }],
        execute: function() {
            FlugService = (function () {
                function FlugService($http, baseUrl) {
                    this.$http = $http;
                    this.baseUrl = baseUrl;
                }
                FlugService.prototype.byId = function (id) {
                    var urlParams = {
                        flugNummer: id
                    };
                    var url = this.baseUrl + '/api/flug';
                    return this
                        .$http
                        .get(url, { params: urlParams });
                };
                FlugService.prototype.save = function (flug) {
                    var url = this.baseUrl + '/api/flug';
                    return this.$http.post(url, flug);
                };
                FlugService.prototype.suchen = function (von, nach) {
                    var urlParams = {
                        abflugOrt: von,
                        zielOrt: nach
                    };
                    var url = this.baseUrl + '/api/flug';
                    return this
                        .$http
                        .get(url, { params: urlParams });
                };
                FlugService = __decorate([
                    injectable_1.Injectable({})
                ], FlugService);
                return FlugService;
            })();
            exports_1("FlugService", FlugService);
        }
    }
});
//# sourceMappingURL=flug-service.js.map