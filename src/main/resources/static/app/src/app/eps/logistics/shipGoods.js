angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/shipGoodsManagement', {
        controller: 'ShipGoodsManagementController',
        templateUrl: 'app/src/app/eps/logistics/shipGoods.html'
    })
}]);

angular.module('IOne-Production').controller('ShipGoodsManagementController', function ($scope,$mdDialog,LogisticsDetailRelationsService,SalesOrderMaster,TaoBaoAdapterService,Constant) {
    $scope.Constant = Constant;
    $scope.isSelectedAll = false;
    $scope.queryConditions = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
    };

    $scope.logisticsDetailRelations = [] ;
    $scope.queryAll = function(){
        LogisticsDetailRelationsService.getAll($scope.queryConditions).then(
           function (response) {
               $scope.queryConditions.totalPage = response.data.totalPages;
               $scope.queryConditions.totalElements = response.data.totalElements;
               $scope.logisticsDetailRelations =  response.data.content;
               fetchPsoOrder($scope.logisticsDetailRelations);
               console.log(response);
           },
           function () {
               $scope.showError("服務存取失敗!");
           }
        );
        function fetchPsoOrder(logisticsDetailRelations){
            angular.forEach(logisticsDetailRelations, function(dtl, key) {
              dtl.isSelected = false;
              var orderId = dtl.orderId;
              SalesOrderMaster.getAll(10,0,'' ,'','' ,null , orderId, null, null, null, null).then(
                  function (response) {
                      dtl.psoOrderConfirm = response.data.content[0].confirm;
                      dtl.psoOrderTransfer = response.data.content[0].transferPsoFlag
                  },
                  function () {
                      $scope.showError("服務存取失敗!");
                  }
               );

            });
        }
    }

    $scope.selectAll = function(){
        angular.forEach($scope.logisticsDetailRelations, function(dtl, key) {
            dtl.isSelected = $scope.isSelectedAll;
        });
    }

    $scope.shipGoods = function(){
        angular.forEach($scope.logisticsDetailRelations, function(dtl, key) {
            if(dtl.isSelected){
                console.log("需要被發貨的單 ",dtl.orderId);
            }
        });
    }

    function init(){
        $scope.queryAll();
    }
    init();
});
