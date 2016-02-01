let notImplemented = (fnname) => () => {
    throw new Error(`${fnname}(): No coreservices implementation for UI-Router is loaded. You should include one of: ['angular1.js']`);
};
let services = {
    $q: undefined,
    $injector: undefined,
    location: {},
    locationConfig: {}
};
["replace", "url", "path", "search", "hash"]
    .forEach(key => services.location[key] = notImplemented(key));
["port", "protocol", "host", "baseHref", "html5Mode", "hashPrefix"]
    .forEach(key => services.locationConfig[key] = notImplemented(key));
export { services };
//# sourceMappingURL=coreservices.js.map