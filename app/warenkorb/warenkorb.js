System.register(['angular2/core', '../services/warenkorb-service'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, warenkorb_service_1;
    var Warenkorb;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (warenkorb_service_1_1) {
                warenkorb_service_1 = warenkorb_service_1_1;
            }],
        execute: function() {
            Warenkorb = (function () {
                function Warenkorb(warenkorbService) {
                    this.warenkorbService = warenkorbService;
                }
                Object.defineProperty(Warenkorb.prototype, "flug", {
                    get: function () {
                        return this.warenkorbService.flug;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Warenkorb.prototype, "passagier", {
                    get: function () {
                        return this.warenkorbService.passagier;
                    },
                    enumerable: true,
                    configurable: true
                });
                Warenkorb = __decorate([
                    core_1.Component({
                        selector: 'warenkorb',
                        templateUrl: 'app/warenkorb/warenkorb.html'
                    }), 
                    __metadata('design:paramtypes', [warenkorb_service_1.WarenkorbService])
                ], Warenkorb);
                return Warenkorb;
            })();
            exports_1("Warenkorb", Warenkorb);
        }
    }
});
//# sourceMappingURL=warenkorb.js.map