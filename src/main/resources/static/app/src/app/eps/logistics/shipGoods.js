angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/shipGoodsManagement', {
        controller: 'ShipGoodsManagementController',
        templateUrl: 'app/src/app/eps/logistics/shipGoods.html'
    })
}]);

angular.module('IOne-Production').controller('ShipGoodsManagementController', function ($scope,$mdDialog,$filter,Upload,LogisticsDetailRelationsService,SalesOrderMaster,TaoBaoAdapterService,Constant) {
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
         angular.forEach($scope.queryConditions, function (value, key) {
             if (value instanceof Date)$scope.queryConditions[key] = $filter('date')(value, "yyyy-MM-dd");
         });
        $scope.queryConditions.status = $scope.Constant.STATUS[1].value ;
        $scope.queryConditions.size = $scope.queryConditions.sizePerPage;
        $scope.queryConditions.page = $scope.queryConditions.currentPage;
        LogisticsDetailRelationsService.getAll($scope.queryConditions).then(
           function (response) {
               $scope.queryConditions.totalPage = response.data.totalPages;
               $scope.queryConditions.totalElements = response.data.totalElements;
               $scope.logisticsDetailRelations =  response.data.content;
               fetchPsoOrder($scope.logisticsDetailRelations);
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

    $scope.addAllByExcel = function(files){
        if (files.length==0) return;

        $mdDialog.show({
            targetEvent: event,
            templateUrl: 'app/src/app/eps/logistics/logisticsDetailRelationExcelUploader.html',
            scope: $scope,
            preserveScope: true,
            locals: {files: files},
            controller: DialogController
            }).then(function () {

            });
    }

    function DialogController($scope, $mdDialog,files) {
        var messages = {
            "confirm" : "确认是否导入EXCEL",
            "uploading" : "导入中...",
            "done" : "导入完成",
        };
        $scope.handleMessage = messages.confirm;
        $scope.isStartUpload = false;
        $scope.isNotCloseable = false;
        $scope.closeDialog = function () {
            $mdDialog.hide();
        }
        $scope.startUpload = function(){
            $scope.isStartUpload = true;
            $scope.isNotCloseable = true;
            $scope.handleMessage = messages.uploading;
            $scope.progress = {value: 0};
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    Upload.upload({
                        url: Constant.BACKEND_BASE +'/logisticsDetailRelations/excel',
                        fields: {},
                        file: file
                    }).progress(function (evt) {
                        $scope.progress.value = Math.min(100, parseInt(99.0 * evt.loaded / evt.total));
                    }).success(function (data) {
                        $scope.isNotCloseable = false;
                        $scope.handleMessage = messages.done;
                        $scope.queryAll();
                    }).error(function () {
                        $scope.isNotCloseable = false;
                        $scope.showError("服務存取失敗!");
                    });
                }
            }
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
