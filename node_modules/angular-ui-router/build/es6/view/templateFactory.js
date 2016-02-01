import { isDefined, isFunction, prop } from "../common/common";
$TemplateFactory.$inject = ['$http', '$templateCache'];
function $TemplateFactory($http, $templateCache) {
    this.fromConfig = function (config, params, injectFn) {
        return (isDefined(config.template) ? this.fromString(config.template, params) :
            isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) :
                isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, injectFn) :
                    null);
    };
    this.fromString = function (template, params) {
        return isFunction(template) ? template(params) : template;
    };
    this.fromUrl = function (url, params) {
        if (isFunction(url))
            url = url(params);
        if (url == null)
            return null;
        return $http.get(url, { cache: $templateCache, headers: { Accept: 'text/html' } }).then(prop("data"));
    };
    this.fromProvider = function (provider, params, injectFn) {
        return injectFn(provider);
    };
}
angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);
//# sourceMappingURL=templateFactory.js.map