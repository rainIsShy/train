angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/jingdong-orders', {
        controller: 'JdOrderController',
        templateUrl: 'app/src/app/jingdong/order/order.html'
    })
}]);

angular.module('IOne-Production').controller('JdOrderController', function ($scope, JdTradeMaster, JdTradeDetail1, JdTradeDetail2, Constant, $mdDialog) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };
    $scope.MenuDisplayOption = {
        '107-throw': {display: true, name: '审核', uuid: 'D566E493-7138-4FB0-9E34-44460A4AEAAB'},
        '108-cancelThrow': {display: true, name: '取消审核', uuid: 'DFEABC92-881A-484E-9C14-D9BD68D06C2E'},
        '400-throw': {display: true, name: '审核', uuid: 'CEBE2D58-4DB9-4350-B048-52BC6D402BD3'},
        '401-cancelThrow': {display: true, name: '取审', uuid: '3786e3e5-efd5-43fe-b639-f4fc70ad241f'},
        '403-batchThrow': {display: true, name: '批量审核', uuid: '1B06DBD4-A1A7-47A3-88C0-15EDB98029CA'},
        '405-batchSelectThrow': {display: true, name: '批量取审', uuid: 'FE5F696F-1C29-4AA1-9410-341BF82EB376'},
        '407-batchMerge': {display: true, name: '批量合并', uuid: 'B98178BC-213F-4D58-8CB3-5AE2131AEEB9'}
    };
    $scope.JINGDONG_STATUS = Constant.JINGDONG_STATUS;
    $scope.disableMergeButton = false;

    $scope.listFilterOption = {
        orderState: Constant.JINGDONG_STATUS['WAIT_SELLER_STOCK_OUT'].value,
        confirm: Constant.CONFIRM[1].value,
        orderFlag: Constant.ORDER_FLAG[0].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        JdTradeMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption, $scope.RES_UUID_MAP.EPS.JINGDONG_ORDERS.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            $scope.refreshMenuButtons();

        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.EPS.JINGDONG_ORDERS.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });
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
        JdTradeDetail1.get($scope.selectedItem.uuid).success(function (data) {
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
            JdTradeDetail1.get(item.uuid).success(function (data) {
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
            $scope.selectedItemAmount += item.orderTotalPrice;
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectedItemAmount -= item.orderTotalPrice;
            $scope.selectAllFlag = false;
        }

        $scope.refreshMenuButtons();
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);

        if (item.confirm == Constant.CONFIRM[2].value) {
            $scope.showError("已成功审核并抛转的订单不能取消审核，订单号：" + item.orderId);
            return false;
        }

        if (angular.isUndefined(item.venderRemark) || item.venderRemark == null) {
            $scope.showError("备注为空，不符合抛转电商销售单规则，订单号：" + item.orderId);
            return false;
        } else {
            var orderFlagValid = false;
            angular.forEach(Constant.ORDER_FLAG, function (orderFlag) {
                if (item.venderRemark.substring(0, 1) == orderFlag.value) {
                    orderFlagValid = true;
                }
            });
            if (orderFlagValid === false) {
                $scope.showError("备注不符合抛转电商销售单规则（数字1~6开头），订单号：" + item.orderId);
                return false;
            }
        }

        $scope.showConfirm('确认审核吗？', '', function () {
            JdTradeMaster.confirm(item.uuid).success(function () {
                item.confirm = Constant.CONFIRM[2].value;

                $scope.refreshMenuButtons();
                $scope.showInfo('订单审核成功！');
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
        //    $scope.showError("已成功审核并抛转的订单不能取消审核，订单号：" + item.orderId);
        //    return false;
        //}

        $scope.showConfirm('确认取消审核吗？', '', function () {
            JdTradeMaster.cancelConfirm(item.uuid).success(function (data) {
                angular.forEach(data, function (canceledItem) {
                    angular.forEach($scope.itemList, function (item) {
                        if (item.uuid == canceledItem.uuid) {
                            item.confirm = Constant.CONFIRM[1].value;
                        }
                    });
                });

                $scope.refreshMenuButtons();
                $scope.showInfo('订单取消审核成功！');
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
            $scope.showError('没有选择任何订单，请先选择订单！');
            return;
        }
        if (failUuids !== "") {
            $scope.showError("已成功审核并抛转的订单不能再次审核并抛转，订单号：" + failUuids.substring(0, failUuids.length - 2));
            return false;
        }

        $scope.showConfirm('确认审核吗？', '', function () {
            JdTradeMaster.confirm(uuids).success(function () {
                angular.forEach($scope.itemList, function (item) {
                    if (item.selected === true) {
                        item.confirm = Constant.CONFIRM[2].value;
                    }
                });

                $scope.refreshMenuButtons();
                $scope.showInfo('订单审核成功！');
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
            $scope.showError('没有选择任何订单，请先选择订单！');
            return;
        }
        //if (failUuids !== "") {
        //    $scope.showError("已成功审核并抛转的订单不能再次审核并抛转，订单号：" + failUuids.substring(0, failUuids.length - 2));
        //    return false;
        //}

        $scope.showConfirm('确认取消审核吗？', '', function () {
            JdTradeMaster.cancelConfirm(uuids).success(function (data) {
                angular.forEach(data, function (canceledItem) {
                    angular.forEach($scope.itemList, function (item) {
                        if (item.uuid == canceledItem.uuid) {
                            item.confirm = Constant.CONFIRM[1].value;
                        }
                    });
                });

                $scope.refreshMenuButtons();
                $scope.showInfo('订单取消审核成功！');
            }).error(function (response) {
                //$scope.showError($scope.getError(response.message));
                $scope.showError(response.message);
            });
        });
    };

    $scope.mergeClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('confirm all...');

        var uuids = "";
        var count = 0;
        var failUuids = "";
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                uuids += (item.uuid + ",");
                count++;
            }
        });

        if (count === 0) {
            $scope.showError('没有选择任何订单，请先选择订单！');
            return;
        }

        $scope.showConfirm('确认合并吗？', '', function () {
            JdTradeMaster.merge(uuids).success(function () {
                angular.forEach($scope.itemList, function (item) {
                    if (item.selected === true) {
                        item.confirm = Constant.CONFIRM[2].value;
                    }
                });

                $scope.refreshMenuButtons();
                $scope.showInfo('订单合并成功！');
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
                $scope.selectedItemAmount += item.orderTotalPrice;
            })
        }

        $scope.refreshMenuButtons();
    };

    //选择员工
    $scope.openEmployeeDlg = function () {
        $mdDialog.show({
            controller: 'SelectEmployeeController',
            templateUrl: 'app/src/app/jingdong/order/selectEmployeeDlg.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.listFilterOption.employeeNo = data.no;
        });
    };

    //更新菜单按钮状态
    $scope.refreshMenuButtons = function () {
        $scope.disableMergeButton = false;

        var count = 0;
        var venderId;
        var pin;
        var confirm;
        var orderState;
        angular.forEach($scope.itemList, function (item) {
            if (item.selectedRef) {
                if (count === 0) {
                    venderId = item.venderId;
                    pin = item.pin;
                    confirm = item.confirm;
                    orderState = item.orderState;
                } else {
                    if (venderId != item.venderId
                        || pin != item.pin
                        || confirm != item.confirm
                        || orderState != item.orderState) {
                        $scope.disableMergeButton = true;
                    }
                }
                count++;
            }
        });

        if (count <= 1
            || confirm == Constant.CONFIRM[2].value
            || orderState != Constant.JINGDONG_STATUS['WAIT_SELLER_STOCK_OUT'].value) {
            $scope.disableMergeButton = true;
        }

        $scope.disableBatchMenuButtons();
    };

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

angular.module('IOne-Production').controller('SelectEmployeeController', function ($scope, $mdDialog, EmployeeService) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    $scope.refreshEmployeeList = function () {
        EmployeeService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.searchKeyword).success(function (data) {
            $scope.employeeList = data.content;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshEmployeeList();

    $scope.selectEmployee = function (employee) {
        $scope.employee = employee;
        $mdDialog.hide($scope.employee);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});