import { UrlMatcherFactory } from "./url/urlMatcherFactory";
import { $UrlRouterProvider } from "./url/urlRouter";
import { $StateProvider } from "./state/state";
class Router {
    constructor() {
        this.urlMatcherFactory = new UrlMatcherFactory();
        this.urlRouterProvider = new $UrlRouterProvider(this.urlMatcherFactory);
        this.stateProvider = new $StateProvider(this.urlRouterProvider, this.urlMatcherFactory);
    }
}
export { Router };
//# sourceMappingURL=router.js.map