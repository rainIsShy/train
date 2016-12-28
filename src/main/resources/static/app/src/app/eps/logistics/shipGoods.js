angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/shipGoodsManagement', {
        controller: 'ShipGoodsManagementController',
        templateUrl: 'app/src/app/eps/logistics/shipGoods.html'
    })
}]);

angular.module('IOne-Production').controller('ShipGoodsManagementController', function ($scope,$mdDialog,LogisticsDetailRelationsService) {
    $scope.queryConditions = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
    };
    $scope.tableColumns = [
        {name:"supplierName"    ,description: "物流公司" },
        {name:"orderId"         ,description: "订单号" },
        {name:"receiveName"     ,description: "收货人" },
        {name:"receiveAddress"  ,description: "发货地址" },
        {name:"receivePhone"    ,description: "联系电话" },
        {name:"confirm"         ,description: "发货状态" },
        {name:"psoOrderConfirm" ,description: "预订单审核" },
        {name:"psoOrderTransfer",description: "预订单抛转" },
    ];
    $scope.logisticsDetailRelations = [] ;
    $scope.queryAll = function(){
        LogisticsDetailRelationsService.getAll($scope.queryConditions).then(
           function (response) {
               $scope.queryConditions.totalPage = response.data.totalPages;
               $scope.queryConditions.totalElements = response.data.totalElements;
               $scope.logisticsDetailRelations =  response.data.content;
               console.log(response);
           },
           function () {
               $scope.showError("服務存取失敗!");
           }
        );
    }
    function init(){
        $scope.queryAll();
    }
    init();
});
