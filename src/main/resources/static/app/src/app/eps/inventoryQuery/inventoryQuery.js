angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/inventoryQuery', {
        controller: 'InventoryQueryController',
        templateUrl: 'app/src/app/eps/inventoryQuery/inventoryQuery.html'
    })
}]);
angular.module('IOne-Production').controller('InventoryQueryController', function ($scope, InventoryQueryMaster, WalkThroughDetail, Constant, $mdDialog) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };
    $scope.BUILDING_TYPE = Constant.BUILDING_TYPE;
    $scope.WALK_THROUGH_CONF_STATUS = Constant.WALK_THROUGH_CONF_STATUS;
    $scope.EPS_ORDER_TYPE = Constant.EPS_ORDER_TYPE;
    $scope.selectAllFlag = false;
    $scope.selectedItemSize = 0;
    $scope.selectedItemAmount = 0;
    $scope.isLoading = false;

    $scope.listFilterOption = {
        suite : ''
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        InventoryQueryMaster.getAll($scope.listFilterOption.suite).success(function (data) {
        if(data){
            $scope.pageOption.totalPage = Math.floor(data.length/$scope.pageOption.sizePerPage)+1;
                $scope.pageOption.totalElements = data.length;
                var startCurrentPageTotal = $scope.pageOption.currentPage*$scope.pageOption.sizePerPage;
                var endCurrentPageTotal = startCurrentPageTotal+$scope.pageOption.sizePerPage;
                var tempDataList = [];
                for(var i=startCurrentPageTotal;i<endCurrentPageTotal;i++){
                    if(data[i]){
                    tempDataList.push(data[i]);
                    }
                }
                $scope.itemList = tempDataList;
        }
        if (data.length == 0 && $scope.listFilterOption.suite != "") {
            $scope.showWarn("该料号不存在");
        }
    });
    InventoryQueryMaster.getTotal($scope.listFilterOption.suite).success(function (data) {
        $scope.itemListTotal = data;
    });

    };

    $scope.$watch('listFilterOption.select', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.queryEnter = function (e) {
        if (e.keyCode === 13) {
            $scope.pageOption.currentPage = 0;
            $scope.pageOption.totalPage = 0;
            $scope.pageOption.totalElements = 0;
            $scope.refreshList();
        }
    };




    $scope.openQuerylDlg = function () {
        $mdDialog.show({
            controller: 'QueryDlgController',
            templateUrl: 'app/src/app/eps/inventoryQuery/queryDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                saleTypes: $scope.saleTypes,
                OrderDetailList: $scope.OrderDetailList
            }
        }).then(function (data) {
            var queryReturnData = data;
            $scope.listFilterOption.suite = queryReturnData.childNo;
            console.log($scope.listFilterOption.suite);
        });
    };
});

angular.module('IOne-Production').controller('QueryDlgController', function ($scope, $mdDialog, saleTypes, OrderDetailList, Production) {
    $scope.OrderDetailList = angular.copy(OrderDetailList);
    $scope.addOrderDetail = [];

    $scope.itemSearchParam = {
        confirm: 2,
        release: 2,
        status: 1,
        eshopType: 2,
        assemblingFlag: 1
    };

    $scope.disableOrderPrice = false;
    $scope.isChangingProduction = false;
    $scope.showChangingProductionPanel = function () {
        $scope.isChangingProduction = true;
    };
    $scope.hideChangingProductionPanel = function () {
        $scope.isChangingProduction = false;
    };
    var maxNo = 0;
    $scope.findMaxNo = function (OrderDetailList) {
        if ($scope.OrderDetailList !== undefined && $scope.OrderDetailList !== '' && $scope.OrderDetailList !== null) {
            maxNo = 0;
            angular.forEach(OrderDetailList.content, function (orderDetail) {
                if (Number(orderDetail.no) > Number(maxNo)) {
                    maxNo = Number(orderDetail.no)
                }
            });
        }
    };
    $scope.findMaxNo(OrderDetailList);
    $scope.setZero = function (saleType) {
        if (saleType.name == '赠送') {
            $scope.addOrderDetail.orderPrice = 0;
            $scope.disableOrderPrice = true;
        } else {
            $scope.disableOrderPrice = false;
        }
    };

    //选中商品
    $scope.selectBom = function (production) {
        if (production) {
            $scope.addOrderDetail.no = Number(maxNo) + Number(1);
            $scope.addOrderDetail.item = production;
            $scope.addOrderDetail.itemUuid = production.uuid;
            $scope.addOrderDetail.orderQuantity = 1;    //新增时默认数量设置为1
            $scope.isChangingProduction = false;
        }
    };

    $scope.hideDlg = function () {
        Production.getNo($scope.addOrderDetail.item.name,$scope.addOrderDetail.item.no).success(function (data) {
            $scope.returnData = data;
            $scope.addOrderDetail.childNo = $scope.returnData[0].no;
            $mdDialog.hide($scope.addOrderDetail);
        });
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});