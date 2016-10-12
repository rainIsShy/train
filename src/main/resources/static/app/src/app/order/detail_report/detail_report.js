angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/orderDetailReport', {
        controller: 'OrderDetailReportController',
        templateUrl: 'app/src/app/order/detail_report/detail_report.html'
    })
}]);

angular.module('IOne-Production').controller('OrderDetailReportController', function ($scope, $q, $window, OrderDetailReportService, $mdDialog) {
    $scope.proName = '';
    $scope.cityName = '';
    $scope.channelName = '';
    $scope.itemNo = '';
    $scope.orderDateStart = new Date();
    $scope.orderDateStart.setDate($scope.orderDateStart.getDate() - 1);
    $scope.orderDateEnd = new Date();
    $scope.orderDateEnd.setDate($scope.orderDateEnd.getDate() - 1);
    $scope.deliverDateStart = '';
    $scope.deliverDateEnd = '';
    $scope.totalOrderQty = 0;

    // 搜索清單數值
    $scope.pageOption = {
        sizePerPage: 100, // 报表每页100笔分页显示
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    // [搜索] 按钮
    $scope.queryReport = function () {
        OrderDetailReportService.getAll(
            $scope.pageOption.currentPage,
            $scope.pageOption.sizePerPage,
            $scope.proName, $scope.cityName,
            $scope.channelName, $scope.itemNo,
            $scope.orderDateStart, $scope.orderDateEnd,
            $scope.deliverDateStart, $scope.deliverDateEnd,
            RES_UUID_MAP.PSO.ORDER_DETAIL_REPORT.RES_UUID
        ).success(function (data) {
            $scope.allReportData = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            $scope.totalOrderQty = 0;
            angular.forEach(data.content, function (value) {
                $scope.totalOrderQty += value.orderQuantity;
            });
        });
    };

    // [导出EXCEL] 按钮
    $scope.exportXls = function () {
        OrderDetailReportService.download(
            $scope.pageOption.currentPage,
            $scope.pageOption.sizePerPage,
            $scope.proName, $scope.cityName,
            $scope.channelName, $scope.itemNo,
            $scope.orderDateStart, $scope.orderDateEnd,
            $scope.deliverDateStart, $scope.deliverDateEnd,
            RES_UUID_MAP.PSO.ORDER_DETAIL_REPORT.RES_UUID
        ).success(function (csv) {
            var hiddenElement = document.createElement('a');

            hiddenElement.href = 'data:attachment/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'export.csv';
            hiddenElement.click();
        });
    };

    $scope.openProDlg = function () {
        $mdDialog.show({
            controller: 'SelectController',
            templateUrl: 'app/src/app/order/detail_report/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '1',
                fieldName: '省份',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.proName = data;
        });
    };

    $scope.openCityDlg = function () {
        $mdDialog.show({
            controller: 'SelectController',
            templateUrl: 'app/src/app/order/detail_report/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '2',
                fieldName: '城市',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.cityName = data;
        });
    };

    $scope.openChannelDlg = function () {
        $mdDialog.show({
            controller: 'SelectController',
            templateUrl: 'app/src/app/order/detail_report/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '3',
                fieldName: '经销商',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.channelName = data;
        });
    };

    $scope.openItemNoDlg = function () {
        $mdDialog.show({
            controller: 'SelectController',
            templateUrl: 'app/src/app/order/detail_report/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '4',
                fieldName: '商品型号',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.itemNo = data;
        });
    };
}); // end of controller [OrderDetailReportController]

angular.module('IOne-Production').controller('SelectController', function ($scope, $mdDialog, fieldType, fieldName, fieldValue, OrderDetailReportService) {
    $scope.fieldType = fieldType;
    $scope.fieldName = fieldName;
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
        if (fieldType == '4') {
            $scope.searchKeyword = data.no;
        } else {
            $scope.searchKeyword = data.name;
        }
        $mdDialog.hide($scope.searchKeyword);
    };
    $scope.hideDlg = function () {
        $mdDialog.hide($scope.searchKeyword);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

