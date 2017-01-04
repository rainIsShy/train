angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/return-sales-orders', {
        controller: 'PSOReturnSalesOrdersController',
        templateUrl: 'app/src/app/order/return_sales_orders/returnSalesOrders.html'
    })
}]);

angular.module('IOne-Production').controller('PSOReturnSalesOrdersController', function ($scope, PSOReturnSalesOrdersMasterService, PSOReturnSalesOrdersExtends2Service, Constant) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        select: {
            status: Constant.STATUS[0].value,
            confirm: Constant.AUDIT[0].value,
            transferPsoFlag: Constant.TRANSFER_PSO_FLAG[0].value,
            returnSalesOrderExtendDetailConfirm: Constant.AUDIT[0].value,
            returnSalesOrderExtendDetailTransferFlag: Constant.TRANSFER_PSO_FLAG[0].value,
            startOrderDate: '',
            endOrderDate: '',
            channelUuid: ''
        },
        no: '',
        employeeName: '',
        customerName: ''
    };

    $scope.menuDisplayOption = {
        'confirm': {display: true, name: '审核', uuid: 'd66f6b86-2c0d-45b5-bef5-042f7810d89a'},
        'revertConfirm': {display: true, name: '取审', uuid: 'd6edbc0b-fe4c-4762-aeef-ea2891a0c85b'},
        'transfer': {display: true, name: '抛转', uuid: '1406d065-dcbd-488b-96fb-c06ccb744147'},
        'batchConfirm': {display: true, name: '批量审核', uuid: 'dc2117f6-758e-4012-a79a-c1b33cbc4b76'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: 'd87e0dd0-7a30-4656-9aac-303aaf237c7c'},
        'batchTransfer': {display: true, name: '批量拋转', uuid: '1a938c46-396a-404d-938d-227e847afa17'},
        'detailConfirm': {display: true, name: '审核', uuid: '5f7cfaa8-4a15-4a06-9a60-b5ff547a61a2'},
        'detailRevertConfirm': {display: true, name: '取审', uuid: '670abcd7-b800-4f03-b7f6-4fd483d8efd0'},
        'detailTransfer': {display: true, name: '抛转', uuid: '860a0c43-b13c-476a-a419-33fe75dbcef0'},
        'detail2Confirm': {display: true, name: '审核', uuid: '145a50fe-1cc6-4db4-87dd-9a58f63100b2'},
        'detail2RevertConfirm': {display: true, name: '取审', uuid: '88a04a0a-e3fb-487f-8506-6f43ad47a5c4'},
        'detail2Transfer': {display: true, name: '抛转', uuid: '7ddbda9a-1a7e-4751-ac98-51e41c029519'}
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        var filterOptions = {
            orderMasterNo: $scope.listFilterOption.no,
            returnSalesOrderExtendDetailConfirm: $scope.listFilterOption.select.returnSalesOrderExtendDetailConfirm,
            returnSalesOrderExtendDetailTransferFlag: $scope.listFilterOption.select.returnSalesOrderExtendDetailTransferFlag,
            orderDateBegin: $scope.listFilterOption.select.startOrderDate,
            orderDateEnd: $scope.listFilterOption.select.endOrderDate,
            channelUuid: $scope.listFilterOption.select.channelUuid,
            allNames: $scope.listFilterOption.customerName,
            onlyReturn: '1'
        };
        PSOReturnSalesOrdersMasterService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, filterOptions, $scope.RES_UUID_MAP.PSO.SO_RETURN.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.selectAllFlag = false;
            $scope.selectedItemSize = 0;
            $scope.selectedItemAmount = 0;
            $scope.selectedItemReturnAmount = 0;
            //get details
            angular.forEach($scope.itemList, function (item) {
                PSOReturnSalesOrdersExtends2Service.getAll(item.uuid).success(function (data) {
                    item.detailList = data.content;
                    item.selectAllDetails = false;
                    $scope.updateMasterStateByReturnDetails(item);
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            });
        }).error(function (response) {
            $scope.showError(response.message);
        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.SO_RETURN.RES_UUID).success(function (data) {
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

    $scope.queryClick = function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    };

    $scope.selectAllFlag = false;
    $scope.selectedItemSize = 0;
    $scope.selectedItemAmount = 0;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.selectedItem.extendDetailList = [];
        $scope.selectedItem.selectAllDetails = false;

        $scope.displayAdvancedSearPanel = false;
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
    };

    $scope.setDetailsBgColor = function (detailList) {
        angular.forEach(detailList, function (detail) {
            detail.bgColor = {'background-color': '#FFAEB9;'};//red
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
        //新增返回清单时刷新清单
        if ($scope.status == 'add') {
            $scope.refreshList();
        }
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
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {
        //TODO ...
    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        //TODO ...
        item.selectedRef = !item.selected;

        if (item.selected == false
            || item.selected == undefined
            || item.selected == null) {
            $scope.selectedItemSize += 1;
            $scope.selectedItemAmount += item.originalOrderAmount;
            $scope.selectedItemReturnAmount += item.returnAmount;
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectedItemAmount -= item.originalOrderAmount;
            $scope.selectedItemReturnAmount -= item.returnAmount;
            $scope.selectAllFlag = false;
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.confirmClickAction = function (event, item, confirmVal, bApplyAll) {
        $scope.stopEventPropagation(event);

        var action = confirmVal != 1 ? "审核" : "取消审核";
        $scope.showConfirm('确认' + action + '吗？', '', function () {
            var detailUuids = [];
            angular.forEach(item.detailList, function (detail) {
                if (detail.confirm != confirmVal && (bApplyAll || detail.selected)) {
                    detailUuids.push(detail.uuid);
                }
            });
            //console.info(detailUuids);
            if (detailUuids.length) {
                PSOReturnSalesOrdersExtends2Service.confirm(item.uuid, detailUuids, confirmVal).success(function (data) {
                    $scope.updateDetailsConfirmState(item.detailList, data);
                    $scope.updateMasterStateByReturnDetails(item);
                    $scope.showInfo('预订单退货单' + action + '成功！');
                    $scope.disableBatchMenuButtons();
                    $scope.disableDetailMenuButtons();
                    $scope.getReturnOrderMasterCount();
                }).error(function (response) {
                    $scope.showError('预订单退货单' + item.no + response.message);
                });
            } else {
                $scope.showWarn("请选择需要" + action + "的商品！");
            }
        });
    };

    $scope.confirmAllClickAction = function (event, confirmVal) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }

        var action = confirmVal != 1 ? "审核" : "取消审核";
        $scope.showConfirm('确认' + action + '吗', '', function () {
            var detailUuids = [];
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    angular.forEach(item.detailList, function (detail) {
                        if (detail.confirm != confirmVal) {
                            detailUuids.push(detail.uuid);
                        }
                    });

                }
            });
            if (detailUuids.length) {
                PSOReturnSalesOrdersExtends2Service.confirm('_batch', detailUuids, confirmVal).success(function (data) {
                    angular.forEach($scope.itemList, function (item) {
                        if (item.selected) {
                            $scope.updateDetailsConfirmState(item.detailList, data);
                            $scope.updateMasterStateByReturnDetails(item);
                        }
                    });

                    $scope.getReturnOrderMasterCount();
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('预订单退货单' + action + '成功！');
                }).error(function (response) {
                    $scope.showError('预订单退货单' + item.no + action + '失败：' + response.message);
                });
            } else {
                $scope.showWarn("请选择需要" + action + "的预订单退货单！");
            }
        });
    };

    $scope.confirmDetailClickAction = function (event, item, confirmVal, detail) {
        $scope.stopEventPropagation(event);
        var action = confirmVal != 1 ? "审核" : "取消审核";

        $scope.showConfirm('确认' + action + '吗？', '', function () {
            PSOReturnSalesOrdersExtends2Service.confirm(item.uuid, [ detail.uuid ], confirmVal).success(function () {
                detail.confirm = confirmVal;
                $scope.updateMasterStateByReturnDetails(item);
                $scope.disableBatchMenuButtons();
                $scope.disableDetailMenuButtons();
                $scope.showInfo('预订单退货单' + action + '成功！');
                $scope.getReturnOrderMasterCount();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.transferClickAction = function (event, item, bApplyAll) {
        $scope.stopEventPropagation(event);

        $scope.showConfirm('确认抛转吗？', '', function () {
            var detailUuids = [];
            angular.forEach(item.detailList, function (detail) {
                if (detail.transferFlag != '1' && (bApplyAll || detail.selected)) {
                    detailUuids.push(detail.uuid);
                }
            });

            if (detailUuids.length) {
                PSOReturnSalesOrdersExtends2Service.transfer(item.uuid, detailUuids).success(function () {
                    $scope.updateDetailsTransferState(item.detailList, detailUuids);
                    $scope.updateMasterStateByReturnDetails(item);
                    $scope.disableBatchMenuButtons();
                    $scope.disableDetailMenuButtons();
                    $scope.getReturnOrderMasterCount();
                    $scope.showInfo('预订单退货单抛转成功！');
                }).error(function (response) {
                    $scope.showError('预订单退货单抛转失败,状态:' + response.status + '<br>' + response.message);
                });
            } else {
                $scope.showWarn("请选择需要抛转的商品！");
            }
        });
    };

    $scope.transferAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }

        $scope.showConfirm('确认抛转吗?', '', function () {
            var detailUuids = [];
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    angular.forEach(item.detailList, function (detail) {
                        if (detail.transferFlag != '1') {
                            detailUuids.push(detail.uuid);
                        }
                    });
                }
            });
            if (detailUuids.length) {
                PSOReturnSalesOrdersExtends2Service.transfer('_batch', detailUuids).success(function () {
                    angular.forEach($scope.itemList, function (item) {
                        if (item.selected) {
                            $scope.updateDetailsTransferState(item.detailList, detailUuids);
                            $scope.updateMasterStateByReturnDetails(item);
                        }
                    });
                    $scope.getReturnOrderMasterCount();
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('预订单退货单抛转成功！');
                }).error(function (response) {
                    $scope.showError('预订单退货单批量抛转失败,状态:' + response.status + '<br>' + response.message);
                });
            } else {
                $scope.showWarn("请选择需要抛转的预订单退货单！");
            }
        });
    };

    $scope.transferDetailClickAction = function (event, item, detail) {
        $scope.stopEventPropagation(event);

        $scope.showConfirm('确认抛转吗？', '', function () {
            PSOReturnSalesOrdersExtends2Service.transfer(item.uuid, [ detail.uuid ]).success(function () {
                detail.transferFlag = '1';
                $scope.updateMasterStateByReturnDetails(item);
                $scope.disableBatchMenuButtons();
                $scope.disableDetailMenuButtons();
                $scope.showInfo('预订单退货单抛转成功！');
                $scope.getReturnOrderMasterCount();
            }).error(function () {
                $scope.showError('预订单退货单抛转失败');
            });
        });
    };

    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            item.selected = $scope.selectAllFlag;
            item.selectedRef = item.selected;
        });
        //ADD...
        $scope.selectedItemSize = 0;
        $scope.selectedItemAmount = 0;
        $scope.selectedItemReturnAmount = 0;
        if ($scope.selectAllFlag) {
            angular.forEach($scope.itemList, function (item) {
                $scope.selectedItemSize++;
                $scope.selectedItemAmount += item.originalOrderAmount;
                $scope.selectedItemReturnAmount += item.returnAmount;
            })
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.updateDetailsConfirmState = function (details, responseDetails) {
        angular.forEach(details, function (detail) {
            angular.forEach(responseDetails, function (responseDetail) {
                if (detail.uuid == responseDetail.uuid) {
                    detail.confirm = responseDetail.confirm;
                    detail.transferFlag = responseDetail.transferFlag;
                }
            });
        });
    };

    $scope.updateDetailsTransferState = function (details, transferredDetailUuids) {
        if (details && transferredDetailUuids) {
            angular.forEach(details, function (detail) {
                angular.forEach(transferredDetailUuids, function (detailUuid) {
                    if (detail.uuid == detailUuid) {
                        detail.transferFlag = Constant.TRANSFER_PSO_FLAG[1].value;
                    }
                });
            });
        }
    };

    $scope.updateMasterStateByReturnDetails = function (item) {
        var confirm = Constant.CONFIRM[2].value;
        var transferPsoFlag = Constant.TRANSFER_PSO_FLAG[1].value;
        var returnAmount = 0;
        var returnAmountTax = 0;
        angular.forEach(item.detailList, function (detail) {
            if (detail.confirm == Constant.CONFIRM[1].value) {
                confirm = detail.confirm;
            }
            //1:抛转;单身有未抛转的,整单单头就为未抛转
            if (detail.transferFlag == Constant.TRANSFER_PSO_FLAG[2].value || detail.transferFlag == '') {
                transferPsoFlag = detail.transferFlag;
            }
            returnAmount += detail.originalReturnOrderAmount;
            returnAmountTax += detail.originalReturnOrderAmountTax;
        });
        item.confirm = confirm;
        item.transferPsoFlag = transferPsoFlag;
        item.returnAmount = returnAmount;
        item.returnAmountTax = returnAmountTax;
    };

    $scope.selectAllDetails = function (item) {
        angular.forEach(item.detailList, function (detail) {
            detail.selected = item.selectAllDetails;
            detail.selectedRef = detail.selected;
        });
        $scope.disableDetailMenuButtons();
    };

    $scope.selectDetailItemAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        detail.selectedRef = !detail.selected;
        $scope.disableDetailMenuButtons();
    };

    $scope.disableBatchMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var transfer = '';
        var diffConfirm = false;
        var diffTransfer = false;
        angular.forEach($scope.itemList, function (item) {
            if (item.selectedRef) {
                selectedCount++;
                if (confirm == '') {
                    confirm = item.confirm;
                } else {
                    if (confirm != item.confirm) {
                        diffConfirm = true;
                    }
                }
                if (transfer == '') {
                    transfer = item.transferPsoFlag;
                } else {
                    if (transfer != item.transferPsoFlag) {
                        diffTransfer = true;
                    }
                }
            }
        });

        if (selectedCount == 0) {
            $scope.disabledBatchConfirm = true;
            $scope.disabledBatchCancelConfirm = true;
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

            if (diffTransfer == true || diffConfirm == true) {
                $scope.disabledBatchTransfer = true;
            } else $scope.disabledBatchTransfer = (transfer == '1' || confirm == '1');
        }
    };

    $scope.disableDetailMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var transfer = '';
        var diffConfirm = false;
        var diffTransfer = false;
        if ($scope.selectedItem != null) {
            angular.forEach($scope.selectedItem.detailList, function (detail) {
                //alert(detail.selectedRef);
                if (detail.selectedRef) {
                    selectedCount++;
                    if (confirm == '') {
                        confirm = detail.confirm;
                    } else {
                        if (confirm != detail.confirm) {
                            diffConfirm = true;
                        }
                    }
                    if (!transfer) {
                        transfer = detail.transferFlag;
                    } else if (transfer != detail.transferFlag) {
                        diffTransfer = true;
                    }
                }
            });
        }

        if (selectedCount == 0) {
            $scope.disabledDetailConfirm = true;
            $scope.disabledDetailCancelConfirm = true;
            $scope.disabledDetailTransfer = true;
        } else {
            if (diffConfirm == true) {
                $scope.disabledDetailConfirm = true;
                $scope.disabledDetailCancelConfirm = true;
            } else if (confirm == '2') {
                $scope.disabledDetailConfirm = true;
                $scope.disabledDetailCancelConfirm = false;
            } else {
                $scope.disabledDetailConfirm = false;
                $scope.disabledDetailCancelConfirm = true;
            }

            if (diffTransfer == true) {
                $scope.disabledDetailTransfer = true;
            } else $scope.disabledDetailTransfer = (transfer == '1' || confirm == '1');
        }
    };

    $scope.openChannelDlg = function () {
        $mdDialog.show({
            controller: 'selectChannelController',
            templateUrl: 'app/src/app/order/receipts/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.listFilterOption.select.channelUuid = data.uuid;
            $scope.listFilterOption.select.channelName = data.name;
        });
    };

    $scope.clearChannel = function () {
        $scope.listFilterOption.select.channelUuid = '';
        $scope.listFilterOption.select.channelName = '';
    };

    $scope.getReturnOrderMasterCount = function () {
        PSOReturnSalesOrdersMasterService.getReturnOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO_RETURN.RES_UUID).success(function (data) {
            $scope.menuList[1].subList[8].suffix = data;
        });
    }
});
