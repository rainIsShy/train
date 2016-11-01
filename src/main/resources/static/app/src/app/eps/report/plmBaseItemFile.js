angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/report/plmBaseItemFile', {
        controller: 'EpsOrderReport_plmBaseItemFile_controller',
        templateUrl: 'app/src/app/eps/report/plmBaseItemFile.html'
    })
}]);
angular.module('IOne-Production').controller('EpsOrderReport_plmBaseItemFile_controller', function ($scope, $filter, EpsOrderReportService) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };
    var thisMonth = new Date();
    var previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    $scope.orderDate = {
        from: previousMonth,
        to: thisMonth
    }
    $scope.report;
    $scope.$watch('orderDate', function () {
        $scope.refreshList();
    }, true);
    $scope.refreshList = function () {
        var orderDateFrom = $filter('date')($scope.orderDate.from, 'yyyy-MM-dd');
        var orderDateTo = $filter('date')($scope.orderDate.to, 'yyyy-MM-dd');
        EpsOrderReportService.getPlmBaseItemFile(orderDateFrom, orderDateTo, $scope.pageOption).success(function (data) {
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.report = data;
        }).error(function (response) {
            $scope.showError(response.message);
        });
    }

});