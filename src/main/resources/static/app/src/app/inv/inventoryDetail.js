angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/inventoryDetail', {
        controller: 'InventoryDetailController',
        templateUrl: 'app/src/app/inv/inventoryDetail.html'
    })
}]);

angular.module('IOne-Production').controller('InventoryDetailController', function ($mdDialog, $scope, InventoryDetailService) {

    $scope.inventoryDetailQuery = {
        warehouseNO : '',
        warehouseName : '',
        itemFileNo : '',
        itemFileName : '',
        itemFileStandard : ''
    };

    // 搜索清單數值
    $scope.pageOption = {
        sizePerPage: 5, // 报表每页5笔分页显示
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.enterKeyDown = function(e){
        var keycode = window.event?e.keyCode:e.which;
        if(keycode === 13){
            $scope.queryReport();
        }
    }

    // [搜索] 按钮
    $scope.queryReport = function () {
        InventoryDetailService.getAll(
            $scope.pageOption.currentPage,
            $scope.pageOption.sizePerPage,
            $scope.inventoryDetailQuery
        ).success(function (data) {
            $scope.allInventoryDetailData = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };


    $scope.openChannelDlg = function () {
        $mdDialog.show({
            controller: 'SelectController',
            templateUrl: 'app/src/app/inv/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '1',
                fieldName: '仓库',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.proName = data;
        });
    };

    $scope.openGoodsDlg = function () {
        $mdDialog.show({
            controller: 'SelectController',
            templateUrl: 'app/src/app/inv/selectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                fieldType: '2',
                fieldName: '仓库',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.proName = data;
        });
    };

});

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
            OrderDetailReportService.search($scope.pageOption.currentPage, $scope.pageOption.sizePerPage)
                .success(function (data) {
                    $scope.searchResult = data;
                    $scope.pageOption.totalElements = data.totalElements;
                    $scope.pageOption.totalPage = data.totalPages;
                });
        };
        $scope.refreshList();

        $scope.hideDlg = function () {
            $mdDialog.hide($scope.searchKeyword);
        };
        $scope.cancelDlg = function () {
            $mdDialog.cancel();
        };
    });