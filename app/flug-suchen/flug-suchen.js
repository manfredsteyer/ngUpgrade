System.register([], function(exports_1) {
    var FlugSuchen;
    return {
        setters:[],
        execute: function() {
            FlugSuchen = (function () {
                function FlugSuchen($log, flugService, warenkorbService) {
                    this.$log = $log;
                    this.flugService = flugService;
                    this.warenkorbService = warenkorbService;
                    this.von = "Graz";
                    this.nach = "Hamburg";
                }
                FlugSuchen.prototype.suchen = function () {
                    var _this = this;
                    this
                        .flugService
                        .suchen(this.von, this.nach)
                        .then(function (response) {
                        _this.fluege = response.data;
                    }).catch(function (response) {
                        _this.message = "Fehler beim Laden!";
                    });
                };
                FlugSuchen.prototype.select = function (flug) {
                    this.selectedFlug = flug;
                    this.warenkorbService.flug = flug;
                };
                return FlugSuchen;
            })();
            exports_1("FlugSuchen", FlugSuchen);
        }
    }
});
//# sourceMappingURL=flug-suchen.js.map