System.register(['../app-module'], function(exports_1) {
    var app_module_1;
    function Controller(options) {
        return function (target) {
            if (!options)
                options = {};
            if (!options.selector)
                options.selector = target.name;
            app_module_1.app.controller(options.selector, target);
        };
    }
    exports_1("Controller", Controller);
    return {
        setters:[
            function (app_module_1_1) {
                app_module_1 = app_module_1_1;
            }],
        execute: function() {
        }
    }
});
//# sourceMappingURL=controller.js.map