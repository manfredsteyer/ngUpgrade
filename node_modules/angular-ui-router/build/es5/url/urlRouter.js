var common_1 = require("../common/common");
var coreservices_1 = require("../common/coreservices");
var $location = coreservices_1.services.location;
function $UrlRouterProvider($urlMatcherFactory) {
    var rules = [], otherwise = null, interceptDeferred = false, listener;
    function regExpPrefix(re) {
        var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
        return (prefix != null) ? prefix[1].replace(/\\(.)/g, "$1") : '';
    }
    function interpolate(pattern, match) {
        return pattern.replace(/\$(\$|\d{1,2})/, function (m, what) {
            return match[what === '$' ? 0 : Number(what)];
        });
    }
    this.rule = function (rule) {
        if (!common_1.isFunction(rule))
            throw new Error("'rule' must be a function");
        rules.push(rule);
        return this;
    };
    this.otherwise = function (rule) {
        if (!common_1.isFunction(rule) && !common_1.isString(rule))
            throw new Error("'rule' must be a string or function");
        otherwise = common_1.isString(rule) ? function () { return rule; } : rule;
        return this;
    };
    function handleIfMatch($injector, handler, match) {
        if (!match)
            return false;
        var result = $injector.invoke(handler, handler, { $match: match });
        return common_1.isDefined(result) ? result : true;
    }
    this.when = function (what, handler) {
        var redirect, handlerIsString = common_1.isString(handler);
        if (common_1.isString(what))
            what = $urlMatcherFactory.compile(what);
        if (!handlerIsString && !common_1.isFunction(handler) && !common_1.isArray(handler))
            throw new Error("invalid 'handler' in when()");
        var strategies = {
            matcher: function (what, handler) {
                if (handlerIsString) {
                    redirect = $urlMatcherFactory.compile(handler);
                    handler = ['$match', redirect.format.bind(redirect)];
                }
                return common_1.extend(function () {
                    return handleIfMatch(coreservices_1.services.$injector, handler, what.exec($location.path(), $location.search(), $location.hash()));
                }, {
                    prefix: common_1.isString(what.prefix) ? what.prefix : ''
                });
            },
            regex: function (what, handler) {
                if (what.global || what.sticky)
                    throw new Error("when() RegExp must not be global or sticky");
                if (handlerIsString) {
                    redirect = handler;
                    handler = ['$match', function ($match) { return interpolate(redirect, $match); }];
                }
                return common_1.extend(function () {
                    return handleIfMatch(coreservices_1.services.$injector, handler, what.exec($location.path()));
                }, {
                    prefix: regExpPrefix(what)
                });
            }
        };
        var check = {
            matcher: $urlMatcherFactory.isMatcher(what),
            regex: what instanceof RegExp
        };
        for (var n in check) {
            if (check[n])
                return this.rule(strategies[n](what, handler));
        }
        throw new Error("invalid 'what' in when()");
    };
    this.deferIntercept = function (defer) {
        if (defer === undefined)
            defer = true;
        interceptDeferred = defer;
    };
    this.$get = $get;
    $get.$inject = ['$rootScope'];
    function $get($rootScope) {
        var location = $location.url();
        function appendBasePath(url, isHtml5, absolute) {
            var baseHref = coreservices_1.services.locationConfig.baseHref();
            if (baseHref === '/')
                return url;
            if (isHtml5)
                return baseHref.slice(0, -1) + url;
            if (absolute)
                return baseHref.slice(1) + url;
            return url;
        }
        function update(evt) {
            if (evt && evt.defaultPrevented)
                return;
            function check(rule) {
                var handled = rule(coreservices_1.services.$injector, $location);
                if (!handled)
                    return false;
                if (common_1.isString(handled)) {
                    $location.replace();
                    $location.url(handled);
                }
                return true;
            }
            var n = rules.length, i;
            for (i = 0; i < n; i++) {
                if (check(rules[i]))
                    return;
            }
            if (otherwise)
                check(otherwise);
        }
        function listen() {
            listener = listener || $rootScope.$on('$locationChangeSuccess', update);
            return listener;
        }
        if (!interceptDeferred)
            listen();
        return {
            sync: function () {
                update();
            },
            listen: function () {
                return listen();
            },
            update: function (read) {
                if (read) {
                    location = $location.url();
                    return;
                }
                if ($location.url() === location)
                    return;
                $location.url(location);
                $location.replace();
            },
            push: function (urlMatcher, params, options) {
                $location.url(urlMatcher.format(params || {}));
                if (options && options.replace)
                    $location.replace();
            },
            href: function (urlMatcher, params, options) {
                if (!urlMatcher.validates(params))
                    return null;
                var url = urlMatcher.format(params);
                options = options || {};
                var cfg = coreservices_1.services.locationConfig;
                var isHtml5 = cfg.html5Mode();
                if (!isHtml5 && url !== null) {
                    url = "#" + cfg.hashPrefix() + url;
                }
                url = appendBasePath(url, isHtml5, options.absolute);
                if (!options.absolute || !url) {
                    return url;
                }
                var slash = (!isHtml5 && url ? '/' : ''), port = cfg.port();
                port = (port === 80 || port === 443 ? '' : ':' + port);
                return [cfg.protocol(), '://', cfg.host(), port, slash, url].join('');
            }
        };
    }
}
exports.$UrlRouterProvider = $UrlRouterProvider;
//# sourceMappingURL=urlRouter.js.map