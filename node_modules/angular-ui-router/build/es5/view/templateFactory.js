var common_1 = require("../common/common");
$TemplateFactory.$inject = ['$http', '$templateCache'];
function $TemplateFactory($http, $templateCache) {
    this.fromConfig = function (config, params, injectFn) {
        return (common_1.isDefined(config.template) ? this.fromString(config.template, params) :
            common_1.isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) :
                common_1.isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, injectFn) :
                    null);
    };
    this.fromString = function (template, params) {
        return common_1.isFunction(template) ? template(params) : template;
    };
    this.fromUrl = function (url, params) {
        if (common_1.isFunction(url))
            url = url(params);
        if (url == null)
            return null;
        return $http.get(url, { cache: $templateCache, headers: { Accept: 'text/html' } }).then(common_1.prop("data"));
    };
    this.fromProvider = function (provider, params, injectFn) {
        return injectFn(provider);
    };
}
angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);
//# sourceMappingURL=templateFactory.js.map