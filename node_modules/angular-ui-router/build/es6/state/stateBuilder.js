import { map, noop, extend, pick, omit, values, applyPairs, prop, isDefined, isFunction, isString, forEach } from "../common/common";
import { Param } from "../params/module";
const parseUrl = (url) => {
    if (!isString(url))
        return false;
    var root = url.charAt(0) === '^';
    return { val: root ? url.substring(1) : url, root };
};
export class StateBuilder {
    constructor(root, matcher, $urlMatcherFactoryProvider) {
        this.matcher = matcher;
        let self = this;
        this.builders = {
            parent: [function (state) {
                    if (state === root())
                        return null;
                    return matcher.find(self.parentName(state)) || root();
                }],
            data: [function (state) {
                    if (state.parent && state.parent.data) {
                        state.data = state.self.data = extend({}, state.parent.data, state.data);
                    }
                    return state.data;
                }],
            url: [function (state) {
                    let stateDec = state;
                    const parsed = parseUrl(stateDec.url), parent = state.parent;
                    const url = !parsed ? stateDec.url : $urlMatcherFactoryProvider.compile(parsed.val, {
                        params: state.params || {},
                        paramMap: function (paramConfig, isSearch) {
                            if (stateDec.reloadOnSearch === false && isSearch)
                                paramConfig = extend(paramConfig || {}, { dynamic: true });
                            return paramConfig;
                        }
                    });
                    if (!url)
                        return null;
                    if (!$urlMatcherFactoryProvider.isMatcher(url))
                        throw new Error(`Invalid url '${url}' in state '${state}'`);
                    return (parsed && parsed.root) ? url : ((parent && parent.navigable) || root()).url.append(url);
                }],
            navigable: [function (state) {
                    return (state !== root()) && state.url ? state : (state.parent ? state.parent.navigable : null);
                }],
            params: [function (state) {
                    const makeConfigParam = (config, id) => Param.fromConfig(id, null, config);
                    let urlParams = (state.url && state.url.parameters({ inherit: false })) || [];
                    let nonUrlParams = values(map(omit(state.params || {}, urlParams.map(prop('id'))), makeConfigParam));
                    return urlParams.concat(nonUrlParams).map(p => [p.id, p]).reduce(applyPairs, {});
                }],
            views: [function (state) {
                    let views = {}, tplKeys = ['templateProvider', 'templateUrl', 'template', 'notify', 'async'], ctrlKeys = ['controller', 'controllerProvider', 'controllerAs'];
                    let allKeys = tplKeys.concat(ctrlKeys);
                    forEach(state.views || { "$default": pick(state, allKeys) }, function (config, name) {
                        name = name || "$default";
                        forEach(ctrlKeys, (key) => {
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
                    let includes = state.parent ? extend({}, state.parent.includes) : {};
                    includes[state.name] = true;
                    return includes;
                }]
        };
    }
    builder(name, fn) {
        let builders = this.builders;
        let array = builders[name] || [];
        if (isString(name) && !isDefined(fn))
            return array.length > 1 ? array : array[0];
        if (!isString(name) || !isFunction(fn))
            return;
        builders[name] = array;
        builders[name].push(fn);
        return () => builders[name].splice(builders[name].indexOf(fn, 1)) && null;
    }
    build(state) {
        let { matcher, builders } = this;
        let parent = this.parentName(state);
        if (parent && !matcher.find(parent))
            return null;
        for (let key in builders) {
            if (!builders.hasOwnProperty(key))
                continue;
            let chain = builders[key].reduce((parentFn, step) => (state) => step(state, parentFn), noop);
            state[key] = chain(state);
        }
        return state;
    }
    parentName(state) {
        let name = state.name || "";
        if (name.indexOf('.') !== -1)
            return name.substring(0, name.lastIndexOf('.'));
        if (!state.parent)
            return "";
        return isString(state.parent) ? state.parent : state.parent.name;
    }
    name(state) {
        let name = state.name;
        if (name.indexOf('.') !== -1 || !state.parent)
            return name;
        let parentName = isString(state.parent) ? state.parent : state.parent.name;
        return parentName ? parentName + "." + name : name;
    }
}
//# sourceMappingURL=stateBuilder.js.map