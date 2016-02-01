System.register(['angular2/core', '../upgrade-adapter', '../services/passagier-service', '../services/warenkorb-service'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var core_1, upgrade_adapter_1, passagier_service_1, warenkorb_service_1;
    var PassagierSuchen;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (upgrade_adapter_1_1) {
                upgrade_adapter_1 = upgrade_adapter_1_1;
            },
            function (passagier_service_1_1) {
                passagier_service_1 = passagier_service_1_1;
            },
            function (warenkorb_service_1_1) {
                warenkorb_service_1 = warenkorb_service_1_1;
            }],
        execute: function() {
            PassagierSuchen = (function () {
                function PassagierSuchen(passagierService, warenkorbService) {
                    this.passagierService = passagierService;
                    this.warenkorbService = warenkorbService;
                    this.name = "Muster";
                    this.passagiere = [];
                    this.info = "PassagierSuchen";
                }
                PassagierSuchen.prototype.search = function () {
                    var _this = this;
                    this.passagierService
                        .find(this.name)
                        .then(function (passagiere) {
                        _this.passagiere = passagiere.data;
                    });
                };
                PassagierSuchen.prototype.select = function (passagier) {
                    this.selectedPassagier = passagier;
                    this.warenkorbService.passagier = passagier;
                };
                PassagierSuchen = __decorate([
                    core_1.Component({
                        selector: 'passagier-suchen',
                        templateUrl: 'app/passagier-suchen/passagier-suchen.html',
                        directives: [upgrade_adapter_1.upgradeAdapter.upgradeNg1Component('passagierCard')]
                    }),
                    __param(0, core_1.Inject('passagierService')), 
                    __metadata('design:paramtypes', [passagier_service_1.PassagierService, warenkorb_service_1.WarenkorbService])
                ], PassagierSuchen);
                return PassagierSuchen;
            })();
            exports_1("PassagierSuchen", PassagierSuchen);
        }
    }
});
//# sourceMappingURL=passagier-suchen.js.map