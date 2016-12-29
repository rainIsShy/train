angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/sale-order-return', {
        controller: 'SaleOrderReturnController',
        templateUrl: 'app/src/app/order/sale_return/saleReturnList.html'
    })
}]);

angular.module('IOne-Production').controller('SaleOrderReturnController', function ($scope, $q, PsoOrderReturnMaster, PsoOrderReturnDetail, PsoOrderReturnExtendDetail, IoneAdapterService, Constant, $mdDialog) {
    $scope.selectedItemSize = 0;
    $scope.selectedItemAmount = 0;
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
            transferPsoFlag: Constant.TRANSFER_PSO_FLAG[0].value
        }
    };

    $scope.menuDisplayOption = {
        'confirm': {display: true, name: '审核', uuid: '67cf38f3-7f72-4395-af39-ba4eac8c9944'},
        'revertConfirm': {display: true, name: '取审', uuid: '6f3f8055-1064-4705-8cd9-dc003188352e'},
        'transfer': {display: true, name: '抛转', uuid: 'da09a9b1-18b4-483f-908f-c93c26d3ec73'},
        'batchConfirm': {display: true, name: '批量审核', uuid: 'd9ae13e0-aaf6-4775-a995-837bd3ac7be0'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: 'c986aba8-48eb-4975-b22f-8540e85599c8'},
        'batchTransfer': {display: true, name: '批量拋转', uuid: 'dbfdef83-c0cd-46c5-ad97-debc6b5bd7c1'},
        'detailConfirm': {display: true, name: '审核', uuid: 'b216d2ee-d6ee-4d71-bb66-496249721b6a'},
        'detailRevertConfirm': {display: true, name: '取审', uuid: '9a71e99f-976e-4dca-8c2e-8e75b88f0a37'},
        'detailTransfer': {display: true, name: '抛转', uuid: '8fb85cea-8acd-4c57-8777-57107b502ddc'},
        'detail2Confirm': {display: true, name: '审核', uuid: '3778eacc-323c-4363-bc4e-f9710aaef0cb'},
        'detail2RevertConfirm': {display: true, name: '取审', uuid: 'e02ca1e7-0a89-42fd-b762-5c1fa2f4bbb7'},
        'detail2Transfer': {display: true, name: '抛转', uuid: 'efe0f528-bc80-40b7-b34f-7170ce55a4db'}
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        PsoOrderReturnMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            // show all return details
            angular.forEach($scope.itemList, function (item) {
                item.selectAllDetails = false;
                item.showMorePanel = true;
                $scope.attachDetailList(item);
            });
        }).error(function (response) {
            $scope.showError(response.message);
        });
        $scope.disableBatchMenuButtons();
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.ORDER_RETURN.RES_UUID).success(function (data) {
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

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        item.selectAllDetails = false;
        $scope.selectedItem = item;
        PsoOrderReturnDetail.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem.detailList = data.content;
            $scope.refreshExtendDetailTab($scope.selectedItem);
        }).error(function (response) {
            $scope.showError(response.message);
        });
        $scope.disableDetailMenuButtons();
    };

    /**
     * Show more panel when clicking the 'show more' on every item
     */
    $scope.toggleMorePanelAction = function (item) {
        item.showMorePanel = !item.showMorePanel;
    };

    /**
     * Select all details.
     */
    $scope.selectAllDetails = function (item) {
        angular.forEach(item.detailList, function (detail) {
            if (item.selectAllDetails) {
                detail.selected = true;
            } else {
                detail.selected = false;
            }
            detail.selectedRef = detail.selected;
        });
        $scope.disableDetailMenuButtons();
    };

    $scope.selectDetailItemAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        detail.selectedRef = !detail.selected;
        $scope.disableDetailMenuButtons();
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
    $scope.attachDetailList = function (item) {
        item.showMorePanel = !item.showMorePanel;
        PsoOrderReturnDetail.get(item.uuid).success(function (data) {
            item.detailList = data.content;
            $scope.updateMasterStateByReturnDetails(item); //根据退货单身计算总价、审核状态，抛转状态
        })/*.error(function (response) {
         $scope.showError(response.message);
         })*/;
    };

    /**
     * Change status to list all items
     */
    $scope.listItemAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        item.selectedRef = !item.selected;

        if (item.selected == false
            || item.selected == undefined
            || item.selected == null) {
            $scope.selectedItemSize += 1;
            $scope.selectedItemAmount += item.returnAmount;
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectedItemAmount -= item.returnAmount;
            $scope.selectAllFlag = false;
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.confirmAllClickAction = function (event, confirmVal) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }

        var action = confirmVal == 1 ? "取消审核" : "审核";
        $scope.showConfirm('确认' + action + '吗', '', function () {
            var detailUuids = '';
            var hasSelectedItems = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var hasDetail = false;
                    hasSelectedItems = true;
                    angular.forEach(item.detailList, function (detail) {
                        if (detail.confirm != confirmVal) {
                            if (confirmVal != 1 || detail.transferReturnFlag != 1) { // 已抛转不能取消审核
                                detailUuids += (detailUuids ? ',' : '') + detail.uuid;
                                hasDetail = true;
                            }
                        }
                    });
                    if (!hasDetail) {
                        $scope.showWarn("产品销售退货单" + item.no + "没有可" + action + "的商品！");
                    }
                }
            });

            if (hasSelectedItems) {
                PsoOrderReturnDetail.confirm('batch', detailUuids, confirmVal).success(function (data) {
                    angular.forEach($scope.itemList, function (item) {
                        if (item.selected) {
                            $scope.updateDetailsConfirmState(item.detailList, data);
                            $scope.updateMasterStateByReturnDetails(item);
                        }
                    });
                    $scope.disableBatchMenuButtons();
                    $scope.getReturnOrderMasterCount();
                    $scope.showInfo('产品销售退货单' + action + '成功！');
                }).error(function (response) {
                    $scope.showError('产品销售退货单' + action + '失败：' + response.message);
                });
            } else {
                $scope.showWarn("请选择需要" + action + "的产品销售退货单！");
            }
        });
    };

    $scope.confirmClickAction = function (event, item, confirmVal, bApplyAll) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        var action = confirmVal == 1 ? "取消审核" : "审核";
        $scope.showConfirm('确认' + action + '吗？', '', function () {
            var detailUuids = "";
            angular.forEach(item.detailList, function (detail) {
                if (bApplyAll) {
                    if (detail.confirm != confirmVal) {
                        if (!(confirmVal == 1 && detail.transferReturnFlag == '1')) { //已抛转不能取消审核
                            detailUuids += detail.uuid + ",";
                        }
                    }
                } else {
                    if (detail.confirm != confirmVal && detail.selected == true) {
                        if (!(confirmVal == 1 && detail.transferReturnFlag == '1')) { //已抛转不能取消审核
                            detailUuids += detail.uuid + ",";
                        }
                    }
                }
            });

            if (detailUuids) {
                PsoOrderReturnDetail.confirm(item.uuid, detailUuids, confirmVal).success(function (data) {
                    $scope.updateDetailsConfirmState(item.detailList, data);
                    $scope.updateMasterStateByReturnDetails(item);
                    $scope.showInfo('产品销售退货单' + action + '成功！');
                    $scope.disableBatchMenuButtons();
                    $scope.disableDetailMenuButtons();
                    $scope.getReturnOrderMasterCount();
                }).error(function (response) {
                    $scope.showError('产品销售退货单' + item.no + response.message);
                });
            } else {
                $scope.showWarn("请选择需要" + action + "的商品！");
            }
        });
    };

    $scope.confirmDetailClickAction = function (event, item, confirmVal, detail) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');
        var action = "审核";
        if (confirmVal == 1) {
            action = "取消审核";
        }

        $scope.showConfirm('确认' + action + '吗？', '', function () {
            PsoOrderReturnDetail.confirm(item.uuid, detail.uuid, confirmVal).success(function (data) {
                detail.confirm = confirmVal;
                $scope.updateMasterStateByReturnDetails(item);
                $scope.disableBatchMenuButtons();
                $scope.disableDetailMenuButtons();
                $scope.showInfo('产品销售退货单' + action + '成功！');
                $scope.getReturnOrderMasterCount();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.updateDetailsConfirmState = function (details, responseDetails) {
        angular.forEach(details, function (detail) {
            angular.forEach(responseDetails, function (responseDetail) {
                if (detail.uuid == responseDetail.uuid) {
                    detail.confirm = responseDetail.confirm;
                    detail.transferReturnFlag = responseDetail.transferReturnFlag;
                }
            });
        });
    };

    $scope.transferAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }

        $scope.showConfirm('确认抛转吗?', '', function () {
            var detailUuids = '';
            var hasSelectedItems = false, hasDetail = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    hasSelectedItems = true;
                    hasDetail = false;
                    angular.forEach(item.detailList, function (detail) {
                        if (detail.confirm == '2' && detail.transferReturnFlag != '1') {
                            detailUuids += (detailUuids ? ',' : '') + detail.uuid;
                            hasDetail = true;
                        }
                    });
                    if (!hasDetail) {
                        $scope.showWarn("产品销售退货单" + item.no + "没有可抛转的商品！");
                    }
                }
            });
            if (hasSelectedItems) {
                PsoOrderReturnDetail.transfer('batch', detailUuids).success(function (data) {
                    angular.forEach($scope.itemList, function (item) {
                        if (item.selected) {
                            $scope.updateDetailsConfirmState(item.detailList, data);
                            $scope.updateMasterStateByReturnDetails(item);
                        }
                    });
                    $scope.disableBatchMenuButtons();
                    $scope.getReturnOrderMasterCount();
                    $scope.showInfo('产品销售退货单抛转成功！');
                }).error(function (response) {
                    $scope.showError('产品销售退货单抛转失败：' + response.message);
                });
            } else {
                $scope.showWarn("请选择需要抛转的产品销售退货单！");
            }
        });
    };

    $scope.transferClickAction = function (event, item, bApplyAll) {
        $scope.stopEventPropagation(event);
        console.info('transfer...');

        $scope.showConfirm('确认抛转吗？', '', function () {
            var detailUuids = "";
            angular.forEach(item.detailList, function (detail) {
                if (bApplyAll === true) {
                    if (detail.confirm == '2' && detail.transferReturnFlag != '1') {
                        detailUuids += detail.uuid + ",";
                    }
                } else {
                    if (detail.confirm == '2' && detail.transferReturnFlag != '1' && detail.selected == true) {
                        detailUuids += detail.uuid + ",";
                    }
                }
            });

            if (detailUuids != "") {
                PsoOrderReturnDetail.transfer(item.uuid, detailUuids).success(function (data) {
                    $scope.resetDetailCheckBoxes(item);
                    $scope.updateDetailsConfirmState(item.detailList, data);
                    $scope.updateMasterStateByReturnDetails(item);
                    $scope.disableBatchMenuButtons();
                    $scope.disableDetailMenuButtons();
                    $scope.showInfo('产品销售退货单抛转成功！');
                    $scope.getReturnOrderMasterCount();
                }).error(function (response) {
                    $scope.showError('产品销售退货单' + item.no + response.message);
                });
            } else {
                $scope.showWarn("没有可抛转的商品！");
            }
        });
    };

    $scope.transferDetailClickAction = function (event, item, detail) {
        $scope.stopEventPropagation(event);
        console.info('transfer...');

        $scope.showConfirm('确认抛转吗？', '', function () {
            PsoOrderReturnDetail.transfer(item.uuid, detail.uuid).success(function (data) {
                detail.transferReturnFlag = '1';
                detail.selected = false;
                $scope.updateMasterStateByReturnDetails(item);
                $scope.disableBatchMenuButtons();
                $scope.disableDetailMenuButtons();
                $scope.showInfo('产品销售退货单抛转成功！');
                $scope.getReturnOrderMasterCount();
            }).error(function (response) {
                $scope.showError(response.message);
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
                $scope.selectedItemAmount += item.returnAmount;
            })
        }
        $scope.disableBatchMenuButtons();
    };
    //$scope.selectAllAction();

    $scope.updateMasterStateByReturnDetails = function (item) {
        var confirm = Constant.CONFIRM[2].value;
        var transferPsoFlag = Constant.TRANSFER_PSO_FLAG[1].value;
        var returnAmount = 0;
        angular.forEach(item.detailList, function (detail) {
            if (detail.confirm == Constant.CONFIRM[1].value) {
                confirm = detail.confirm;
            }
            if (detail.transferReturnFlag == Constant.TRANSFER_PSO_FLAG[2].value) {
                transferPsoFlag = detail.transferReturnFlag;
            }
            returnAmount += detail.originalReturnAmount;
        });
        item.confirm = confirm;
        item.transferPsoFlag = transferPsoFlag;
        item.returnAmount = returnAmount;
    };

    /*************************************/
    // Get all extend details.
    $scope.refreshExtendDetailTab = function (selectedItem) {
        var byNo = function () {
            return function (ext1, ext2) {
                var no1, no2;
                if (typeof ext1 === "object" && typeof ext2 === "object" && ext1 && ext2) {
                    no1 = ext1.no;
                    no2 = ext2.no;
                    if (no1 === no2) {
                        return 0;
                    }
                    if (typeof no1 === typeof no2) {
                        return no1 < no2 ? -1 : 1;
                    }
                    return typeof no1 < typeof no2 ? -1 : 1;
                }
            }
        };

        $scope.selectedItem.extendDetailList = [];
        angular.forEach($scope.selectedItem.detailList, function (orderDetail, index) {
            orderDetail.selected = false;
            PsoOrderReturnExtendDetail.get(selectedItem.uuid, orderDetail.uuid).success(function (data) {
                if (data.totalElements > 0) {
                    $scope.selectedItem.extendDetailList = $scope.selectedItem.extendDetailList.concat(data.content).sort(byNo());
                }
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.disableBatchMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var transfer = '';
        var diffConfirm = false;
        var diffTransfer = false;
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

            if (diffTransfer == true) {
                $scope.disabledBatchTransfer = true;
            } else if (transfer == '1') {
                $scope.disabledBatchTransfer = true;
            } else {
                $scope.disabledBatchTransfer = false;
            }
        }
    };

    $scope.resetDetailCheckBoxes = function (item) {
        item.selectAllDetails = false;
        angular.forEach(item.detailList, function (detail) {
            detail.selected = false;
        });
    };

    $scope.disableDetailMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var transfer = '';
        var diffConfirm = false;
        var diffTransfer = false;
        if ($scope.selectedItem != null) {
            angular.forEach($scope.selectedItem.detailList, function (detail, index) {
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
                    if (transfer == '') {
                        transfer = detail.transferReturnFlag;
                    } else {
                        if (transfer != detail.transferReturnFlag) {
                            diffTransfer = true;
                        }
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
            } else if (transfer == '1') {
                $scope.disabledDetailTransfer = true;
            } else {
                $scope.disabledDetailTransfer = $scope.disabledDetailCancelConfirm;
            }
        }
    };

    $scope.getReturnOrderMasterCount = function () {
        PsoOrderReturnMaster.getReturnOrderMasterCount(Constant.CONFIRM[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER_RETURN.RES_UUID).success(function (data) {
            $scope.menuList[1].subList[7].suffix = data;
        });
    }

    $scope.transferExtDtlClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认抛转吗？', '', function () {
            var param = {
                PSO_ORDER_MST_UUID: item.uuid
            };
            IoneAdapterService.transferIoneAdapter("/psoReturnTask", param, $scope, function (response) {
                $scope.showInfo('共 ' + response.insertCount + ' 笔退货抛转成功!\n');
                //$scope.showInfo('共 ' + response.insertCount + ' 笔退货抛转成功!\n'+'更新抛转状态'+ response.updateCount + '笔');
                $scope.logining = false;
            }).error(function (errResp) {
                $scope.logining = false;
                $scope.showError(errResp.message);
            });
        });
    };
});