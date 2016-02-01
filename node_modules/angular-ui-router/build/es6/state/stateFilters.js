$IsStateFilter.$inject = ['$state'];
export function $IsStateFilter($state) {
    return function (state) {
        return $state.is(state);
    };
}
$IncludedByStateFilter.$inject = ['$state'];
export function $IncludedByStateFilter($state) {
    return function (state, params, options) {
        return $state.includes(state, params, options);
    };
}
angular.module('ui.router.state')
    .filter('isState', $IsStateFilter)
    .filter('includedByState', $IncludedByStateFilter);
//# sourceMappingURL=stateFilters.js.map