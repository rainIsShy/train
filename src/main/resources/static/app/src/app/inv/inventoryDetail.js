angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/inventoryDetail', {
        controller: 'InventoryDetailController',
        templateUrl: 'app/src/app/inv/inventoryDetail.html'
    })
}]);

angular.module('IOne-Production').controller('InventoryDetailController', function ($mdDialog, $scope, InventoryDetailService) {

    $scope.inventoryDetailQuery = {
        warehouseKeyWord: '',
        itemKeyWord: ''
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
            $scope.inventoryDetailQuery.warehouseKeyWord = data.selectWarehouseName;
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
                fieldName: '商品',
                fieldValue: $scope
            }
        }).then(function (data) {
            $scope.inventoryDetailQuery.itemKeyWord = data.selectProductionName;
        });
    };

});

angular.module('IOne-Production').controller('SelectController', function ($rootScope, $scope, $mdDialog, fieldType, fieldName, InventoryDetailService, fieldValue, Constant) {
        $scope.fieldType = fieldType;
        $scope.fieldName = fieldName;

        $scope.listFilterOption = {
            no: '',
            name: '',
            keyWord: ''
        };

        switch (fieldType) {
            case '1':
                $scope.listFilterOption.keyWord = fieldValue.inventoryDetailQuery.warehouseKeyWord;
                break;
            case '2':
                $scope.listFilterOption.keyWord = fieldValue.inventoryDetailQuery.itemKeyWord;
                break;
        };

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
            if(fieldType == '2'){
                var itemQuery = {
                    globalQuery : $scope.listFilterOption.keyWord,
                    release : '',
                    status : '',
                    confirm : '',
                    showAllItems : ''
                };
                InventoryDetailService.getAllProduction($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, itemQuery).success(function(data){
                    $scope.searchResultList = data.content;
                    $scope.pageOption.totalElements = data.totalElements;
                    $scope.pageOption.totalPage = data.totalPages;
                });
            }else{
                InventoryDetailService.getAllWarehouse($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
                    $scope.searchResultList = data.content;
                    $scope.pageOption.totalElements = data.totalElements;
                    $scope.pageOption.totalPage = data.totalPages;
                });
            }
        };
        $scope.refreshList();

        $scope.hideDlg = function () {
            $mdDialog.hide($scope.searchKeyword);
        };
        $scope.cancelDlg = function () {
            $mdDialog.cancel();
        };

        $scope.select = function(item){
            if(fieldType == '2'){
                fieldValue.selectProductionName = item.name;
                $mdDialog.hide(fieldValue);
            }else{
                fieldValue.selectWarehouseName = item.name;
                $mdDialog.hide(fieldValue);
            }
        }
    });