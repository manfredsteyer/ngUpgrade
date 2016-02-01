System.register([], function(exports_1) {
    var PassagierCardFactory;
    return {
        setters:[],
        execute: function() {
            PassagierCardFactory = (function () {
                function PassagierCardFactory() {
                }
                PassagierCardFactory.create = function () {
                    return {
                        templateUrl: 'app/passagier-card/passagier-card.html',
                        controllerAs: 'vm',
                        scope: {
                            item: '=',
                            selectedItem: '='
                        },
                        bindToController: true,
                        controller: function () {
                            var _this = this;
                            this.select = function () {
                                _this.selectedItem = _this.item;
                            };
                        }
                    };
                };
                return PassagierCardFactory;
            })();
            exports_1("PassagierCardFactory", PassagierCardFactory);
        }
    }
});
//# sourceMappingURL=passagier-card.js.map