System.register([], function(exports_1) {
    var PassagierService;
    return {
        setters:[],
        execute: function() {
            // ng1
            PassagierService = (function () {
                function PassagierService($http) {
                    this.$http = $http;
                }
                PassagierService.prototype.find = function (name) {
                    var url = "http://www.angular.at/api/passagier";
                    var urlParams = {
                        name: name
                    };
                    return this.$http.get(url, { params: urlParams });
                };
                return PassagierService;
            })();
            exports_1("PassagierService", PassagierService);
        }
    }
});
//# sourceMappingURL=passagier-service.js.map