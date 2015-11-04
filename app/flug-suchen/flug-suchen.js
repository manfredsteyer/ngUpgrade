System.register(['../decorators/controller'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
            case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
            case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
            case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
        }
    };
    var controller_1;
    var FlugSuchen;
    return {
        setters:[
            function (controller_1_1) {
                controller_1 = controller_1_1;
            }],
        execute: function() {
            FlugSuchen = (function () {
                function FlugSuchen($log, flugService) {
                    this.$log = $log;
                    this.flugService = flugService;
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
                FlugSuchen = __decorate([
                    controller_1.Controller({
                        selector: 'flugSuchen'
                    })
                ], FlugSuchen);
                return FlugSuchen;
            })();
            exports_1("FlugSuchen", FlugSuchen);
        }
    }
});
//# sourceMappingURL=flug-suchen.js.map