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
                      if (response.data.content.length > 0) {
                          if (!angular.isUndefined(response.data.content[0].confirm)) {
                              dtl.psoOrderConfirm = response.data.content[0].confirm;
                          }
                          if (!angular.isUndefined(response.data.content[0].transferPsoFlag)) {
                              dtl.psoOrderTransfer = response.data.content[0].transferPsoFlag
                          }
                          if (!angular.isUndefined(response.data.content[0].channel)) {
                              dtl.ocmBaseChanUuid = response.data.content[0].channel.uuid;
                          }
                      }
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

    $scope.shipGoods = function () {
        var isConfirm = false;
        var selectedList = [];
        angular.forEach($scope.logisticsDetailRelations, function (dtl) {
            if (dtl.isSelected && dtl.confirm == 2) {
                isConfirm = true;
            } else if (dtl.isSelected) {
                selectedList.push(dtl);
            }
        });

        if (isConfirm) {
            $scope.showError("所选的单据已审核！");
        } else {
            angular.forEach(selectedList, function (dtl, index) {
                //物流公司代码.如"POST"就代表中国邮政,"ZJS"就代表宅急送.调用 taobao.logistics.companies.get 获取。
                //company_code, 目前固定用 POST.
                //configKey 之後要開放成, 是可以選店家的, 或者從數據上自帶入
                var sendData = {
                    tid: dtl.orderId,
                    out_sid: dtl.logisticsNo,
                    company_code: "POST",
                    configKey: dtl.ocmBaseChanUuid
                };
                TaoBaoAdapterService.executeLogistics(sendData, $scope, function (response) {
                    LogisticsDetailRelationsService.updateShipStatus(dtl).then(
                        function (response) {
                            if ((selectedList.length - 1) == index) {
                                //重新查询。
                                $scope.queryAll();
                                $scope.showInfo("发货成功！");
                            }
                        },
                        function (error) {
                            $scope.showError(error);
                        }
                    );
                });
                // console.log("需要被發貨的單 ", dtl.orderId);
            });
        }

    }

    function init(){
        $scope.queryAll();
    }
    init();
});
