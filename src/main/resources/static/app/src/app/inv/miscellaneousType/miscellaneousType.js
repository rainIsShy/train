angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/miscellaneousType', {
        controller: 'MiscellaneousTypeController',
        templateUrl: 'app/src/app/inv/miscellaneousType/miscellaneousType.html'
    })
}]);

angular.module('IOne-Production').controller('MiscellaneousTypeController', function ($scope, MiscellaneousTypeService) {

    $scope.queryConditions = {};

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    function init() {

    }

    init();
});
