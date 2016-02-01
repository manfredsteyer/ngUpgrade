var common_1 = require("../common/common");
var module_1 = require("../params/module");
var parseUrl = function (url) {
    if (!common_1.isString(url))
        return false;
    var root = url.charAt(0) === '^';
    return { val: root ? url.substring(1) : url, root: root };
};
var StateBuilder = (function () {
    function StateBuilder(root, matcher, $urlMatcherFactoryProvider) {
        this.matcher = matcher;
        var self = this;
        this.builders = {
            parent: [function (state) {
                    if (state === root())
                        return null;
                    return matcher.find(self.parentName(state)) || root();
                }],
            data: [function (state) {
                    if (state.parent && state.parent.data) {
                        state.data = state.self.data = common_1.extend({}, state.parent.data, state.data);
                    }
                    return state.data;
                }],
            url: [function (state) {
                    var stateDec = state;
                    var parsed = parseUrl(stateDec.url), parent = state.parent;
                    var url = !parsed ? stateDec.url : $urlMatcherFactoryProvider.compile(parsed.val, {
                        params: state.params || {},
                        paramMap: function (paramConfig, isSearch) {
                            if (stateDec.reloadOnSearch === false && isSearch)
                                paramConfig = common_1.extend(paramConfig || {}, { dynamic: true });
                            return paramConfig;
                        }
                    });
                    if (!url)
                        return null;
                    if (!$urlMatcherFactoryProvider.isMatcher(url))
                        throw new Error("Invalid url '" + url + "' in state '" + state + "'");
                    return (parsed && parsed.root) ? url : ((parent && parent.navigable) || root()).url.append(url);
                }],
            navigable: [function (state) {
                    return (state !== root()) && state.url ? state : (state.parent ? state.parent.navigable : null);
                }],
            params: [function (state) {
                    var makeConfigParam = function (config, id) { return module_1.Param.fromConfig(id, null, config); };
                    var urlParams = (state.url && state.url.parameters({ inherit: false })) || [];
                    var nonUrlParams = common_1.values(common_1.map(common_1.omit(state.params || {}, urlParams.map(common_1.prop('id'))), makeConfigParam));
                    return urlParams.concat(nonUrlParams).map(function (p) { return [p.id, p]; }).reduce(common_1.applyPairs, {});
                }],
            views: [function (state) {
                    var views = {}, tplKeys = ['templateProvider', 'templateUrl', 'template', 'notify', 'async'], ctrlKeys = ['controller', 'controllerProvider', 'controllerAs'];
                    var allKeys = tplKeys.concat(ctrlKeys);
                    common_1.forEach(state.views || { "$default": common_1.pick(state, allKeys) }, function (config, name) {
                        name = name || "$default";
                        common_1.forEach(ctrlKeys, function (key) {
                            if (state[key] && !config[key])
                                config[key] = state[key];
                        });
                        if (Object.keys(config).length > 0)
                            views[name] = config;
                    });
                    return views;
                }],
            path: [function (state) {
                    return state.parent ? state.parent.path.concat(state) : [state];
                }],
            includes: [function (state) {
                    var includes = state.parent ? common_1.extend({}, state.parent.includes) : {};
                    includes[state.name] = true;
                    return includes;
                }]
        };
    }
    StateBuilder.prototype.builder = function (name, fn) {
        var builders = this.builders;
        var array = builders[name] || [];
        if (common_1.isString(name) && !common_1.isDefined(fn))
            return array.length > 1 ? array : array[0];
        if (!common_1.isString(name) || !common_1.isFunction(fn))
            return;
        builders[name] = array;
        builders[name].push(fn);
        return function () { return builders[name].splice(builders[name].indexOf(fn, 1)) && null; };
    };
    StateBuilder.prototype.build = function (state) {
        var _a = this, matcher = _a.matcher, builders = _a.builders;
        var parent = this.parentName(state);
        if (parent && !matcher.find(parent))
            return null;
        for (var key in builders) {
            if (!builders.hasOwnProperty(key))
                continue;
            var chain = builders[key].reduce(function (parentFn, step) { return function (state) { return step(state, parentFn); }; }, common_1.noop);
            state[key] = chain(state);
        }
        return state;
    };
    StateBuilder.prototype.parentName = function (state) {
        var name = state.name || "";
        if (name.indexOf('.') !== -1)
            return name.substring(0, name.lastIndexOf('.'));
        if (!state.parent)
            return "";
        return common_1.isString(state.parent) ? state.parent : state.parent.name;
    };
    StateBuilder.prototype.name = function (state) {
        var name = state.name;
        if (name.indexOf('.') !== -1 || !state.parent)
            return name;
        var parentName = common_1.isString(state.parent) ? state.parent : state.parent.name;
        return parentName ? parentName + "." + name : name;
    };
    return StateBuilder;
})();
exports.StateBuilder = StateBuilder;
//# sourceMappingURL=stateBuilder.js.map