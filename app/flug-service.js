System.register([], function(exports_1) {
    var FlugService;
    return {
        setters:[],
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
                return FlugService;
            })();
            exports_1("FlugService", FlugService);
        }
    }
});
//# sourceMappingURL=flug-service.js.map