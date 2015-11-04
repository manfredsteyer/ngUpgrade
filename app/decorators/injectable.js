System.register(['../app-module'], function(exports_1) {
    var app_module_1;
    function Injectable(options) {
        return function (target) {
            var name = toCamelCase(target.name);
            app_module_1.app.service(name, target);
        };
    }
    exports_1("Injectable", Injectable);
    function toCamelCase(name) {
        if (name.length >= 2) {
            name = name.substr(0, 1).toLowerCase() + name.substr(1);
        }
        return name;
    }
    return {
        setters:[
            function (app_module_1_1) {
                app_module_1 = app_module_1_1;
            }],
        execute: function() {
        }
    }
});
//# sourceMappingURL=injectable.js.map