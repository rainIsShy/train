angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/o2o-order', {
        controller: 'EpsO2oOrderController',
        templateUrl: 'app/src/app/eps/o2o/order.html'
    })
}]);

angular.module('IOne-Production').controller('EpsO2oOrderController', function ($q, $scope, $mdDialog, EpsO2oOrderMaster, EpsO2oOrderDetail, EpsO2oOrderExtendDetail, Constant, SaleTypes, SysParameter) {
    $scope.CHECK_CONFIRMATION_PARAMETER_UUID = '32CDA8EE-C1CD-4A3D-83D2-718387F3F654'; //参数管控: 审核时是否检查O2O配送状态
    $scope.isCheckConfirmation = true;
    $scope.selectedItemSize = 0;
    $scope.selectedItemAmount = 0;
    $scope.O2O_EPS_ORDER_TYPE = Constant.O2O_EPS_ORDER_TYPE;
    $scope.EPS_ORDER_O2O_FLAG = Constant.EPS_ORDER_O2O_FLAG;
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        select: {
            status: Constant.STATUS[0].value,
            confirm: Constant.CONFIRM[0].value,
            transferPsoFlag: Constant.TRANSFER_PSO_FLAG[0].value,
            orderFlag: Constant.O2O_EPS_ORDER_TYPE[0].value
        },
        onlyLatest: "2"
    };

    $scope.menuDisplayOption = {
        'agreeDeliver': {display: true, name: '同意配送', uuid: '833A0120-8A06-4BE1-88D0-4D9F2CBBA9D7'},
        'rejectDeliver': {display: true, name: '拒绝配送', uuid: '37CBF07E-518E-4FAE-8FCF-A0C47720D719'},
        'batchAgreeDeliver': {display: true, name: '批量同意配送', uuid: '599CBAA2-36AA-4ED9-A09B-EFDD694AA481'},
        'batchRejectDeliver': {display: true, name: '批量拒绝配送', uuid: '0260A592-B204-4EB5-90E0-B94145BE7E77'}
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        EpsO2oOrderMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            //$scope.disableBatchMenuButtons();
        }).error(function (response) {
            $scope.showError(response.message);
        });

        SysParameter.get($scope.CHECK_CONFIRMATION_PARAMETER_UUID).success(function (data) {
            var sysParameter = data.content[0];
            if(sysParameter != null){
                if(sysParameter.status === Constant.STATUS[2].value){ //如果参数未启用，审核时不检查O2O配送状态
                    $scope.isCheckConfirmation = false;
                }
            }
        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.SO_CHANGE.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });

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

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.selectedItem.orderDate = new Date(item.orderDate);
        $scope.selectedItem.predictDeliverDate = new Date(item.predictDeliverDate);
        EpsO2oOrderDetail.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem.detailList = data.content;
        }).error(function (response) {
            $scope.showError(response.message);
        });
    };

    /**
     * Show advanced search panel which you can add more search condition
     */
    $scope.showAdvancedSearchAction = function () {
        $scope.displayAdvancedSearPanel = !$scope.displayAdvancedSearPanel;
        $scope.selectedItem = null;
    };

    /**
     * Show more panel when clicking the 'show more' on every item
     */
    $scope.toggleMorePanelAction = function (item) {
        item.showMorePanel = !item.showMorePanel;

        EpsO2oOrderDetail.get(item.uuid).success(function (data) {
            item.detailList = data.content;
            if (data.content.length === 0) {
                $scope.showWarn("未查找到对应的商品信息！");
            }
        }).error(function (response) {
            $scope.showError(response.message);
        });
    };

    /**
     * Toggle the advanced panel for detail item in the list
     */
    $scope.toggleDetailMorePanelAction = function (detail) {
        detail.showMorePanel = !detail.showMorePanel;
    };

    /**
     * Change status to list all items
     */
    $scope.listItemAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
    };

    /**
     * Set stauts to 'edit' to edit an object. The panel will be generated automatically.
     */
    $scope.editItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'edit';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
    };

    /**
     * Add new item which will take the ui to the edit page.
     */
    $scope.preAddItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'add';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        item.selectedRef = !item.selected;

        if (item.selected == false
            || item.selected == undefined
            || item.selected == null) {
            $scope.selectedItemSize += 1;
            $scope.selectedItemAmount += item.orderAmount;
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectedItemAmount -= item.orderAmount;
            $scope.selectAllFlag = false;
        }
        //$scope.disableBatchMenuButtons();
    };

    $scope.agreeDeliver = function (event, item) {
        if ($scope.isCheckConfirmation == true && item.o2oFlag !== '2') {
            $scope.showError(item.no + ' 操作失败，只有O2O配送状态为“2确认中”的单据可以做同意配送操作');
            return;
        }
        $scope.showConfirm('确认同意配送吗？', '', function () {
            EpsO2oOrderMaster.agreeDeliver(item.uuid).success(function () {
                $scope.showInfo('同意配送成功！');
                $scope.refreshList();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.rejectDeliver = function (event, item) {
        if ($scope.isCheckConfirmation == true && item.o2oFlag !== '2') {
            $scope.showError(item.no + ' 操作失败，只有O2O配送状态为“2确认中”的单据可以做拒绝配送操作');
            return;
        }
        $scope.showConfirm('确认拒绝配送吗？', '', function () {
            EpsO2oOrderMaster.rejectDeliver(item.uuid).success(function () {
                item.status = Constant.STATUS[1].value;
                $scope.showInfo('拒绝配送成功！');
                $scope.refreshList();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.agreeDeliverAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }

        var bError = false;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected) {
                if ($scope.isCheckConfirmation == true && item.o2oFlag !== '2') {
                    bError = true;
                    $scope.showError(item.no + ' 操作失败，只有O2O配送状态为“2确认中”的单据可以做同意配送操作');

                }
            }
        });
        if (bError) {
            return;
        }

        $scope.showConfirm('确认同意配送吗？', '', function () {
            var promises = [];
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = EpsO2oOrderMaster.agreeDeliver(item.uuid).success(function () {
                        //nothing to do
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 同意配送：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('同意配送成功！');
                }
                $scope.refreshList();
            });
        });
    };

    $scope.rejectDeliverAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }

        var bError = false;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected) {
                if ($scope.isCheckConfirmation == true && item.o2oFlag !== '2') {
                    bError = true;
                    $scope.showError(item.no + ' 操作失败，只有O2O配送状态为“2确认中”的单据可以做拒绝配送操作');

                }
            }
        });
        if (bError) {
            return;
        }

        $scope.showConfirm('确认拒绝配送吗？', '', function () {
            var promises = [];
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = EpsO2oOrderMaster.rejectDeliver(item.uuid).success(function () {
                        //nothing to do
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 拒绝配送：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('拒绝配送成功！');
                }
                $scope.refreshList();
            });
        });
    };

    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
            item.selectedRef = item.selected;
        });

        $scope.selectedItemSize = 0;
        $scope.selectedItemAmount = 0;
        if ($scope.selectAllFlag) {
            angular.forEach($scope.itemList, function (item) {
                $scope.selectedItemSize++;
                $scope.selectedItemAmount += item.orderAmount;
            })
        }
        $scope.disableBatchMenuButtons();
    };

    /*************************************/
    // Get all extend details.
    $scope.refreshExtendDetailTab = function (selectedItem) {
        $scope.selectedItem.extendDetailList = [];
        angular.forEach($scope.selectedItem.detailList, function (orderDetail, index) {
            EpsO2oOrderExtendDetail.getAll(selectedItem.uuid, orderDetail.uuid).success(function (data) {
                if (data.totalElements > 0) {
                    $scope.selectedItem.extendDetailList = $scope.selectedItem.extendDetailList.concat(data.content);
                }
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.disableBatchMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var status = '';
        var transferFlag = '';
        var diffConfirm = false;
        var diffStatus = false;
        var diffTransferFlag = false;
        angular.forEach($scope.itemList, function (item, index) {
            if (item.selectedRef) {
                selectedCount++;
                if (confirm == '') {
                    confirm = item.confirm;
                } else {
                    if (confirm != item.confirm) {
                        diffConfirm = true;
                    }
                }
                if (status == '') {
                    status = item.status;
                } else {
                    if (status != item.status) {
                        diffStatus = true;
                    }
                }
                if (transferFlag == '') {
                    transferFlag = item.transferPsoFlag;
                } else {
                    if (transferFlag != item.transferPsoFlag) {
                        diffTransferFlag = true;
                    }
                }
            }
        });

        if (selectedCount == 0) {
            $scope.disabledBatchConfirm = true;
            $scope.disabledBatchCancelConfirm = true;
            $scope.disabledBatchStatus = true;
            $scope.disabledBatchCancelStatus = true;
            $scope.disabledBatchTransfer = true;
        } else {
            if (diffConfirm == true) {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchCancelConfirm = true;
            } else if (confirm == '2') {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchCancelConfirm = false;
            } else {
                $scope.disabledBatchConfirm = false;
                $scope.disabledBatchCancelConfirm = true;
            }

            if (diffStatus == true) {
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = true;
            } else if (status == '1') {
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = false;
            } else {
                $scope.disabledBatchStatus = false;
                $scope.disabledBatchCancelStatus = true;
            }

            if (diffTransferFlag == true) {
                $scope.disabledBatchTransfer = true;
            } else if (transferFlag == '1') {
                $scope.disabledBatchTransfer = true;
            } else {
                $scope.disabledBatchTransfer = false;
            }
        }
    };

    $scope.updateOrderChangeDetailsConfirm = function (item) {
        if (item.detailList != null) {
            angular.forEach(item.detailList, function (detail) {
                detail.confirm = item.confirm;
            });
        }
    };
    $scope.updateOrderChangeDetailsTransfer = function (item) {
        if (item.detailList != null) {
            angular.forEach(item.detailList, function (detail) {
                detail.transferPsoFlag = item.transferPsoFlag;
            });
        }
    };

    $scope.openOrderDlg = function () {
        $mdDialog.show({
            controller: 'SelectEpsOrderController',
            templateUrl: 'app/src/app/eps/orderChange/selectOrderDlg.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            //$scope.selectedEpsOrder = data;
            $scope.selectedItem = data;
            $scope.selectedItem.orderDate = new Date(data.orderDate);
            $scope.selectedItem.predictDeliverDate = new Date(data.predictDeliverDate);
            $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
            $scope.status = 'add';
        });
    };

    SaleTypes.getAll().success(function (data) {
        $scope.saleTypes = data;
    });
});