angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/alipay', {
        controller: 'AliPayController',
        templateUrl: 'app/src/app/taobao_data/alipay/alipay.html'
    })
}]);

angular.module('IOne-Production').controller('AliPayController', function ($scope, AliPayService, Constant, $mdDialog) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.TAOBAO_STATUS = Constant.TAOBAO_STATUS;

    $scope.listFilterOption = {
        orderStatus: Constant.TAOBAO_STATUS[0].value,
        confirm: Constant.CONFIRM[0].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        AliPayService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            $scope.disableBatchMenuButtons();
        });
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    //$scope.itemList = [];
    //
    //$scope.subItemList = [];

    $scope.selectAllFlag = false;

    $scope.selectedItemSize = 0;

    $scope.selectedItemAmount = 0;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        //JdTradeDetail1.get($scope.selectedItem.uuid).success(function (data) {
        //    $scope.subItemList = data.content;
        //    item.detailList = $scope.subItemList;
        //});

        $scope.displayAdvancedSearPanel = false;
    };

    /**
     * Show advanced search panel which you can add more search condition
     */
    $scope.showAdvancedSearchAction = function () {
        $scope.displayAdvancedSearPanel = !$scope.displayAdvancedSearPanel;
    };

    /**
     * Show more panel when clicking the 'show more' on every item
     */
    $scope.toggleMorePanelAction = function (item) {
        item.showMorePanel = !item.showMorePanel;

        if (item.showMorePanel) {
            //JdTradeDetail1.get(item.uuid).success(function (data) {
            //    $scope.subItemList = data.content;
            //    item.detailList = $scope.subItemList;
            //});
        }
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

    $scope.hideItemDetailsAction = function (event) {
        $scope.stopEventPropagation(event);
        $scope.selectedItem = null;
        $scope.refreshList();
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

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {
            if ($scope.domain == 'PSO_ORDER_MST') {
                //TODO add order mst
                console.info('add order mst...');
            } else if ($scope.domain == 'PSO_ORDER_DTL') {
                //TODO add order dtl
                console.info('add order dtl...');
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'PSO_ORDER_MST') {
                //TODO edit order mst
                console.info('edit order mst...');
            } else if ($scope.domain == 'PSO_ORDER_DTL') {
                //TODO edit order dtl
                console.info('edit order dtl...');
            }
        }
    };

    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {
        //TODO ...
    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        item.selectedRef = !item.selected;

        if (item.selected == false
            || item.selected == undefined
            || item.selected == null) {
            $scope.selectedItemSize += 1;
            if (item.totalAmount != null) {
                $scope.selectedItemAmount += item.totalAmount;
            }
        } else {
            $scope.selectedItemSize -= 1;
            if (item.totalAmount != null) {
                $scope.selectedItemAmount -= item.totalAmount;
            }
            $scope.selectAllFlag = false;
        }

        $scope.disableBatchMenuButtons();
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        if (item.confirm == Constant.CONFIRM[2].value) {
            $scope.showError("已成功审核并抛转的支付宝账款单不能再次审核，支付宝账款单号：" + item.tid);
            return false;
        }

        if (item.inOutType !== Constant.IN_OUT_TYPES['IN'].value) {
            $scope.showError("资金流入流程类型为'in'才能审核！");
            return false;
        }

        $scope.showConfirm('确认审核吗？', '', function () {
            AliPayService.confirm(item.uuid).success(function (response) {
                var failItemsTid = "";
                var success = false;
                angular.forEach(response, function (succeedItem) {
                    if (succeedItem.uuid == item.uuid) {
                        success = true;
                    }
                });
                if (success === true) {
                    item.confirm = Constant.CONFIRM[2].value;
                } else {
                    failItemsTid += (item.tid + ", ");
                }

                if (failItemsTid === "") {
                    $scope.showInfo('支付宝账款单审核成功！');
                } else {
                    $scope.showError('如下支付宝账款单审核失败：' + failItemsTid.substr(0, failItemsTid.length - 2));
                }

                $scope.disableBatchMenuButtons();
            }).error(function (response) {
                //$scope.showError($scope.getError(response.message));
                $scope.showError(response.message);
            });
        });
    };

    $scope.cancelConfirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        //if (item.confirm == Constant.CONFIRM[2].value) {
        //    $scope.showError("已成功审核并抛转的支付宝账款单不能取消审核，支付宝账款单号：" + item.orderId);
        //    return false;
        //}

        $scope.showConfirm('确认取消审核吗？', '', function () {
            AliPayService.cancelConfirm(item.uuid).success(function (data) {
                item.confirm = Constant.CONFIRM[1].value;

                $scope.disableBatchMenuButtons();
                $scope.showInfo('支付宝账款单取消审核成功！');
            }).error(function (response) {
                //$scope.showError($scope.getError(response.message));
                $scope.showError(response.message);
            });
        });
    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('status...');
        //TODO ...
    };

    $scope.releaseClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('release...');
        //TODO ...
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('delete...');
        //TODO ...
    };

    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('confirm all...');

        var uuids = "";
        var count = 0;
        var failUuids = "";
        var inOutTypeFailUUids = "";
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                uuids += (item.uuid + ",");
                count++;

                if (item.confirm == Constant.CONFIRM[2].value) {
                    failUuids += (item.tid + ", ");
                }

                if (item.inOutType !== Constant.IN_OUT_TYPES['IN'].value) {
                    inOutTypeFailUUids += (item.tid + ", ");
                }
            }
        });

        if (count === 0) {
            $scope.showError('没有选择任何支付宝账款单，请先选择支付宝账款单！');
            return;
        }
        if (failUuids !== "") {
            $scope.showError("已成功审核的支付宝账款单不能再次审核，支付宝账款单号：" + failUuids.substring(0, failUuids.length - 2));
            return false;
        }

        if (inOutTypeFailUUids !== "") {
            $scope.showError("资金流入流程类型为'in'才能审核，支付宝账款单号：" + inOutTypeFailUUids.substring(0, inOutTypeFailUUids.length - 2));
            return false;
        }

        $scope.showConfirm('确认审核吗？', '', function () {
            AliPayService.confirm(uuids).success(function (response) {
                var failItemsTid = "";
                angular.forEach($scope.itemList, function (item) {
                    if (item.selected === true) {
                        var success = false;
                        angular.forEach(response, function (succeedItem) {
                            if (succeedItem.uuid == item.uuid) {
                                success = true;
                            }
                        });
                        if (success === true) {
                            item.confirm = Constant.CONFIRM[2].value;
                        } else {
                            failItemsTid += (item.tid + ", ");
                        }
                    }
                });

                if (failItemsTid === "") {
                    $scope.showInfo('支付宝账款单审核成功！');
                } else {
                    $scope.showError('如下支付宝账款单审核失败：' + failItemsTid.substr(0, failItemsTid.length - 2));
                }

                $scope.disableBatchMenuButtons();

            }).error(function (response) {
                //$scope.showError($scope.getError(response.message));
                $scope.showError(response.message);
            });
        });
    };

    $scope.cancelConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('cancel confirm all...');

        var uuids = "";
        var count = 0;
        var failUuids = "";
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                uuids += (item.uuid + ",");
                count++;

                //if (item.confirm == Constant.CONFIRM[2].value) {
                //    failUuids += (item.orderId + ", ");
                //}
            }
        });

        if (count === 0) {
            $scope.showError('没有选择任何支付宝账款单，请先选择支付宝账款单！');
            return;
        }
        //if (failUuids !== "") {
        //    $scope.showError("已成功审核并抛转的支付宝账款单不能再次审核并抛转，支付宝账款单号：" + failUuids.substring(0, failUuids.length - 2));
        //    return false;
        //}

        $scope.showConfirm('确认取消审核吗？', '', function () {
            AliPayService.cancelConfirm(uuids).success(function (data) {
                angular.forEach(data, function (canceledItem) {
                    angular.forEach($scope.itemList, function (item) {
                        if (item.uuid == canceledItem.uuid) {
                            item.confirm = Constant.CONFIRM[1].value;
                        }
                    });
                });

                $scope.disableBatchMenuButtons();
                $scope.showInfo('支付宝账款单取消审核成功！');
            }).error(function (response) {
                //$scope.showError($scope.getError(response.message));
                $scope.showError(response.message);
            });
        });
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('status all...');
        //TODO ...
    };

    $scope.releaseAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('release all...');
        //TODO ...
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('delete all...');
        //TODO ...
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
                if (item.totalAmount != null) {
                    $scope.selectedItemAmount += item.totalAmount;
                }
            })
        }

        $scope.disableBatchMenuButtons();
    };

    //更新菜单按钮状态
    $scope.disableBatchMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var diffConfirm = false;
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
            }
        });

        if (selectedCount == 0) {
            $scope.disabledBatchConfirm = true;
            $scope.disabledBatchCancelConfirm = true;
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
        }
    };
});
