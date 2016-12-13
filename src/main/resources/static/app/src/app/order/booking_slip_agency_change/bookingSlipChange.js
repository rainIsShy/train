angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/salesOrder-change', {
        controller: 'SalesOrderChangeController',
        templateUrl: 'app/src/app/order/booking_slip_agency_change/bookingSlipChange.html'
    })
}]);

angular.module('IOne-Production').controller('SalesOrderChangeController', function ($q, $scope, SalesOrderChangeMaster, SalesOrderChangeDetail, SalesOrderChangeExtendDetail, SalesOrderChangeExtendDetail2, Constant) {
    $scope.selectedItemSize = 0;
    $scope.selectedItemAmount = 0;
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        select:{
            status: Constant.STATUS[0].value,
            confirm: Constant.CONFIRM[0].value,
            transferPsoFlag: Constant.TRANSFER_PSO_FLAG[0].value
        },
        onlyLatest: "2"
    };

    $scope.menuDisplayOption = {
        'confirm': {display: true, name: '审核', uuid: '94b40025-f908-40e4-8237-26a816a837db'},
        'revertConfirm': {display: true, name: '取审', uuid: 'f1c87d92-2979-482b-8577-4a94410bd369'},
        'transfer': {display: true, name: '抛转', uuid: '66586826-5f8d-4645-8db7-7d11c9559887'},
        'batchConfirm': {display: true, name: '批量审核', uuid: '9fea08e7-1428-48f0-9c5d-0f65de3dfbaa'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: '07f4f819-ff6c-459b-9e9b-679a9491c30b'},
        'batchTransfer': {display: true, name: '批量拋转', uuid: '66d9553b-2ce6-4f5b-ba6a-78af9d613549'},
        'detailConfirm': {display: true, name: '审核', uuid: '4c4f7396-a8bd-4b15-8c93-7491c40e25ad'},
        'detailRevertConfirm': {display: true, name: '取审', uuid: '15b5713e-9234-4a07-8ce7-2aae0b8929b5'},
        'detailTransfer': {display: true, name: '抛转', uuid: 'd1da8e5d-504c-4dc5-95c8-b9e6834c17f4'}
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        SalesOrderChangeMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption, '-no,-changeVersion').success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.disableBatchMenuButtons();
        }).error(function (response) {
            $scope.showError(response.message);
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
        $scope.selectedItem = item;
        SalesOrderChangeDetail.get($scope.selectedItem.uuid).success(function (data) {
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

        SalesOrderChangeDetail.get(item.uuid).success(function (data) {
            item.detailList = data.content;
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
            $scope.selectedItemAmount += item.originalOrderAmount;
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectedItemAmount -= item.originalOrderAmount;
            $scope.selectAllFlag = false;
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.confirmClickAction = function (event, item, confirmVal) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        //$scope.showConfirm('审核后预定单的变更将会生效，确认审核吗？', '', function () {
        //    SalesOrderChangeMaster.confirm(item.uuid).success(function () {
        //        item.confirm = Constant.CONFIRM[2].value;
        //        $scope.showInfo('预定单变更审核成功！');
        //        $scope.disableBatchMenuButtons();
        //    }).error(function (response) {
        //        $scope.showError(response.message);
        //    });
        //});

        var action = "审核";
        var popMessage = "审核后变更将会生效，确认审核吗？";
        if (confirmVal == Constant.CONFIRM[1].value) {
            action = "取消审核";
            popMessage = "取消审核后预订单单将会回退到之前版本，确认取消审核吗？"
        }

        $scope.showConfirm(popMessage, '', function () {
            SalesOrderChangeMaster.confirm(item.uuid, confirmVal).success(function () {
                item.confirm = confirmVal;
                $scope.updateOrderChangeDetailsConfirm(item);
                $scope.showInfo('预订单变更单' + action + '成功！');
                $scope.disableBatchMenuButtons();
                $scope.getOrderMasterCount();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });

    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        $scope.showConfirm('确认启用吗？', '', function () {
            SalesOrderChangeMaster.modify(item.uuid, {'status': '1'}).success(function () {
                item.status = Constant.STATUS[1].value;
                $scope.showInfo('启用成功！');
                $scope.disableBatchMenuButtons();
                $scope.getOrderMasterCount();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.cancelStatusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        $scope.showConfirm('确认禁用吗？', '', function () {
            SalesOrderChangeMaster.modify(item.uuid, {'status': '2'}).success(function () {
                item.status = Constant.STATUS[2].value;
                $scope.showInfo('禁用成功！');
                $scope.disableBatchMenuButtons();
                $scope.getOrderMasterCount();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.transferClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('transfer...');

        $scope.showConfirm('确认抛转吗？', '', function () {
            var uuids = [];
            uuids.push(item.uuid);
            SalesOrderChangeMaster.transfer(uuids).success(function (response) {
                if (response && response[0].code != 0) {
                    $scope.showError('抛转失败：' + response[0].msg);
                } else {
                    item.transferFlag = Constant.TRANSFER_PSO_FLAG[1].value;
                    $scope.updateOrderChangeDetailsTransfer(item);
                    $scope.showInfo('预订单变更抛转成功！');
                    $scope.disableBatchMenuButtons();
                    $scope.getOrderMasterCount();
                }
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('delete...');
        //TODO ...
    };

    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认审核吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = SalesOrderChangeMaster.confirm(item.uuid, '2').success(function () {
                        item.confirm = '2';
                        $scope.updateOrderChangeDetailsConfirm(item);
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 审核失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('审核成功！');
                    $scope.getOrderMasterCount();
                }
                $scope.disableBatchMenuButtons();
            });
        });
    };

    $scope.cancelConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认取消审核吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = SalesOrderChangeMaster.confirm(item.uuid, '1').success(function () {
                        item.confirm = '1';
                        $scope.updateOrderChangeDetailsConfirm(item);
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 取消审核失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('取消审核成功！');
                    $scope.getOrderMasterCount();
                }
                $scope.disableBatchMenuButtons();
            });
        });
    };

    /*$scope.cancelConfirmAllClickAction = function (event) {
     $scope.stopEventPropagation(event);

     if ($scope.selectedItemSize == 0) {
     $scope.showWarn('请先选择记录！');
     return;
     }
     $scope.showConfirm('确认取消审核吗', '', function () {
     var promises = [];
     var bError = false;
     angular.forEach($scope.itemList, function (item) {
     if (item.selected) {
     var response = SalesOrderChangeMaster.modify(item.uuid, {'confirm': '1'}).success(function () {
     item.confirm = '1';
     }).error(function (response) {
     bError = true;
     $scope.showError(item.no + ' 取消审核失败：' + response.message);
     });
     promises.push(response);
     }
     });
     $q.all(promises).then(function (data) {
     if (!bError) {
     $scope.showInfo('取消审核成功！');
     }
     $scope.disableBatchMenuButtons();
     });
     });
     };*/

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认启用吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = SalesOrderChangeMaster.modify(item.uuid, {'status': '1'}).success(function () {
                        item.status = Constant.STATUS[1].value;
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 启用失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('启用成功！');
                    $scope.getOrderMasterCount();
                }
                $scope.disableBatchMenuButtons();
            });
        });
    };

    $scope.cancelStatusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认禁用吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = SalesOrderChangeMaster.modify(item.uuid, {'status': '2'}).success(function () {
                        item.status = Constant.STATUS[2].value;
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 禁用失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('禁用成功！');
                    $scope.getOrderMasterCount();
                }
                $scope.disableBatchMenuButtons();
            });
        });
    };

    $scope.transferAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认抛转吗', '', function () {
            var uuids = [];
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    uuids.push(item.uuid);
                }
            });

            var response = SalesOrderChangeMaster.transfer(uuids).success(function () {
                angular.forEach($scope.itemList, function (item) {
                    if (item.selected) {
                        item.transferFlag = Constant.TRANSFER_PSO_FLAG[1].value;
                        $scope.updateOrderChangeDetailsTransfer(item);
                    }
                });
                $scope.showInfo('抛转成功！');
                $scope.getOrderMasterCount();
            }).error(function (response) {
                $scope.showError(item.no + ' 抛转失败：' + response.message);
            });
        });
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
                $scope.selectedItemAmount += item.originalOrderAmount;
            })
        }
        $scope.disableBatchMenuButtons();
    };

    /*************************************/
    // Get all extend details.
    $scope.refreshExtendDetailTab = function (selectedItem) {
        $scope.selectedItem.extendDetailList = [];
        angular.forEach($scope.selectedItem.detailList, function (orderDetail, index) {
            SalesOrderChangeExtendDetail.get(selectedItem.uuid, orderDetail.uuid).success(function (data) {
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
                    transferFlag = item.transferFlag;
                } else {
                    if (transferFlag != item.transferFlag) {
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
    $scope.updateOrderChangeDetailsTransfer= function (item) {
        if (item.detailList != null) {
            angular.forEach(item.detailList, function (detail) {
                detail.transferFlag = item.transferFlag;
            });
        }
    };

    $scope.getOrderMasterCount = function () {
        SalesOrderChangeMaster.getOrderMasterCount(Constant.CONFIRM[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO_CHANGE.RES_UUID).success(function (data) {
            $scope.menuList[1].subList[6].suffix = data;
        });
    }

});
