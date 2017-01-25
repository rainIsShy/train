angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/allotType', {
        controller: 'AllotTypeController',
        templateUrl: 'app/src/app/inv/allotType/allotType.html'
    })
}]);

angular.module('IOne-Production').controller('AllotTypeController', function ($scope, AllotTypeService) {

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
