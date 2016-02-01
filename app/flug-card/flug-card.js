System.register(['angular2/core', 'angular2/common'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, common_1, core_2;
    var FlugCard;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
                core_2 = core_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            }],
        execute: function() {
            // <flug-card [item]="f" 
            //            [selectedItem]="..." 
            //            (selectedItemChange)="...">
            // </flug-card>
            FlugCard = (function () {
                function FlugCard() {
                    this.selectedItemChange = new core_2.EventEmitter();
                }
                FlugCard.prototype.select = function () {
                    this.selectedItemChange.next(this.flug);
                };
                __decorate([
                    core_1.Input('item'), 
                    __metadata('design:type', Object)
                ], FlugCard.prototype, "flug", void 0);
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', Object)
                ], FlugCard.prototype, "selectedItem", void 0);
                __decorate([
                    core_2.Output(), 
                    __metadata('design:type', Object)
                ], FlugCard.prototype, "selectedItemChange", void 0);
                FlugCard = __decorate([
                    core_1.Component({
                        selector: 'flug-card',
                        directives: [common_1.CORE_DIRECTIVES],
                        templateUrl: 'app/flug-card/flug-card.html'
                    }), 
                    __metadata('design:paramtypes', [])
                ], FlugCard);
                return FlugCard;
            })();
            exports_1("FlugCard", FlugCard);
        }
    }
});
//# sourceMappingURL=flug-card.js.map