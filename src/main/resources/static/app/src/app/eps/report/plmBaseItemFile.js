angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/report/plmBaseItemFile', {
        controller: 'EpsOrderReport_plmBaseItemFile_controller',
        templateUrl: 'app/src/app/eps/report/plmBaseItemFile.html'
    })
}]);
angular.module('IOne-Production').controller('EpsOrderReport_plmBaseItemFile_controller', function ($scope, $filter, EpsOrderReportService) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0
    };
    var thisMonth = new Date();
    var previousMonth = new Date();
    previousMonth.setMonth(-1);
    $scope.report = {
        orderDateFrom: previousMonth,
        orderDateTo: thisMonth
    }
    $scope.$watch('report', function (newValue, oldValue) {
        var orderDateFrom = $filter('date')(newValue.orderDateFrom, 'yyyy-MM-dd');
        var orderDateTo = $filter('date')(newValue.orderDateTo, 'yyyy-MM-dd');
        EpsOrderReportService.getPlmBaseItemFile(orderDateFrom, orderDateTo, $scope.pageOption).success(function (data) {
            console.log(data);
        }).error(function (response) {
            $scope.showError(response.message);
        });
    }, true);

});