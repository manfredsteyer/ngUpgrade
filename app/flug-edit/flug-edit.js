System.register([], function(exports_1) {
    var FlugEdit;
    return {
        setters:[],
        execute: function() {
            FlugEdit = (function () {
                function FlugEdit($stateParams, flugService) {
                    var _this = this;
                    var id = $stateParams.id;
                    this.id = id;
                    this.flugService = flugService;
                    flugService
                        .byId(id)
                        .then(function (result) {
                        _this.flug = result.data;
                        _this.message = "";
                    })
                        .catch(function (result) {
                        _this.message = "Fehler beim Laden von Daten";
                    });
                }
                FlugEdit.prototype.save = function () {
                    var _this = this;
                    this.flugService
                        .save(this.flug)
                        .then(function (result) {
                        _this.message = "Erfolgreich gespeichert!";
                    })
                        .catch(function (result) {
                        _this.message = "Fehler beim Speichern: " + result.data;
                    });
                };
                return FlugEdit;
            })();
            exports_1("FlugEdit", FlugEdit);
        }
    }
});
//# sourceMappingURL=flug-edit.js.map