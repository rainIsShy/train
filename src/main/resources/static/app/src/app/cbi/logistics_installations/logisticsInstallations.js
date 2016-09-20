angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/logistics_installations', {
        controller: 'LogisticsInstallationsController',
        templateUrl: 'app/src/app/cbi/logistics_installations/logisticsInstallations.html'
    })
}]);

angular.module('IOne-Production').controller('LogisticsInstallationsController', function ($scope, WalkThroughMaster, WalkThroughDetail, WalkThroughLogistic, WalkThroughInstallation, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };
    $scope.BUILDING_TYPE = Constant.BUILDING_TYPE;
    $scope.WALK_THROUGH_CONF_STATUS = Constant.WALK_THROUGH_CONF_STATUS;
    $scope.selectAllFlag = false;
    $scope.selectedItemSize = 0;
    $scope.selectedItemAmount = 0;
    $scope.isLoading = false;

    $scope.listFilterOption = {
        select: {
            confStatus: Constant.WALK_THROUGH_CONF_STATUS[0].value,
            confirm: Constant.CONFIRM[0].value,
            transferFlag: Constant.TRANSFER_PSO_FLAG[1].value,
            orderType:''
        }
    };

    $scope.menuDisplayOption = {
        'maintain': {display: true, name: '维护', uuid: 'b6c65ede-36cd-4754-b4c0-0732bda3f9c2'},
        'detailMaintain': {display: true, name: '维护', uuid: 'fa325832-1480-4968-aea3-102d8ad1f3e5'},
        'batchMaintain': {display: true, name: '批量维护', uuid: '39d59bfc-2fcc-4524-9d04-2161f09a308b'},
        'o2oMaintain': {display: true, name: 'O2O', uuid: '552E6A90-445F-45FF-8923-BDD97924377E'},
        'o2oDetailMaintain': {display: true, name: 'O2O维护', uuid: '6E3814DC-EB5C-4A09-9F62-0084C59E6385'},
        'batchO2oMaintain': {display: true, name: '批量O2O维护', uuid: '0EB3EFC2-DDC2-4C82-A936-F870AC1CEE1F'}
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        WalkThroughMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            if (data.totalElements > 0) {
                angular.forEach($scope.itemList, function (item) {
                    WalkThroughLogistic.getAll(item.uuid).success(function (data) {
                        item.logistic = data.content[0];
                    });
                    WalkThroughInstallation.getAll(item.uuid).success(function (data) {
                        item.installation = data.content[0];
                    });
                });
            }
        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.LOGISTICS_INSTALLATIONS.RES_UUID).success(function (data) {
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

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        WalkThroughDetail.get($scope.selectedItem.uuid).success(function (data) {
            $scope.subItemList = data.content;
            item.detailList = $scope.subItemList;
        });

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
            WalkThroughDetail.get(item.uuid).success(function (data) {
                $scope.subItemList = data.content;
                item.detailList = $scope.subItemList;
            });
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
            $scope.selectedItemAmount += item.orderAmount;
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectedItemAmount -= item.orderAmount;
            $scope.selectAllFlag = false;
        }

        //$scope.refreshMenuButtons();
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        if (item.confirm == Constant.CONFIRM[2].value) {
            $scope.showError("已成功审核并抛转的预排单不能取消审核，预排单号：" + item.orderId);
            return false;
        }

        $scope.showConfirm('确认审核吗？', '', function () {
            WalkThroughMaster.confirm(item.uuid).success(function () {
                item.confirm = Constant.CONFIRM[2].value;
                $scope.showInfo('预排单审核成功！');
            }).error(function (response) {
                //$scope.showError($scope.getError(response.message));
                $scope.showError(response.message);
            });
        });
    };

    $scope.transferClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('transfer...');

        //if (item.confirm == Constant.CONFIRM[2].value) {
        //    $scope.showError("已成功审核并抛转的预排单不能再次抛转，预排单号：" + item.orderId);
        //    return false;
        //}

        $scope.showConfirm('确认抛转吗？', '', function () {
            WalkThroughMaster.transfer(item.uuid).success(function () {
                item.transferFlag = Constant.TRANSFER_PSO_FLAG[1].value;
                $scope.showInfo('预排单抛转成功！');
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
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                uuids += (item.uuid + ",");
                count++;

                if (item.confirm == Constant.CONFIRM[2].value) {
                    failUuids += (item.orderId + ", ");
                }
            }
        });

        if (count === 0) {
            $scope.showError('没有选择任何预排单，请先选择预排单！');
            return;
        }
        if (failUuids !== "") {
            $scope.showError("已成功审核并抛转的预排单不能再次审核并抛转，预排单号：" + failUuids.substring(0, failUuids.length - 2));
            return false;
        }

        $scope.showConfirm('确认审核吗？', '', function () {
            WalkThroughMaster.confirm(uuids).success(function () {
                angular.forEach($scope.itemList, function (item) {
                    if (item.selected === true) {
                        item.confirm = Constant.CONFIRM[2].value;
                    }
                });

                $scope.showInfo('预排单审核成功！');
            }).error(function (response) {
                //$scope.showError($scope.getError(response.message));
                $scope.showError(response.message);
            });
        });
    };

    $scope.walkTroughAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('confirm all...');

        var uuids = "";
        var count = 0;
        var failUuids = "";
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                uuids += (item.uuid + ",");
                count++;

                if (item.confirm == Constant.CONFIRM[2].value) {
                    failUuids += (item.orderId + ", ");
                }
            }
        });

        if (count === 0) {
            $scope.showError('没有选择任何预排单，请先选择预排单！');

        }
    };

    $scope.sycClickAction = function (event) {
        $scope.showConfirm('确认获取吗？', '', function () {
            $scope.isLoading = true;
            WalkThroughMaster.syc().success(function (response) {
                if (response.status == 'COMPLETED') {
                    $scope.refreshList();
                    $scope.isLoading = false;
                    $scope.showInfo('预排单获取成功！');
                } else {
                    var errorMsg = "预排单获取失败";
                    $scope.isLoading = false;
                    if (response.message != null) {
                        $scope.showError(errorMsg + "：" + response.message);
                    } else {
                        $scope.showError(errorMsg + "！");
                    }
                }
            }).error(function (response) {
                $scope.isLoading = false;
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
                $scope.selectedItemAmount += item.orderAmount;
            })
        }

        //$scope.refreshMenuButtons();
    };

    $scope.openSupplierDlg = function (item) {
        $mdDialog.show({
            controller: 'SupplierEditorController',
            templateUrl: 'app/src/app/cbi/logistics_installations/supplierDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                editingItem: item
            }
        }).then(function (editingItem) {
            //console.info("选择返回后的值:");
            //console.info(editingItem);

            if (editingItem.isModifyLogistic == false) {
                if (editingItem.logistic.supplier.uuid) {
                    console.info("新增物流订单");
                    var Input = {
                        //supplier: editingItem.logistic.supplier,
                        supplierUuid: editingItem.logistic.supplier.uuid,
                        orderDate: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
                        receiptDate: editingItem.confDeliverDate,
                        no: "1"
                    };
                    WalkThroughLogistic.add(editingItem.uuid, Input).success(function (data) {
                        $scope.showInfo("新增物流订单成功");
                        //console.info(data);
                        item.logistic = data;
                    }).error(function (response) {
                        $scope.showError(response.message);
                    });
                }
            } else if (editingItem.isModifyLogistic == true) {
                if (editingItem.installation.confirm == '2') {
                    $scope.showInfo("已有审核的物流订单,不再更新");
                    return;
                }
                if (editingItem.logistic.supplier) {
                    console.info("更新物流订单");
                    var Input = {
                        uuid: editingItem.logistic.uuid,
                        //supplier: editingItem.logistic.supplier,
                        supplierUuid: editingItem.logistic.supplier.uuid,
                        orderDate: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
                        receiptDate: editingItem.confDeliverDate,
                        no: "1"
                    };
                    WalkThroughLogistic.modify(editingItem.uuid, Input).success(function (data) {
                        $scope.showInfo("更新物流订单成功");
                        //console.info(data);
                        item.logistic = data;
                    }).error(function (response) {
                        $scope.showError(response.message);
                    });
                }
            }

            if (editingItem.isModifyInstallation == false) {
                if (editingItem.installation.supplier.uuid) {
                    console.info("新增安装订单");
                    var Input = {
                        //supplier: editingItem.installation.supplier,
                        supplierUuid: editingItem.installation.supplier.uuid,
                        orderDate: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
                        installationDate: moment(editingItem.installation.installationDate).format('YYYY-MM-DD 00:00:00'),
                        no: "1"

                    };
                    WalkThroughInstallation.add(editingItem.uuid, Input).success(function (data) {
                        $scope.showInfo("新增安装订单成功");
                        //console.info(data);
                        item.installation = data;
                    }).error(function (response) {
                        $scope.showError(response.message);
                    });
                }
            } else if (editingItem.isModifyInstallation == true) {
                if (editingItem.installation.confirm == '2') {
                    $scope.showInfo("已有审核的安装订单,不再更新");
                    return;
                }
                if (editingItem.installation.supplier) {
                    console.info("更新安装订单");
                    var Input = {
                        uuid: editingItem.installation.uuid,
                        //supplier: editingItem.installation.supplier,
                        supplierUuid: editingItem.installation.supplier.uuid,
                        orderDate: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
                        installationDate: moment(editingItem.installation.installationDate).format('YYYY-MM-DD 00:00:00'),
                        no: "1"

                    };
                    WalkThroughInstallation.modify(editingItem.uuid, Input).success(function (data) {
                        $scope.showInfo("更新安装订单成功");
                        //console.info(data);
                        item.installation = data;
                    }).error(function (response) {
                        $scope.showError(response.message);
                    });
                }
            }

        });
    };


    $scope.openO2oSupplierDlg = function (item) {
        $mdDialog.show({
            controller: 'O2oSupplierEditorController',
            templateUrl: 'app/src/app/cbi/logistics_installations/o2oSupplierDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                editingItem: item
            }
        }).then(function (editingItem) {
            //console.info("选择返回后的值:");
            //console.info(editingItem);

            if (editingItem.isModifyLogistic == false) {
                if (editingItem.logistic.supplier.uuid) {
                    console.info("新增物流订单");
                    var Input = {
                        //supplier: editingItem.logistic.supplier,
                        supplierUuid: editingItem.logistic.supplier.uuid,
                        orderDate: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
                        receiptDate: editingItem.confDeliverDate,
                        no: "1"
                    };
                    WalkThroughLogistic.add(editingItem.uuid, Input).success(function (data) {
                        $scope.showInfo("新增物流订单成功");
                        //console.info(data);
                        item.logistic = data;
                    }).error(function (response) {
                        $scope.showError(response.message);
                    });
                }
            } else if (editingItem.isModifyLogistic == true) {
                if (editingItem.installation.confirm == '2') {
                    $scope.showInfo("已有审核的物流订单,不再更新");
                    return;
                }
                if (editingItem.logistic.supplier) {
                    console.info("更新物流订单");
                    var Input = {
                        uuid: editingItem.logistic.uuid,
                        //supplier: editingItem.logistic.supplier,
                        supplierUuid: editingItem.logistic.supplier.uuid,
                        orderDate: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
                        receiptDate: editingItem.confDeliverDate,
                        no: "1"
                    };
                    WalkThroughLogistic.modify(editingItem.uuid, Input).success(function (data) {
                        $scope.showInfo("更新物流订单成功");
                        //console.info(data);
                        item.logistic = data;
                    }).error(function (response) {
                        $scope.showError(response.message);
                    });
                }
            }

        });
    };

    $scope.openBatchSupplierDlg = function () {
        var countSelected = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                countSelected++;
            }
        });
        if (countSelected === 0) {
            $scope.showWarn('请选择要维护的单据！');
            $scope.isLoading = false;
            return;
        }
        $mdDialog.show({
            controller: 'BatchSupplierEditorController',
            templateUrl: 'app/src/app/cbi/logistics_installations/batchSupplierDlg.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            //console.info("选择返回后的值:");
            //console.info(data);
            var logisticInput = {
                //supplier: data.logistic,
                uuid: "",
                supplierUuid: data.logistic.uuid,
                orderDate: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
                receiptDate: "",
                no: "1"
            };
            var installationInput = {
                uuid: "",
                supplierUuid: data.installation.uuid,
                orderDate: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
                installationDate: moment(data.installation.installationDate).format('YYYY-MM-DD 00:00:00'),
                no: "1"
            };
            var promises = [];
            var ConfirmedLogistic = '';
            var ConfirmedInstallation = '';
            var count = 0;
            $scope.isLoading = true;

            angular.forEach($scope.itemList, function (item) {
                if (item.selected === true) {
                    if (angular.isUndefined(item.logistic) || item.logistic == null) {
                        console.info("新增物流:");
                        var response = WalkThroughLogistic.add(item.uuid, logisticInput).success(function () {
                        });
                        promises.push(response);
                        count++;
                    } else {
                        if (item.logistic.confirm == '2') {
                            ConfirmedLogistic = ConfirmedLogistic + item.orderId + '<br>';
                        } else {
                            logisticInput.receiptDate = item.confDeliverDate;
                            logisticInput.uuid = item.logistic.uuid;
                            console.info("更新物流:");
                            var response = WalkThroughLogistic.modify(item.uuid, logisticInput).success(function () {
                            });
                            promises.push(response);
                            count++;
                        }
                    }

                    if (angular.isUndefined(item.installation) || item.installation == null) {
                        console.info("新增安装:");
                        var response = WalkThroughInstallation.add(item.uuid, installationInput).success(function () {
                        });
                        promises.push(response);
                        count++;
                    } else {
                        if (item.installation.confirm == '2') {
                            ConfirmedInstallation = ConfirmedInstallation + item.orderId + '<br>';
                        } else {
                            installationInput.uuid = item.installation.uuid;
                            console.info("更新安装:");
                            var response = WalkThroughInstallation.modify(item.uuid, installationInput).success(function () {
                            });
                            promises.push(response);
                            count++;
                        }
                    }
                }
            });
            if (count == 0) {
                $scope.showWarn('请选择要维护的单据！');
                $scope.isLoading = false;
                return;
            }
            if (ConfirmedLogistic !== '') {
                $scope.showWarn('已审核的物流单将不更新：' + ConfirmedLogistic);
            }
            if (ConfirmedInstallation !== '') {
                $scope.showWarn('已审核的安装单将不更新：' + ConfirmedInstallation);
            }

            $q.all(promises).then(function (data) {
                $scope.isLoading = false;
                $scope.showInfo('批量维护成功！');
                $scope.refreshList();
            }, function (data) {
                $scope.isLoading = false;
                $scope.showError('批量维护失败！' + data.message);
                $scope.refreshList();
            });
        });
    };
});

angular.module('IOne-Production').controller('SupplierEditorController', function ($scope, OCMSupplierService, Constant, $mdDialog, editingItem) {
    $scope.editingItem = angular.copy(editingItem);
    //console.info($scope.editingItem);

    if (angular.isUndefined($scope.editingItem.logistic) || $scope.editingItem.logistic == null) {
        $scope.editingItem.logistic = {
            supplier: {
                name: null
            }
        };
        $scope.editingItem.isModifyLogistic = false;
    } else {
        $scope.editingItem.isModifyLogistic = true;
    }

    if (angular.isUndefined($scope.editingItem.installation) || $scope.editingItem.installation == null) {
        $scope.editingItem.installation = {
            supplier: {
                name: null
            }
        };
        $scope.editingItem.isModifyInstallation = false;
    } else {
        $scope.editingItem.isModifyInstallation = true;
        if ($scope.editingItem.installation.installationDate != null) {
            $scope.editingItem.installation.installationDate = new Date($scope.editingItem.installation.installationDate);
        }
    }

    $scope.saveSupplier = function () {
        $mdDialog.hide($scope.editingItem);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.supplyType = "";//2=物流,3=安装
    $scope.chosenSupplier = "";
    $scope.showLogisticsPanel = function () {
        $scope.chosenSupplier = "logistics";
        $scope.supplyType = "2";
        $scope.queryAction();
    };
    $scope.showInstallationsPanel = function () {
        $scope.chosenSupplier = "installations";
        $scope.supplyType = "3";
        $scope.queryAction();
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshSupplier();
    };
    $scope.backAction = function () {
        $scope.chosenSupplier = "";
        $scope.searchKeyword = "";
    };

    $scope.refreshSupplier = function () {
        OCMSupplierService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '0', '0', null, null, $scope.supplyType, $scope.searchKeyword).success(function (data) {
            $scope.allSupplier = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.selectSupplier = function (supplier) {
        if (supplier) {
            if ($scope.chosenSupplier == "logistics") {
                $scope.editingItem.logistic.supplier = supplier;
            } else if ($scope.chosenSupplier == "installations") {
                $scope.editingItem.installation.supplier = supplier;
            }
            $scope.backAction();
        }
    };
});

angular.module('IOne-Production').controller('BatchSupplierEditorController', function ($scope, OCMSupplierService, Constant, $mdDialog) {
    $scope.supplyType = "";
    $scope.chosenSupplier = "";
    $scope.chosen = {
        logistic: '',
        installation: ''
    };
    $scope.showLogisticsPanel = function () {
        $scope.chosenSupplier = "logistics";
        $scope.supplyType = "2";
        $scope.queryAction();
    };
    $scope.showInstallationsPanel = function () {
        $scope.chosenSupplier = "installations";
        $scope.supplyType = "3";
        $scope.queryAction();
    };
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };
    $scope.refreshSupplier = function () {
        OCMSupplierService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '0', '0', null, null, $scope.supplyType, $scope.searchKeyword).success(function (data) {
            $scope.allSupplier = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };
    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshSupplier();
    };
    $scope.backAction = function () {
        $scope.chosenSupplier = "";
        $scope.searchKeyword = "";
    };
    $scope.selectSupplier = function (supplier) {
        if (supplier) {
            if ($scope.chosenSupplier == "logistics") {
                $scope.chosen.logistic = supplier;
            } else if ($scope.chosenSupplier == "installations") {
                $scope.chosen.installation = supplier;
            }
            $scope.backAction();
        }
    };
    $scope.saveSupplier = function () {
        $mdDialog.hide($scope.chosen);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('O2oSupplierEditorController', function ($scope, OCMSupplierService, Constant, $mdDialog, editingItem) {
    $scope.editingItem = angular.copy(editingItem);
    //console.info($scope.editingItem);

    if (angular.isUndefined($scope.editingItem.logistic) || $scope.editingItem.logistic == null) {
        $scope.editingItem.logistic = {
            supplier: {
                name: null
            }
        };
        $scope.editingItem.isModifyLogistic = false;
    } else {
        $scope.editingItem.isModifyLogistic = true;
    }

    if (angular.isUndefined($scope.editingItem.installation) || $scope.editingItem.installation == null) {
        $scope.editingItem.installation = {
            supplier: {
                name: null
            }
        };
        $scope.editingItem.isModifyInstallation = false;
    } else {
        $scope.editingItem.isModifyInstallation = true;
        if ($scope.editingItem.installation.installationDate != null) {
            $scope.editingItem.installation.installationDate = new Date($scope.editingItem.installation.installationDate);
        }
    }

    $scope.saveSupplier = function () {
        $mdDialog.hide($scope.editingItem);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.supplyType = "";//2=物流,3=安装
    $scope.chosenSupplier = "";
    $scope.showLogisticsPanel = function () {
        $scope.chosenSupplier = "logistics";
        $scope.supplyType = "2";
        $scope.queryAction();
    };
    //$scope.showInstallationsPanel = function () {
    //    $scope.chosenSupplier = "installations";
    //    $scope.supplyType = "3";
    //    $scope.queryAction();
    //};

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshSupplier();
    };
    $scope.backAction = function () {
        $scope.chosenSupplier = "";
        $scope.searchKeyword = "";
    };

    $scope.refreshSupplier = function () {
        OCMSupplierService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '0', '0', null, null, $scope.supplyType, $scope.searchKeyword).success(function (data) {
            $scope.allSupplier = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.selectSupplier = function (supplier) {
        if (supplier) {
            if ($scope.chosenSupplier == "logistics") {
                $scope.editingItem.logistic.supplier = supplier;
            } else if ($scope.chosenSupplier == "installations") {
                $scope.editingItem.installation.supplier = supplier;
            }
            $scope.backAction();
        }
    };
});