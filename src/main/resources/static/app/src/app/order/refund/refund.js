angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/refunds', {
        controller: 'RefundController',
        templateUrl: 'app/src/app/order/refund/refund.html'
    })
}]);

angular.module('IOne-Production').controller('RefundController', function ($scope, OrderMaster, Receipts, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        confirm: Constant.CONFIRM[0].value,
        no: '',
        channelUuid: '',
        orderAmount: '',
        paidAmount: '',
        unpaidAmount: ''
        /*        status :  Constant.STATUS[0].value,
         release : Constant.RELEASE[0].value*/
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        OrderMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage,
            $scope.listFilterOption.confirm, '', '',
            $scope.listFilterOption.no, '', '', '', '', '',
            $scope.listFilterOption.channelUuid, $scope.listFilterOption.orderAmount,
            $scope.listFilterOption.paidAmount, $scope.listFilterOption.unpaidAmount, '2').success(function (data) {

            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            angular.forEach($scope.itemList, function (item) {
                item.unPaidAmount = item.orderAmount - item.paidAmount;
            });
            $scope.selectAllFlag = false;
            $scope.selectedItemSize = 0;
            $scope.selectedItemAmount = 0;
            //console.info($scope.itemList);
        });
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.selectAllFlag = false;
    $scope.selectedItemSize = 0;
    $scope.selectedItemAmount = 0;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        Receipts.get(item.uuid, '2').success(function (data) {
            $scope.subItemList = data.content;
            item.detailList = $scope.subItemList;
            $scope.setDetailsBgColor(item.detailList);
        });
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
        if (item.showMorePanel) {
            Receipts.get(item.uuid, '2').success(function (data) { //scope: '1' - 取收银单；'2' - 取退银单
                $scope.subItemList = data.content;
                item.detailList = $scope.subItemList;
                $scope.setDetailsBgColor(item.detailList);
            });
        }
    };

    $scope.setDetailsBgColor = function (detailList) {
        angular.forEach(detailList, function (detail) {
            if (detail.paidType == '3') {
                detail.bgColor = {'background-color': '#f6e343;'};//yellow
            } else if (detail.paidType == '4') {
                detail.bgColor = {'background-color': '#fd8e74;'};//red
            }
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
        //TODO ...
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
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == Constant.CONFIRM[2].value) {
            $scope.showConfirm('确认取消审核订单单头吗？', '', function () {
                var OrderMasterUpdateInput = {
                    uuid: item.uuid,
                    confirm: '1'
                };
                OrderMaster.modify(OrderMasterUpdateInput).success(function () {
                    item.confirm = Constant.CONFIRM[1].value;
                    $scope.showInfo('取消审核成功！');
                }).error(function (response) {
                    $scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        } else {
            $scope.showConfirm('确认审核订单单头吗？', '', function () {
                var OrderMasterUpdateInput = {
                    uuid: item.uuid,
                    confirm: '2'
                };
                OrderMaster.modify(OrderMasterUpdateInput).success(function () {
                    item.confirm = Constant.CONFIRM[2].value;
                    $scope.showInfo('审核成功！');
                }).error(function (response) {
                    $scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        }
    };

    $scope.detailConfirmClickAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        if (detail.status == 2) {
            $scope.showConfirm('确认取消审核收银单身吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    status: '1'
                };
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (data) {
                    detail.status = '1';
                    console.info("取消审核成功返回：");
                    console.info(data);
                    $scope.showInfo('取消审核成功！');
                }).error(function (response) {
                    $scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        } else {
            $scope.showConfirm('确认审核收银单身吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    status: '2'
                };
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (data) {
                    detail.status = '2';
                    console.info("审核成功返回：");
                    console.info(data);
                    $scope.showInfo('审核成功！');
                }).error(function (response) {
                    $scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        }
    };

    $scope.detailTransferClickAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        if (detail.transferFlag == 2) {
            $scope.showConfirm('确认重新抛转收银单身吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    receiptOrderConversion: 'true'
                };
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (data) {
                    //console.info("重新抛转成功返回：");
                    //console.info(data);
                    $scope.showInfo('重新抛转成功！');
                }).error(function (response) {
                    //$scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        } else {
            $scope.showConfirm('确认抛转收银单身吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    transferFlag: '2',
                    receiptOrderConversion: 'true'
                };
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (data) {
                    detail.transferFlag = '2';
                    //console.info("抛转成功返回：");
                    //console.info(data);
                    $scope.showInfo('抛转成功！');
                }).error(function (response) {
                    //$scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        }
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

    //批量审核
    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var confirmedNos = '';
        var count = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.confirm !== '2') {
                    var OrderMasterUpdateInput = {
                        uuid: item.uuid,
                        confirm: '2'
                    };
                    var response = OrderMaster.modify(OrderMasterUpdateInput).success(function () {
                    });
                    promises.push(response);
                    count++;
                } else {
                    confirmedNos = confirmedNos + item.no + ","
                }
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择任何未审核的订单，请先选择订单！');
            return;
        }
        if (confirmedNos !== '') {
            confirmedNos = confirmedNos.substr(0, confirmedNos.length - 1);
            $scope.showWarn('如下已审核过的订单将不再次审核：' + confirmedNos);
        }
        $q.all(promises).then(function (data) {
            console.info(data);
            $scope.refreshList();
            $scope.showInfo('审核成功！');
        }, function (data) {
            $scope.showError(data.data.message);
            $scope.showError(data.message);
        });
    };

    $scope.revertConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var unConfirmedNos = '';
        var count = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.confirm == '2') {
                    var OrderMasterUpdateInput = {
                        uuid: item.uuid,
                        confirm: '1'
                    };
                    var response = OrderMaster.modify(OrderMasterUpdateInput).success(function () {
                    });
                    promises.push(response);
                    count++;
                } else {
                    unConfirmedNos = unConfirmedNos + item.no + ","
                }
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择任已审核的订单，请先选择订单！');
            return;
        }
        if (unConfirmedNos !== '') {
            unConfirmedNos = unConfirmedNos.substr(0, unConfirmedNos.length - 1);
            $scope.showWarn('如下未审核过的订单将不执行取消审核：' + unConfirmedNos);
        }
        $q.all(promises).then(function (data) {
            console.info(data);
            $scope.refreshList();
            $scope.showInfo('取消审核成功！');
        }, function (data) {
            //console.info(data);
            $scope.showError(data.data.message);
            $scope.showError(data.message);
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
        });
        //ADD...
        $scope.selectedItemSize = 0;
        $scope.selectedItemAmount = 0;
        if ($scope.selectAllFlag) {
            angular.forEach($scope.itemList, function (item) {
                $scope.selectedItemSize++;
                $scope.selectedItemAmount += item.orderAmount;
            })
        }
    };

    $scope.openChannelDlg = function () {
        $mdDialog.show({
            controller: 'selectChannelController',
            templateUrl: 'app/src/app/order/receipts/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.listFilterOption.channelUuid = data.uuid;
            $scope.listFilterOption.channelName = data.name;
        });
    };

    $scope.clearChannel = function () {
        $scope.listFilterOption.channelUuid = '';
        $scope.listFilterOption.channelName = '';
    };
});

angular.module('IOne-Production').controller('selectChannelController', function ($scope, $mdDialog, ChannelService) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };
    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshChannel();
    };
    $scope.refreshChannel = function () {
        //ChannelService in ocm.js
        ChannelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword).success(function (data) {
            $scope.allChannel = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };
    $scope.refreshChannel();
    $scope.selectChannel = function (channel) {
        $scope.channel = channel;
        $mdDialog.hide($scope.channel);
    };
    $scope.hideDlg = function () {
        $mdDialog.hide($scope.channel);
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});
