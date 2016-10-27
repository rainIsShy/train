angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/dsm/stopSale', {
        controller: 'StopSaleController',
        templateUrl: 'app/src/app/dsm/stopSale/stopSale.html'
    })
}]);

angular.module('IOne-Production').controller('StopSaleController', function ($scope, $q, $mdDialog, Constant, SynchronizationService, IoneAdapterService) {

    $scope.listFilterOption = {

        startDate: '',
        endDate: '',
        tiptopDb: ''
    };


    SynchronizationService.getAll().success(function (data) {
        $scope.tiptopDbList = data.content;
    });

    $scope.execute = function () {
        if ($scope.validation()) {
            var param = {
                startTime: moment($scope.listFilterOption.startDate).format('YYYY-MM-DD'),
                endTime: moment($scope.listFilterOption.endDate).format('YYYY-MM-DD'),
                dbName: $scope.listFilterOption.tiptopDb
            };

            IoneAdapterService.transferIoneAdapter("/tcDsbTask", param, $scope, function (response) {
                var totalCount = response.updateCount + response.insertCount;
                $scope.showInfo('共 ' + totalCount + '笔数据同步成功，');
            });
        }
    };

    $scope.validation = function () {
        var isPass = true;

        if ($scope.listFilterOption.startDate == '' || angular.isUndefined($scope.listFilterOption.startDate)) {
            $scope.showError('请输入开始日期!');
            isPass = false;
        }

        if ($scope.listFilterOption.endDate == '' || angular.isUndefined($scope.listFilterOption.endDate)) {
            $scope.showError('请输入截止日期!');
            isPass = false;
        }

        if ($scope.listFilterOption.startDate != '' && $scope.listFilterOption.endDate != '' && $scope.listFilterOption.startDate > $scope.listFilterOption.endDate) {
            $scope.showError('开始日期不可大於截止日期!');
            isPass = false;
        }


        if ($scope.listFilterOption.tiptopDb == '' || angular.isUndefined($scope.listFilterOption.tiptopDb)) {
            $scope.showError('请输入TIPTOP DB');
            isPass = false;
        }

        return isPass;
    };



});