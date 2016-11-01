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
    $scope.orderDate = {
        from: previousMonth,
        to: thisMonth
    }
    $scope.report;
    $scope.$watch('orderDate', function (newValue) {
        var orderDateFrom = $filter('date')(newValue.from, 'yyyy-MM-dd');
        var orderDateTo = $filter('date')(newValue.to, 'yyyy-MM-dd');
        EpsOrderReportService.getPlmBaseItemFile(orderDateFrom, orderDateTo, $scope.pageOption).success(function (data) {
            console.log(data);
            $scope.report = data;
        }).error(function (response) {
            $scope.showError(response.message);
        });
    }, true);

});