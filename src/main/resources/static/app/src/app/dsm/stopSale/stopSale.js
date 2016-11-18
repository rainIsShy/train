angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/dsm/stopSale', {
        controller: 'StopSaleController',
        templateUrl: 'app/src/app/dsm/stopSale/stopSale.html'
    })
}]);

angular.module('IOne-Production').controller('StopSaleController', function ($scope, $q, $mdDialog, Constant, SynchronizationService, IoneAdapterService) {

    $scope.listFilterOption = {
        syncType: '',
        startDate: '',
        endDate: '',
        tiptopDb: ''
    };

    $scope.TIPTOP_SYNC_TYPE = {
        PLM_ITEM_CHAN_PRICE: {value: 'PLM_ITEM_CHAN_PRICE', name: '停售同步'},
        PLM_ITEM_ITEM_FILE: {value: 'PLM_ITEM_ITEM_FILE', name: '商品同步'},
        PLM_ITEM_BOM_FILE: {value: 'PLM_ITEM_BOM_FILE', name: 'BOM信息同步'},
        PLM_ITEM_ITEM_FILE: {value: 'PLM_ITEM_ITEM_FILE', name: '商品同步'},
        PLM_ITEM_CHAN_PRICE2: {value: 'PLM_ITEM_CHAN_PRICE', name: '商品渠道信息同步'},
        PLM_ITEM_BOM: {value: 'PLM_ITEM_ITEM_FILE', name: '品牌信息同步'}
    };


    $scope.selected = [];
    $scope.selectAllFlag = false;
    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        var idx = $scope.selected.indexOf(item);
        if (idx > -1) {
            $scope.selected.splice(idx, 1);
        }
        else {
            $scope.selected.push(item);
        }
        $scope.selectItemCount = $scope.selected.length;

    };

    $scope.clearSelection = function () {
        $scope.selected = [];
        $scope.selectItemCount = 0;
        $scope.selectAllFlag = false;
    };


    $scope.getTiptopDbByType = function (syncType) {
        $scope.clearSelection();
        if (angular.isDefined(syncType)) {
            SynchronizationService.getAll(syncType.value).success(function (data) {
                $scope.tiptopDbList = data.content;
            });
        }
    };

    $scope.getTiptopDbByType();


    $scope.execute = function () {
        if ($scope.validation()) {
            var promises = [];
            $scope.logining = true;
            angular.forEach($scope.selected, function (item) {
                var param = {
                    startTime: moment($scope.listFilterOption.startDate).format('YYYY-MM-DD'),
                    endTime: moment($scope.listFilterOption.endDate).format('YYYY-MM-DD'),
                    dbName: item.tiptopDb
                };

                $scope.syncingDb = item.tiptopDb;

                if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_CHAN_PRICE.name) {
                    //同步停售
                    var result = IoneAdapterService.transferIoneAdapter("/tcDsbTask", param, $scope, function (response) {
                        var totalDsbCount = addResponse(response.updateDsbCount, response.insertDsbCount);
                        var totalPlmCount = addResponse(response.updatePlmCount, response.insertPlmCount);
                        $scope.showInfo(item.tiptopDb + '：ERP同步到tiptop_tc_dsb_file，共 ' + totalDsbCount + '笔数据同步成功!\n tiptop_tc_dsb_file 同步到 plm，共 ' + totalPlmCount + '笔数据同步成功!');
                    }).error(function (data) {
                        $scope.logining = false;
                        $scope.showError(data.message);
                    });

                    promises.push(result);

                }
                if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_ITEM_FILE.name) {
                    //同步商品
                    var result = IoneAdapterService.transferIoneAdapter("/tcImaTask", param, $scope, function (response) {
                        console.log(response);
                        var totalImaCount = addResponse(response.updateImaCount, response.insertImaCount);
                        var totalItemCount = addResponse(response.updateItemCount, response.insertItemCount);
                        $scope.showInfo(item.tiptopDb + '：ERP同步到tiptop_tc_ima_file，共 ' + totalImaCount + '笔数据同步成功!\n tiptop_tc_ima_file 同步到 plm，共 ' + totalItemCount + '笔数据同步成功!');

                    }).error(function (data) {
                        $scope.logining = false;
                        $scope.showError(data.message);
                    });

                    promises.push(result);
                }

                if (item.syncType == 'PLM_ITEM_BOM_FILE') {
                    //BOM同步
                    var result = IoneAdapterService.transferIoneAdapter("/bmbTask", param, $scope, function (response) {
                        console.log(response);
                        var totalBmbCount = addResponse(0, response.insertBmbCount);
                        var totalBomCount = addResponse(response.updateItemBomCount, response.insertItemBomCount);
                        $scope.showInfo(item.tiptopDb + '：ERP同步到TIPTOP_BMB_FILE，共 ' + totalBmbCount + '笔数据同步成功!\n TIPTOP_BMB_FILE 同步到 bom，共 ' + totalBomCount + '笔数据同步成功!');

                    }).error(function (data) {
                        $scope.logining = false;
                        $scope.showError(data.message);
                    });

                    promises.push(result);
                }
                if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_CHAN_PRICE2.name) {
                    //渠道销售价格、仓库、库位、销售单位同步
                    var result = IoneAdapterService.transferIoneAdapter("/chanImaTask", param, $scope, function (response) {
                        var totalChanImaCount = addResponse(response.updateChanImaCount, response.insertChanImaCount);
                        var totalPlmCount = addResponse(response.updatePlmCount, response.insertPlmCount);
                        $scope.showInfo(item.tiptopDb + '：ERP同步到tiptop_chan_ima_file，共 ' + totalChanImaCount + '笔数据同步成功!\n tiptop_chan_ima_file 同步到 plm，共 ' + totalPlmCount + '笔数据同步成功!');
                    }).error(function (data) {
                        $scope.logining = false;
                        $scope.showError(data.message);
                    });

                    promises.push(result);

                }

                if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_BOM.name) {
                    //渠道销售价格、仓库、库位、销售单位同步
                    var result = IoneAdapterService.transferIoneAdapter("/imaBrandTask", param, $scope, function (response) {
                        var totalTtBrandCount = addResponse(response.updateTtBrandCount, response.insertTtBrandCount);
                        var totalItemScopeCount = addResponse(response.updateItemScopeCount, response.insertItemScopeCount);
                        var totalImaBrandCount = addResponse(0, response.insertImaBrandCount);
                        var totalItemCustomDetailCount = addResponse(response.updateItemCustomDetailCount, response.insertItemCustomDetailCount);
                        $scope.showInfo(item.tiptopDb + '：ERP同步到 TIPTOP_BRAND_FILE，共 ' + totalTtBrandCount + '笔数据同步成功!\n TIPTOP_BRAND_FILE 同步到 PLM_BASE_CUSTOM_SCOPE，共 ' + totalItemScopeCount + '笔数据同步成功!');
                        $scope.showInfo(item.tiptopDb + '：ERP同步到 TIPTOP_IMA_BRAND_FILE，共 ' + totalImaBrandCount + '笔数据同步成功!\n TIPTOP_IMA_BRAND_FILE 同步到 PLM_BASE_CUSTOM_DTL_FILE，共 ' + totalItemCustomDetailCount + '笔数据同步成功!');
                    }).error(function (data) {
                        $scope.logining = false;
                        $scope.showError(data.message);
                    });

                    promises.push(result);

                }

            });


            $q.all(promises).then(function () {
                $scope.logining = false;
                $scope.syncingDb = "";

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


        if ($scope.selected.length <= 0) {
            $scope.showError('请选择TIPTOP DB!');
            isPass = false;
        }

        return isPass;
    };

    function addResponse(insertCount, updateCount) {
        var result = 0;

        if (!angular.isUndefined(insertCount)) {
            result = result + insertCount;
        }
        if (!angular.isUndefined(updateCount)) {
            result = result + updateCount;
        }

        return result;

    }

});