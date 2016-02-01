$IsStateFilter.$inject = ['$state'];
function $IsStateFilter($state) {
    return function (state) {
        return $state.is(state);
    };
}
exports.$IsStateFilter = $IsStateFilter;
$IncludedByStateFilter.$inject = ['$state'];
function $IncludedByStateFilter($state) {
    return function (state, params, options) {
        return $state.includes(state, params, options);
    };
}
exports.$IncludedByStateFilter = $IncludedByStateFilter;
angular.module('ui.router.state')
    .filter('isState', $IsStateFilter)
    .filter('includedByState', $IncludedByStateFilter);
//# sourceMappingURL=stateFilters.js.map