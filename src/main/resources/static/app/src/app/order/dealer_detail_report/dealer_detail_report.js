angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/dealerOrderDetailReport', {
        controller: 'DeaderOrderDetailReportController',
        templateUrl: 'app/src/app/order/dealer_detail_report/dealer_detail_report.html'
    })
}]);

angular.module('IOne-Production').controller('DeaderOrderDetailReportController', function ($scope, $q, $window, $http, $filter, Constant, $mdDialog) {
    $scope.proName = '';
    $scope.cityName = '';
    $scope.districtName = '';
    $scope.channelName = '';

    $scope.orderDateStart = new Date();
    $scope.orderDateStart.setDate(1);

    $scope.orderDateEnd = new Date();
    $scope.orderDateEnd.setDate($scope.orderDateEnd.getDate() - 1);

    $scope.totalOrderQty = 0;

    $scope.menuDisplayOption = {
        'search': {display: true, name: '搜索', uuid: '39c6eb64-15e3-4cd2-af83-7b13139156f9'},
        'export': {display: true, name: '导出EXCEL', uuid: 'cd458a06-7ba0-4983-93b6-c4f6d022ca3e'}
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.DEALER_DETAIL_REPORT.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });

    // 搜索清單數值
    $scope.pageOption = {
        sizePerPage: 100, // 报表每页100笔分页显示
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    // [搜索] 按钮
    $scope.queryReport = function () {
        $http.get(Constant.BACKEND_BASE + '/dealerDetailReport', {
            params: {
                orderDateStart: $filter('date')($scope.orderDateStart, 'yyyy-MM-dd'),
                orderDateEnd: $filter('date')($scope.orderDateEnd, 'yyyy-MM-dd'),
                proName: $scope.proName,
                cityName: $scope.cityName,
                districtName:  $scope.districtName,
                channelName: $scope.channelName
            }
        }).success(function(data) {
            $scope.reportResult = data;
        })
    };

    $scope.openProDlg = function () {
        $mdDialog.show({
            controller: 'ReportQuerySelectController',
            templateUrl: 'app/src/app/order/dealer_detail_report/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '1',
                fieldName: '省份',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.proName = data.name;
        });
    };

    $scope.openCityDlg = function () {
        $mdDialog.show({
            controller: 'ReportQuerySelectController',
            templateUrl: 'app/src/app/order/dealer_detail_report/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '2',
                fieldName: '城市',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.cityName = data.name;
        });
    };

    $scope.openDistrictDlg = function () {
        $mdDialog.show({
            controller: 'ReportQuerySelectController',
            templateUrl: 'app/src/app/order/dealer_detail_report/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '5',
                fieldName: '地区',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.districtName = data.name;
        });
    };

    $scope.openChannelDlg = function () {
        $mdDialog.show({
            controller: 'ReportQuerySelectController',
            templateUrl: 'app/src/app/order/dealer_detail_report/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '3',
                fieldName: '经销商',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.channelName = data.name;
        });
    };
}); // end of controller [OrderDetailReportController]

angular.module('IOne-Production').controller('ReportQuerySelectController', function ($scope, $mdDialog, fieldType, fieldName, fieldValue, OrderDetailReportService) {
    $scope.fieldType = fieldType;
    $scope.fieldName = fieldName;
    $scope.searchResult = {};
    switch (fieldType) {
        case '1':
            $scope.searchKeyword = fieldValue.proName;
            break;
        case '2':
            $scope.searchKeyword = fieldValue.cityName;
            break;
        case '3':
            $scope.searchKeyword = fieldValue.channelName;
            break;
        case '4':
            $scope.searchKeyword = fieldValue.itemNo;
            break;
        case '5':
            $scope.searchKeyword = fieldValue.districtName;
            break;
    }

    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };
    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshList();
    };
    $scope.refreshList = function () {
        OrderDetailReportService.search($scope.pageOption.currentPage, $scope.pageOption.sizePerPage, $scope.searchKeyword, fieldType, fieldValue)
            .success(function (data) {
                $scope.searchResult = data;
                $scope.pageOption.totalElements = data.totalElements;
                $scope.pageOption.totalPage = data.totalPages;
            });
    };
    $scope.refreshList();
    $scope.select = function (data) {
        $scope.searchResult = data;
        $mdDialog.hide($scope.searchResult);
    };
    $scope.hideDlg = function () {
        $mdDialog.hide($scope.searchResult);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});