angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/sale-order-change', {
        controller: 'SaleOrderChangeController',
        templateUrl: 'app/src/app/order/sale_change/saleChangeList.html'
    })
}]);

angular.module('IOne-Production').controller('SaleOrderChangeController', function ($q, $scope, PsoOrderChangeMaster, PsoOrderChangeDetail, PsoOrderChangeExtendDetail, PsoOrderChangeExtendDetail2, ReceiptDetail, Constant, $mdDialog) {
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
        'confirm': {display: true, name: '审核', uuid: '8cbe8322-dfe7-42d3-8dd7-6b3963cf1fa5'},
        'revertConfirm': {display: true, name: '取审', uuid: 'ca19c1b2-8136-4451-bcf3-192efa193804'},
        'transfer': {display: true, name: '抛转', uuid: '91f66d12-9e6d-4a4e-920d-227bf1552cc5'},
        'batchConfirm': {display: true, name: '批量审核', uuid: 'd2b7f59b-7b05-40f4-b3ff-4c8699a3a002'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: '1190f67b-834e-4960-b67e-aa6b9ad0f125'},
        'batchTransfer': {display: true, name: '批量拋转', uuid: '315c8021-249c-426c-b84c-1ac982a1f026'},
        'detailConfirm': {display: true, name: '审核', uuid: '32e80f5c-7ae7-4245-8587-5bf6f8e684f3'},
        'detailRevertConfirm': {display: true, name: '取审', uuid: 'a357dff4-683f-4f87-9965-a878c2f5be00'},
        'detailTransfer': {display: true, name: '抛转', uuid: 'ce35a122-4a6c-4a12-875c-3e47d5149925'},
        'add': {display: true, name: '新增', uuid: '8e4ca13d-37b3-45d2-962c-b9910e89adb7'},
        'oneOffSync': {display: true, name: '一键抛转', uuid: '6C954DAC-F520-4F5B-8517-2DE425B4C661'},
        'batchAuditTransfer': {display: true, name: '批量审核抛转', uuid: 'f338793f-a8ce-47f9-8855-fdeb230f9418'},
        'auditTransfer': {display: true, name: '审核抛转', uuid: '6cc85ee4-680c-4770-ba0f-9dbedc158fc4'}
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        PsoOrderChangeMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption, '-no,-changeVersion').success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.disableBatchMenuButtons();
        }).error(function (response) {
            $scope.showError(response.message);
        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.ORDER_CHANGE.RES_UUID).success(function (data) {
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
        PsoOrderChangeDetail.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem.detailList = data.content;
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
        PsoOrderChangeDetail.get(item.uuid).success(function (data) {
            item.detailList = data.content;
        });
    };

    /**
     * Toggle the advanced panel for detail item in the list
     */
    //$scope.toggleDetailMorePanelAction = function (detail) {
    //    detail.showMorePanel = !detail.showMorePanel;
    //};

    /**
     * Change status to list all items
     */
    $scope.listItemAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
    };

    /**
     * Set stauts to 'edit' to edit an object. The panel will be generated automatically.
     */
    //$scope.editItemAction = function (editItemAction) {
    //    $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
    //    $scope.status = 'edit';
    //    //$scope.desc = desc;
    //    //$scope.source = source;
    //    //$scope.domain = domain;
    //};

    $scope.showOrderChangeEditor = function (selectedItem) {
        /*$scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
         $scope.status = 'edit';*/

        $mdDialog.show({
            controller: 'EditOrderChangeController',
            templateUrl: 'app/src/app/order/sale_change/saleChangeEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                parentSelectedItem: selectedItem
            }
        }).then(function (data) {
            var postData = {
                "deliverDate": data.deliverDate,
                "predictDeliverDate": data.predictDeliverDate,
                "customerAddressUuid": data.customerAddress.uuid
            };
            PsoOrderChangeMaster.modify($scope.selectedItem.uuid, postData).success(function () {
                $scope.updateSelectedItem(data);
                $scope.showInfo('修改成功。');
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.updateSelectedItem = function (updateSelectedItemInput) {
        $scope.selectedItem.deliverDate = updateSelectedItemInput.deliverDate;
        $scope.selectedItem.predictDeliverDate = updateSelectedItemInput.predictDeliverDate;
        $scope.selectedItem.receivePhone = updateSelectedItemInput.receivePhone;
        $scope.selectedItem.receiveName = updateSelectedItemInput.receiveName;
        $scope.selectedItem.receiveAddress = updateSelectedItemInput.receiveAddress;
        $scope.selectedItem.customerAddress = updateSelectedItemInput.customerAddress;

        // update deliver date of detail
        angular.forEach($scope.selectedItem.detailList, function (detail) {
            if (detail.deliverDate != $scope.selectedItem.deliverDate) {
                detail.deliverDate = $scope.selectedItem.deliverDate;
            }
            if (detail.originalDeliverDate != $scope.selectedItem.deliverDate) {
                detail.originalDeliverDate = $scope.selectedItem.deliverDate;
            }
        });

    };

    $scope.showDetailEditor = function (detail) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'edit';

        $mdDialog.show({
            controller: 'EditOrderChangeDetailController',
            templateUrl: 'app/src/app/order/sale_change/detailEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                parentDetail: detail
            }
        }).then(function (data) {
            var postData = {
                "orderQuantity": data.orderQuantity,
                "deliverDate": data.deliverDate,
                "status": data.status
            };
            PsoOrderChangeDetail.modify($scope.selectedItem.uuid, detail.uuid, postData).success(function () {
                $scope.updateDetailUI(data, detail);
                $scope.showInfo('修改成功。');
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.updateDetailUI = function (source, detail) {
        detail.orderQuantity = source.orderQuantity;
        detail.deliverDate = source.deliverDate;
        detail.status = source.status;
    };

    /**
     * Add new item which will take the ui to the edit page.
     */
    //$scope.preAddItemAction = function (editItemAction) {
    //    $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
    //    $scope.status = 'add';
    //    //$scope.desc = desc;
    //    //$scope.source = source;
    //    //$scope.domain = domain;
    //};

    //选择生产销售单
    $scope.openOrderDlg = function () {
        $mdDialog.show({
            controller: 'SelectOrderController',
            templateUrl: 'app/src/app/order/sale_change/selectOrderDlg.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedOrder = data;
            $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
            $scope.status = 'add';
        });
    };

    $scope.openSelectAddressDlg = function (selectedItem) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'edit';

        $mdDialog.show({
            controller: 'SelectCustomerAddressController',
            templateUrl: 'app/src/app/order/sale_change/selectCustomerAddressDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                parentSelectedItem: selectedItem
            }
        }).then(function (selectedCustomerAddress) {
            //$scope.updateSelectedItem(data);
            $scope.selectedOrder.receivePhone = selectedCustomerAddress.receivePhone;
            $scope.selectedOrder.receiveName = selectedCustomerAddress.receiveName;
            $scope.selectedOrder.receiveAddress = selectedCustomerAddress.receiveAddress;
            $scope.selectedOrder.customerAddress = selectedCustomerAddress;
        });
    };

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function (editItemAction) {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);

        if ($scope.status == 'add') {
            PsoOrderChangeMaster.add($scope.selectedOrder.uuid, $scope.selectedOrder).success(function (data) {
                $scope.showInfo('保存成功');
                $scope.refreshList();
            }).error(function (response) {
                $scope.showError('保存失败, 原因: ' + response.message);
            });
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
    //$scope.deleteDetailAction = function (detail) {
    //    //TODO ...
    //};

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
        $scope.disableBatchMenuButtons();
    };

    $scope.confirmClickAction = function (event, item, confirmVal) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        var action = "审核";
        var popMessage = "审核后变更将会生效，确认审核吗？";
        if (confirmVal == Constant.CONFIRM[1].value) {
            action = "取消审核";
            popMessage = "取消审核后产品销售单将会回退到之前版本，确认取消审核吗？"
        }

        $scope.showConfirm(popMessage, '', function () {
            PsoOrderChangeMaster.confirm(item.uuid, confirmVal).success(function () {
                item.confirm = confirmVal;
                $scope.updateOrderChangeDetailsConfirm(item);
                $scope.showInfo('产品销售变更单' + action + '成功！');
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
            PsoOrderChangeMaster.modify(item.uuid, {'status': '1'}).success(function () {
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
            PsoOrderChangeMaster.modify(item.uuid, {'status': '2'}).success(function () {
                item.status = Constant.STATUS[2].value;
                $scope.showInfo('禁用成功！');
                $scope.disableBatchMenuButtons();
                $scope.getOrderMasterCount();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    //$scope.transferClickAction = function (event, item) {
    //    $scope.stopEventPropagation(event);
    //    console.info('transfer...');
    //
    //    $scope.showConfirm('抛转后将会生成预订单变更单，确认抛转吗？', '', function () {
    //        var uuids = [];
    //        uuids.push(item.uuid);
    //        PsoOrderChangeMaster.transfer(uuids).success(function () {
    //            item.transferPsoFlag = Constant.TRANSFER_PSO_FLAG[1].value;
    //            $scope.showInfo('产品销售变更单抛转成功！');
    //            $scope.disableBatchMenuButtons();
    //        }).error(function (response) {
    //            $scope.showError(response.message);
    //        });
    //    });
    //};

    $scope.transferClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('transfer...');
        if (item.orderMaster.transferPsoFlag == '2') {
            $scope.showWarn("变更单对应的产品销售单尚未抛转,请先抛转产品销售单!");
            return;
        }
        $scope.showConfirm('抛转后将会生成预订单变更单，确认抛转吗？', '', function () {
            PsoOrderChangeMaster.transfer(item.uuid).success(function () {
                item.transferPsoFlag = Constant.TRANSFER_PSO_FLAG[1].value;
                $scope.showInfo('产品销售变更单抛转成功！');
                $scope.disableBatchMenuButtons();
                $scope.getOrderMasterCount();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };


    $scope.oneOffSync = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.orderMaster.transferPsoFlag == '2') {
            $scope.showWarn("变更单对应的产品销售单尚未抛转,请先抛转产品销售单!");
            return;
        }
        $scope.showConfirm('确认一键抛转产品销售单变更单吗？', '', function () {
            PsoOrderChangeMaster.oneOffSync(item.uuid).success(function () {
                item.transferPsoFlag = Constant.TRANSFER_PSO_FLAG[1].value;
                $scope.showInfo('产品销售变更单一键同步成功。');
                $scope.disableBatchMenuButtons();
                $scope.getOrderMasterCount();
            }).error(function (response) {
                $scope.showError(response.message);
            })
        });
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
                    var response = PsoOrderChangeMaster.confirm(item.uuid, Constant.CONFIRM[2].value).success(function () {
                        item.confirm = Constant.CONFIRM[2].value;
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
                    var response = PsoOrderChangeMaster.confirm(item.uuid, Constant.CONFIRM[1].value).success(function () {
                        item.confirm = Constant.CONFIRM[1].value;
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
                    var response = PsoOrderChangeMaster.modify(item.uuid, {'status': '1'}).success(function () {
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
                    var response = PsoOrderChangeMaster.modify(item.uuid, {'status': '2'}).success(function () {
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


    //$scope.transferAllClickAction = function (event) {
    //    $scope.stopEventPropagation(event);
    //
    //    if ($scope.selectedItemSize == 0) {
    //        $scope.showWarn('请先选择记录！');
    //        return;
    //    }
    //    $scope.showConfirm('确认抛转吗', '', function () {
    //        var uuids = [];
    //        angular.forEach($scope.itemList, function (item) {
    //            if (item.selected) {
    //                uuids.push(item.uuid);
    //            }
    //        });
    //
    //        var response = PsoOrderChangeMaster.transfer(uuids).success(function () {
    //            // TODO: update item.transferPsoFlag based on response
    //            $scope.showInfo('抛转成功！');
    //        }).error(function (response) {
    //            $scope.showError(item.no + ' 抛转失败：' + response.message);
    //        });
    //    });
    //};

    $scope.transferAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认抛转吗', '', function () {
            var promises = [];
            var bError = false;
            var ignoredNos = '';
            var count = 0;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    if (item.orderMaster.transferPsoFlag != '2') {
                        var response = PsoOrderChangeMaster.transfer(item.uuid).success(function () {
                            item.transferPsoFlag = '1';
                        }).error(function (response) {
                            bError = true;
                            $scope.showError(item.no + ' 抛转失败：' + response.message);
                        });
                        promises.push(response);
                        count++;
                    } else {
                        ignoredNos = ignoredNos + item.no + '(版本:' + item.changeVersion + ')' + '<br>'
                    }
                }
            });
            if (ignoredNos !== '') {
                $scope.showWarn('如下变更单对应的产品销售单尚未抛转,将不执行抛转：' + '<br>' + ignoredNos + '请先抛转对应的产品销售单');
            }
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('共' + count + '笔抛转成功！');
                    $scope.getOrderMasterCount();
                }
                $scope.disableBatchMenuButtons();
            });
        });
    };


    $scope.transferAllneOffSyncAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认一键抛转吗', '', function () {
            var promises = [];
            var bError = false;
            var ignoredNos = '';
            var count = 0;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    if (item.orderMaster.transferPsoFlag != '2') {
                        var response = PsoOrderChangeMaster.oneOffSync(item.uuid).success(function () {
                            item.transferPsoFlag = '1';
                        }).error(function (response) {
                            bError = true;
                            $scope.showError(item.no + ' 抛转失败：' + response.message);
                        });
                        promises.push(response);
                        count++;
                    } else {
                        ignoredNos = ignoredNos + item.no + '(版本:' + item.changeVersion + ')' + '<br>'
                    }
                }
            });
            if (ignoredNos !== '') {
                $scope.showWarn('如下变更单对应的产品销售单尚未抛转,将不执行抛转：' + '<br>' + ignoredNos + '请先抛转对应的产品销售单');
            }
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('共' + count + '笔抛转成功！');
                    $scope.getOrderMasterCount();
                }
                $scope.disableBatchMenuButtons();
            });
        });
    };


    $scope.updateOrderChangeDetailsConfirm = function (item) {
        if (item.detailList != null) {
            angular.forEach(item.detailList, function (detail) {
                detail.confirm = item.confirm;
            });
        }
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
            });
        }
        $scope.disableBatchMenuButtons();
    };
    //$scope.selectAllAction();

    /*************************************/
    // Get all extend details.
    $scope.refreshExtendDetailTab = function (selectedItem) {
        var byExtendNo = function () {
            return function (orderChangeExt1, orderChangeExt2) {
                var no1, no2;
                if (typeof orderChangeExt1 === "object" && typeof orderChangeExt2 === "object" && orderChangeExt1 && orderChangeExt2) {
                    no1 = orderChangeExt1.orderExtendDetail.no;
                    no2 = orderChangeExt2.orderExtendDetail.no;
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
            PsoOrderChangeExtendDetail.get(selectedItem.uuid, orderDetail.uuid).success(function (data) {
                if (data.totalElements > 0) {
                    $scope.selectedItem.extendDetailList = $scope.selectedItem.extendDetailList.concat(data.content);
                }
                $scope.selectedItem.extendDetailList = $scope.selectedItem.extendDetailList.sort(byExtendNo());
            });
        });
    };

    /*$scope.refreshExtendDetail2Tab = function (selectedItem) {

     }*/

    $scope.refreshReceiptInfoTab = function (selectedItem) {
        ReceiptDetail.get($scope.selectedItem.orderMaster.uuid).success(function (data) {
            $scope.receiptOrderDetailList = data;
            angular.forEach($scope.receiptOrderDetailList.content, function (receiptOrderDetail) {
                if (null != receiptOrderDetail.payOrder) {
                    receiptOrderDetail.payOrder = $scope.getImageFullPath(receiptOrderDetail.payOrder);
                }
            });
        });
    };

    $scope.showExtendDetail2Viewer = function (extendDetail) {
        $mdDialog.show({
            controller: 'ViewOrderChangeDetail2Controller',
            templateUrl: 'app/src/app/order/sale_change/extendDetail2ViewDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                parentExtendDetail: extendDetail
            }
        }).then(function (data) {
            /*var postData = {
             "orderQuantity": data.orderQuantity,
             "deliverDate": data.deliverDate,
             "status": data.status
             };
             PsoOrderChangeDetail.modify($scope.selectedItem.uuid, detail.uuid, postData).success(function () {
             $scope.updateDetailUI(data, detail);
             $scope.showInfo('修改成功。');
             }).error(function (response) {
             $scope.showError(response.message);
             });*/
        });
    };

    $scope.disableBatchMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var status = '';
        var transferReturnFlag = '';
        var diffConfirm = false;
        var diffStatus = false;
        var diffTransferReturnFlag = false;
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
                if (transferReturnFlag == '') {
                    transferReturnFlag = item.transferPsoFlag;
                } else {
                    if (transferReturnFlag != item.transferPsoFlag) {
                        diffTransferReturnFlag = true;
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

            if (diffTransferReturnFlag == true) {
                $scope.disabledBatchTransfer = true;
            } else if (transferReturnFlag == '1') {
                $scope.disabledBatchTransfer = true;
            } else {
                $scope.disabledBatchTransfer = false;
            }
        }
    };

    $scope.getOrderMasterCount = function () {
        PsoOrderChangeMaster.getOrderMasterCount(Constant.CONFIRM[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER_CHANGE.RES_UUID).success(function (data) {
            $scope.menuList[1].subList[4].suffix = data;
        });
    };

    $scope.batchAuditTransfer = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认 审核抛转 吗？', '', function () {
            var uuids = [];
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    uuids.push(item.uuid);
                }
            });
            PsoOrderChangeMaster.auditTransfer(uuids).success(function () {
                angular.forEach($scope.itemList, function (item) {
                    if (item.selected) {
                        item.confirm = 2; // 已審核
                        item.transferPsoFlag = 1; // 已拋轉
                    }
                });

                $scope.disableBatchMenuButtons();
                $scope.getOrderMasterCount();

                $scope.showInfo('产品销售变更单 审核抛转 成功！');
            }).error(function (resp) {
                $scope.showError(resp.message);
            });
        });
    };

    $scope.auditTransfer = function (event, item) {
        $scope.stopEventPropagation(event);

        $scope.showConfirm('确认 审核抛转 吗？', '', function () {
            PsoOrderChangeMaster.auditTransfer([ item.uuid ]).success(function () {
                item.confirm = 2; // 已審核
                item.transferPsoFlag = 1; // 已拋轉

                $scope.updateOrderChangeDetailsConfirm(item);
                $scope.disableBatchMenuButtons();
                $scope.getOrderMasterCount();

                $scope.showInfo('产品销售变更单 审核抛转 成功！');
            }).error(function (resp) {
                $scope.showError(resp.message);
            });
        });
    };
});

angular.module('IOne-Production').controller('EditOrderChangeController', function ($scope, $mdDialog, parentSelectedItem) {
    $scope.customerAddressSelectionParam = {
        customerUuid: ""
    };

    $scope.initCustomerAddressSelectionParam = function () {
        if (parentSelectedItem.customerAddress != null
            && parentSelectedItem.customerAddress.customer != null) {
            $scope.customerAddressSelectionParam.customerUuid = parentSelectedItem.customerAddress.customer.uuid;
        }
    };
    $scope.initCustomerAddressSelectionParam();

    $scope.selectedItem = {
        "deliverDate": parentSelectedItem.deliverDate,
        "predictDeliverDate": parentSelectedItem.predictDeliverDate,
        "receivePhone": parentSelectedItem.receivePhone,
        "receiveName": parentSelectedItem.receiveName,
        "receiveAddress": parentSelectedItem.receiveAddress,
        "customerAddress": parentSelectedItem.customerAddress //obj
    };
    if (parentSelectedItem.deliverDate != null) {
        $scope.selectedItem.deliverDate = new Date(parentSelectedItem.deliverDate);
    }
    if (parentSelectedItem.predictDeliverDate != null) {
        $scope.selectedItem.predictDeliverDate = new Date(parentSelectedItem.predictDeliverDate);
    }

    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    $scope.saveOrderChange = function () {
        $mdDialog.hide($scope.selectedItem);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.selectCustomerAddressCallback = function (selectedCustomerAddress) {
        $scope.selectedItem.receivePhone = selectedCustomerAddress.receivePhone;
        $scope.selectedItem.receiveName = selectedCustomerAddress.receiveName;
        $scope.selectedItem.receiveAddress = selectedCustomerAddress.receiveAddress;
        $scope.selectedItem.customerAddress = selectedCustomerAddress;
    };
});

angular.module('IOne-Production').controller('EditOrderChangeDetailController', function ($scope, $mdDialog, parentDetail) {
    $scope.detail = {
        "orderQuantity": parentDetail.orderQuantity,
        "deliverDate": parentDetail.deliverDate,
        "status": parentDetail.status
    };
    if (parentDetail.deliverDate != null) {
        $scope.detail.deliverDate = new Date(parentDetail.deliverDate);
    }

    $scope.saveDetail = function () {
        $mdDialog.hide($scope.detail);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('ViewOrderChangeDetail2Controller', function ($scope, $mdDialog, parentExtendDetail, OrderCustomScope, OrderItemCustomDetail, PsoOrderChangeExtendDetail2) {
    $scope.extendDetail = parentExtendDetail;

    $scope.initAllCustomsScopes = function (parentExtendDetail) {
        OrderItemCustomDetail.getCustomDetail(parentExtendDetail.item.uuid).success(function (data) {
            $scope.allCustomsScopes = {};
            $scope.selectedItemCustoms = data;
            angular.forEach($scope.selectedItemCustoms.content, function (value) {
                value.informationUuids = JSON.parse(value.information);
            });

            angular.forEach($scope.selectedItemCustoms.content, function (itemCustomDetail) {
                angular.forEach(itemCustomDetail.informationUuids, function (informationUuid) {
                    OrderCustomScope.getCustomScope(itemCustomDetail.itemCustom.uuid, informationUuid).success(function (data) {

                        if (data.brand != null && parentExtendDetail.item.brand != null && parentExtendDetail.item.brand.name != data.brand.name) {
                            //do nothing,because
                            //若plm_base_custom_scope.plm_base_brand_file_uuid非空（目前主要是颜色定制），还需通过plm_base_custom_scope.plm_base_brand_file_uuid
                            //关联来限制可定制的属性，通过 pso_order_ext_dtl2.plm_base_item_file_uuid=plm_base_item_file.uuid and
                            //plm_base_item_file.plm_base_brand_file_uuid=plm_base_custom_scope.plm_base_brand_file_uuid来限制允许定制的属性（如该包件允许定制的颜色）                                             //do nothing

                        } else {
                            if ($scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] == undefined) {
                                var value = {};
                                value[data.uuid] = data;
                                $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] = value;
                            } else {
                                var value = $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid];
                                value[data.uuid] = data;
                                $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] = value;
                            }
                        }

                    })
                });
            });
        });
    };

    $scope.getExtendDetail2s = function (parentExtendDetail) {
        $scope.initAllCustomsScopes(parentExtendDetail);

        PsoOrderChangeExtendDetail2.get(parentExtendDetail.orderChangeDetail.orderChange.uuid, parentExtendDetail.orderChangeDetail.uuid, parentExtendDetail.uuid).success(function (data) {
            $scope.orderExtendDetail2List = data.content;
            angular.forEach($scope.orderExtendDetail2List, function (value) {
                value.informationUuids = JSON.parse(value.information);
            })
        });
    };
    $scope.getExtendDetail2s(parentExtendDetail);

    $scope.saveDetail = function () {
        $mdDialog.hide(extendDetail);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('SelectOrderController', function ($scope, Constant, $mdDialog, OrderMaster) {
    $scope.STATUS = Constant.STATUS;
    $scope.CONFIRM = Constant.CONFIRM;
    $scope.TRANSFER_PSO_FLAG = Constant.TRANSFER_PSO_FLAG;
    $scope.orderStatus = Constant.STATUS[0].value;
    $scope.orderConfirm = Constant.CONFIRM[0].value;
    $scope.orderTransferPsoFlag = Constant.TRANSFER_PSO_FLAG[0].value;

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    $scope.refreshOrderList = function () {
        OrderMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage,
            $scope.orderConfirm,
            $scope.orderStatus,
            $scope.orderTransferPsoFlag,
            $scope.orderNo
        ).success(function (data) {
            $scope.orderList = data.content;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshOrderList();

    $scope.selectOrder = function (order) {
        $scope.selectedOrder = order;
        $mdDialog.hide($scope.selectedOrder);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('SelectCustomerAddressController', function ($scope, $mdDialog, parentSelectedItem) {
    $scope.customerAddressSelectionParam = {
        customerUuid: ""
    };

    $scope.initCustomerAddressSelectionParam = function () {
        if (parentSelectedItem.customerAddress != null
            && parentSelectedItem.customerAddress.customer != null) {
            $scope.customerAddressSelectionParam.customerUuid = parentSelectedItem.customerAddress.customer.uuid;
        }
    };
    $scope.initCustomerAddressSelectionParam();

    $scope.selectedItem = {
        //"deliverDate": parentSelectedItem.deliverDate,
        //"predictDeliverDate": parentSelectedItem.predictDeliverDate,
        //"receivePhone": parentSelectedItem.receivePhone,
        //"receiveName": parentSelectedItem.receiveName,
        //"receiveAddress": parentSelectedItem.receiveAddress,
        "customerAddress": parentSelectedItem.customerAddress //obj
    };
    if (parentSelectedItem.deliverDate != null) {
        $scope.selectedItem.deliverDate = new Date(parentSelectedItem.deliverDate);
    }
    if (parentSelectedItem.predictDeliverDate != null) {
        $scope.selectedItem.predictDeliverDate = new Date(parentSelectedItem.predictDeliverDate);
    }

    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    $scope.saveOrderChange = function () {
        $mdDialog.hide($scope.selectedItem);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.selectCustomerAddressCallback = function (selectedCustomerAddress) {
        $mdDialog.hide(selectedCustomerAddress);
    };
});