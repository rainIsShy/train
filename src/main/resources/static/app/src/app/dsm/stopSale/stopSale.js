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
        PLM_ITEM_CHAN_PRICE2: {value: 'PLM_ITEM_CHAN_PRICE', name: '商品渠道信息同步'},
        PLM_ITEM_BOM: {value: 'PLM_ITEM_ITEM_FILE', name: '品牌信息同步'},
        PLM_ITEM_R: {value: 'PLM_ITEM_COL_FILE', name: '商品批号同步'},
        INV_INVENTORY_DTL: {value: 'INV_INVENTORY_DTL', name: '库存数据同步'},
        PSO_DELIVER_ORDER_EXT_DTL: {value: 'PSO_DELIVER_ORDER_EXT_DTL', name: '出货同步'},
        EPS_DELIVER_ORDER_EXT_DTL: {value: 'EPS_DELIVER_ORDER_EXT_DTL', name: '电商出货单同步'},
        OCM_BASE_CHAN_BRAND_R: {value: 'OCM_BASE_CHAN_BRAND_R', name: '渠道品牌关系同步'},
    };

    $scope.selected = [];
    $scope.selectAllFlag = false;

    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            item.selected = $scope.selectAllFlag;
        })
    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        var idx = $scope.selected.indexOf(item);
        if (idx > -1) {
            $scope.selected.splice(idx, 1);
        } else {
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
            $scope.logining = true;

            var param = {
                startTime: moment($scope.listFilterOption.startDate).format('YYYY-MM-DD'),
                START_DATE: moment($scope.listFilterOption.startDate).format('YYYY-MM-DD'),
                endTime: moment($scope.listFilterOption.endDate).format('YYYY-MM-DD'),
                END_DATE: moment($scope.listFilterOption.endDate).format('YYYY-MM-DD'),
                dbNames: []
            };
            angular.forEach($scope.selected, function (item) {
                param.dbNames.push(item.tiptopDb);

            });

            if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_CHAN_PRICE.name) {
                //同步停售
                IoneAdapterService.transferIoneAdapter("/tcDsbTask", param, $scope, function (response) {
                    var totalDsbCount = addResponse(response.updateDsbCount, response.insertDsbCount);
                    var totalPlmCount = addResponse(response.updatePlmCount, response.insertPlmCount);
                    $scope.showInfo('ERP同步到tiptop_tc_dsb_file，共 ' + totalDsbCount + '笔数据同步成功!\n tiptop_tc_dsb_file 同步到 plm，共 ' + totalPlmCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            } else if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_ITEM_FILE.name) {
                //同步商品
                IoneAdapterService.transferIoneAdapter("/tcImaTask", param, $scope, function (response) {
                    console.log(response);
                    var totalImaCount = addResponse(response.updateImaCount, response.insertImaCount);
                    var totalItemCount = addResponse(response.updateItemCount, response.insertItemCount);
                    $scope.showInfo('ERP同步到tiptop_tc_ima_file，共 ' + totalImaCount + '笔数据同步成功!\n tiptop_tc_ima_file 同步到 plm，共 ' + totalItemCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            } else if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_BOM_FILE.name) {
                //BOM同步
                IoneAdapterService.transferIoneAdapter("/bmbTask", param, $scope, function (response) {
                    var totalBmbCount = addResponse(0, response.insertBmbCount);
                    var totalBomCount = addResponse(response.updateItemBomCount, response.insertItemBomCount);
                    $scope.showInfo('ERP同步到TIPTOP_BMB_FILE，共 ' + totalBmbCount + '笔数据同步成功!\n TIPTOP_BMB_FILE 同步到 bom，共 ' + totalBomCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            } else if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_CHAN_PRICE2.name) {
                //渠道销售价格、仓库、库位、销售单位同步
                IoneAdapterService.transferIoneAdapter("/chanImaTask", param, $scope, function (response) {
                    var totalChanImaCount = addResponse(response.updateChanImaCount, response.insertChanImaCount);
                    var totalPlmCount = addResponse(response.updatePlmCount, response.insertPlmCount);
                    $scope.showInfo('ERP同步到tiptop_chan_ima_file，共 ' + totalChanImaCount + '笔数据同步成功!\n tiptop_chan_ima_file 同步到 plm，共 ' + totalPlmCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            } else if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_BOM.name) {
                //渠道销售价格、仓库、库位、销售单位同步
                IoneAdapterService.transferIoneAdapter("/imaBrandTask", param, $scope, function (response) {
                    var totalTtBrandCount = addResponse(response.updateTtBrandCount, response.insertTtBrandCount);
                    var totalItemScopeCount = addResponse(response.updateItemScopeCount, response.insertItemScopeCount);
                    var totalImaBrandCount = addResponse(0, response.insertImaBrandCount);
                    var totalItemCustomDetailCount = addResponse(response.updateItemCustomDetailCount, response.insertItemCustomDetailCount);
                    $scope.showInfo('ERP同步到 TIPTOP_BRAND_FILE，共 ' + totalTtBrandCount + '笔数据同步成功!\n TIPTOP_BRAND_FILE 同步到 PLM_BASE_CUSTOM_SCOPE，共 ' + totalItemScopeCount + '笔数据同步成功!');
                    $scope.showInfo('ERP同步到 TIPTOP_IMA_BRAND_FILE，共 ' + totalImaBrandCount + '笔数据同步成功!\n TIPTOP_IMA_BRAND_FILE 同步到 PLM_BASE_CUSTOM_DTL_FILE，共 ' + totalItemCustomDetailCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            } else if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PLM_ITEM_R.name) {
                //商品批号信息数据同步
                IoneAdapterService.transferIoneAdapter("/itemColTask", param, $scope, function (response) {
                    var totalTcDsaCount = addResponse(response.updateTcDsaCount, response.insertTcDsaCount);
                    var totalItemDsaCount = addResponse(0, response.insertItemDsaCount);
                    var totalItemColCount = addResponse(0, response.insertItemColCount);
                    var totalPlmBaseScopeCount = addResponse(response.updatePlmBaseScopeCount, response.insertPlmBaseScopeCount);
                    var totalPlmBaseCustomDtlFileCount = addResponse(response.updatePlmBaseCustomDtlFileCount, response.insertPlmBaseCustomDtlFileCount);
                    var totalPlmItemRCount = addResponse(response.updatePlmItemRCount, response.insertPlmItemRCount);
                    $scope.showInfo('ERP同步到 TIPTOP_TC_DSA_FILE，共 ' + totalTcDsaCount + '笔数据同步成功!\n TIPTOP_TC_DSA_FILE 同步到 PLM_BASE_CUSTOM_SCOPE，共 ' + totalPlmBaseScopeCount + '笔数据同步成功!');
                    $scope.showInfo('ERP同步到 TIPTOP_ITEM_DSA_FILE，共 ' + totalItemDsaCount + '笔数据同步成功!\n TIPTOP_ITEM_DSA_FILE 同步到 PLM_BASE_CUSTOM_DTL_FILE，共 ' + totalPlmBaseCustomDtlFileCount + '笔数据同步成功!');
                    $scope.showInfo('ERP同步到 TIPTOP_ITEM_COL_FILE，共 ' + totalItemColCount + '笔数据同步成功!\n TIPTOP_ITEM_COL_FILE 同步到 PLM_ITEM_R，共 ' + totalPlmItemRCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            } else if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.INV_INVENTORY_DTL.name) {
                // 庫存同步
                IoneAdapterService.transferIoneAdapter("/inventorySyncTask", param, $scope, function (response) {
                    var tmpCount = addResponse(response.updateImgCount, response.insertImgCount);
                    var invCount = addResponse(response.updateInvDtlCount, response.insertInvDtlCount);
                    $scope.showInfo('ERP同步到 TIPTOP_IMG_FILE，共 ' + tmpCount + '笔数据同步成功!\n TIPTOP_IMG_FILE 同步到 INV_INVENTORY_DTL，共 ' + invCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            } else if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.PSO_DELIVER_ORDER_EXT_DTL.name) {
                // 出货同步
                IoneAdapterService.transferIoneAdapter("/psoDeliverOrderSyncTask", param, $scope, function (response) {
                    var tmpCount = addResponse(response.updateOgbCount, response.insertOgbCount);
                    var orderExtCount = addResponse(response.updatePsoOrderExtDtlCount, response.insertPsoOrderExtDtlCount);
                    $scope.showInfo('ERP同步到 TIPTOP_OGB_FILE，共 ' + tmpCount + '笔数据同步成功!\n TIPTOP_OGB_FILE，共 ' + response.updateStatusCount + '笔数据失效!\n TIPTOP_OGB_FILE 同步到 PSO_DELIVER_ORDER_EXT_DTL，共 ' + orderExtCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            } else if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.EPS_DELIVER_ORDER_EXT_DTL.name) {
                // 电商出货单同步
                IoneAdapterService.transferIoneAdapter("/epsOgbTask", param, $scope, function (response) {
                    var totalEpsOgbCount = addResponse(response.updateEpsOgbCount, response.insertEpsOgbCount);
                    var totalEpsLogisticsDtlRCount = addResponse(response.updateEpsLogisticsDtlRCount, response.insertEpsLogisticsDtlRCount);
                    $scope.showInfo('ERP同步到 TIPTOP_EPS_OGB_FILE，共 ' + totalEpsOgbCount + '笔数据同步成功!\n TIPTOP_EPS_OGB_FILE 同步到 EPS_LOGISTICS_DTL_R，共 ' + totalEpsLogisticsDtlRCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            } else if ($scope.listFilterOption.syncType.name == $scope.TIPTOP_SYNC_TYPE.OCM_BASE_CHAN_BRAND_R.name) {
                // 电商出货单同步
                IoneAdapterService.transferIoneAdapter("/chanBrandTask", param, $scope, function (response) {
                    var totalTcChanBrandCount = addResponse(response.updateTcChanBrandCount, response.insertTcChanBrandCount);
                    var totalChanBrandRelationCount = addResponse(response.updateChannelBrandRelationCount, response.insertChannelBrandRelationCount);
                    $scope.showInfo('ERP同步到 TIPTOP_TC_CHAN_BRAND_FILE，共 ' + totalTcChanBrandCount + '笔数据同步成功!\n TIPTOP_TC_CHAN_BRAND_FILE 同步到 OCM_BASE_CHAN_BRAND_R，共 ' + totalChanBrandRelationCount + '笔数据同步成功!');
                    $scope.logining = false;
                }).error(function (errResp) {
                    $scope.logining = false;
                    $scope.showError(errResp.message);
                });
            }
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
            result += insertCount;
        }
        if (!angular.isUndefined(updateCount)) {
            result += updateCount;
        }

        return result;

    }

});