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
    var Home;
    return {
        setters:[
            function (controller_1_1) {
                controller_1 = controller_1_1;
            }],
        execute: function() {
            Home = (function () {
                function Home() {
                    this.info = "Willkommen bei dieser Demo-Anwendung!";
                }
                Home = __decorate([
                    controller_1.Controller({
                        selector: 'home'
                    })
                ], Home);
                return Home;
            })();
            exports_1("Home", Home);
        }
    }
});
//# sourceMappingURL=home.js.map