System.register(['angular2/upgrade'], function(exports_1) {
    var upgrade_1;
    var upgradeAdapter;
    return {
        setters:[
            function (upgrade_1_1) {
                upgrade_1 = upgrade_1_1;
            }],
        execute: function() {
            exports_1("upgradeAdapter", upgradeAdapter = new upgrade_1.UpgradeAdapter());
        }
    }
});
//# sourceMappingURL=upgrade-adapter.js.map