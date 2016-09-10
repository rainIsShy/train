angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/receipts', {
        controller: 'ReceiptsController',
        templateUrl: 'app/src/app/order/receipts/receipts.html'
    })
}]);

angular.module('IOne-Production').controller('ReceiptsController', function ($scope, OrderMaster, Receipts, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        select: {
            orderReceiptDetailStatus: Constant.CONFIRM[0].value,
            channelUuid: ''
        },
        no: '',
        orderAmount: '',
        paidAmount: '',
        unpaidAmount: ''
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.menuDisplayOption = {
        'confirm1': {display: true, name: '审核', uuid: 'AF475D01-1DCA-4D2B-A78C-62EB9B8B6DCB'},
        'revertConfirm1': {display: true, name: '取审', uuid: 'EF97A1B9-CAB2-438E-90B7-6A0B18384B3B'},
        'transfer1': {display: true, name: '抛转', uuid: 'F9EBFCBB-3322-4931-A8A9-550610D15AD6'},
        'reTransfer1': {display: true, name: '重抛', uuid: '2F33B1DD-D2A1-4DEF-80B4-4043D52548F1'},
        'confirm2': {display: true, name: '审核', uuid: '37339D36-5572-4794-85D8-BD8137B167C4'},
        'revertConfirm2': {display: true, name: '取审', uuid: '7CC43966-9B22-406D-9776-36AAEEF71457'},
        'transfer2': {display: true, name: '抛转', uuid: 'E3BDFCD2-7A73-4931-B3C5-8FFD702A8FAC'},
        'reTransfer2': {display: true, name: '重抛', uuid: 'F37B3561-83AA-43CB-9BDB-F7AFF42277A8'},
        'oneOffSync': {display: true, name: '一键抛转', uuid: '1A99B73F-7B6A-4FD6-A8BF-9324F19A4510'},
        'batchConfirm': {display: true, name: '批量审核', uuid: '44FDD95A-27FB-411F-9285-DB738E33842A'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: 'C03F8C5C-9355-4626-9942-9C24C2983D18'},
        'batchTransfer': {display: true, name: '批量抛转', uuid: 'FF1449B3-B6BC-4368-A410-F709A37A5887'},
        'batchReTransfer': {display: true, name: '批量重抛', uuid: 'DF5F7982-B0F4-4ED4-8A6E-62AFB40F84C7'}
    };

    $scope.refreshList = function () {
        Receipts.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.select.channelUuid, $scope.listFilterOption.no,
            $scope.listFilterOption.select.orderReceiptDetailStatus, $scope.listFilterOption.orderAmount, $scope.listFilterOption.paidAmount,
            $scope.listFilterOption.unpaidAmount, $scope.RES_UUID_MAP.PSO.ORDER_RECEIPT.RES_UUID)
            .success(function (data) {
                $scope.itemList = data.content;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
                angular.forEach($scope.itemList, function (item) {
                    item.unPaidAmount = item.orderAmount - item.paidAmount;
                    Receipts.get(item.uuid).success(function (data) {
                        item.detailList = data.content;
                        $scope.setDetailsBgColor(item.detailList);
                    });
                });
                $scope.selectAllFlag = false;
                $scope.selectedItemSize = 0;
                $scope.selectedItemAmount = 0;
            });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.ORDER_RECEIPT.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
        console.info($scope.menuAuthDataMap);
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
        /*
         Receipts.get(item.uuid).success(function (data) {
         $scope.subItemList = data.content;
         item.detailList = $scope.subItemList;
         $scope.setDetailsBgColor(item.detailList);
         });
         */
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
            Receipts.get(item.uuid).success(function (data) {
                $scope.subItemList = data.content;
                item.detailList = $scope.subItemList;
                $scope.setDetailsBgColor(item.detailList);
            });
        }
    };

    $scope.setDetailsBgColor = function (detailList) {
        angular.forEach(detailList, function (detail) {
            if (detail.paidType == '1') {
                detail.bgColor = {'background-color': '#76EEC6'};//green
            } else if (detail.paidType == '2') {
                detail.bgColor = {'background-color': '#76EEC6;'};//green
            } else if (detail.paidType == '3') {
                detail.bgColor = {'background-color': '#FFEC8B;'};//yellow
            } else if (detail.paidType == '4') {
                detail.bgColor = {'background-color': '#FFAEB9;'};//red
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
                    //$scope.showError($scope.getError(response.message));
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
                    //$scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        }
    };

    $scope.detailConfirmClickAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        if (detail.status == 2) {
            $scope.showConfirm('确认取消审核收退银单身吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    status: '1'
                };
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (data) {
                    detail.status = '1';
                    $scope.showInfo('取消审核成功！');
                    $scope.getReceiptOrderMasterCount();
                }).error(function (response) {
                    //$scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        } else {
            $scope.showConfirm('确认审核收退银单身吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    status: '2'
                };
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (data) {
                    detail.status = '2';
                    $scope.showInfo('审核成功！');
                    $scope.getReceiptOrderMasterCount();
                }).error(function (response) {
                    //$scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        }
    };

    $scope.detailTransferClickAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        if (detail.transferFlag == 2) {
            $scope.showConfirm('确认重新抛转收退银单身吗？', '', function () {
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
            $scope.showConfirm('确认抛转收退银单身吗？', '', function () {
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


    $scope.oneOffSync = function (event, detail) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认一键抛转收退银单身吗？', '', function () {
            var updateInput = {
                uuid: detail.uuid
            };
            Receipts.oneOffSync(detail.orderMaster.uuid, updateInput).success(function (response) {
                detail.transferFlag = '2';
                $scope.showInfo('一键同步成功。');
            }).error(function (response) {
                $scope.showError(response.message);
            })
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

    //批量审核
    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var ignoredNos = '';
        var count = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                angular.forEach(item.detailList, function (detail) {
                    if (detail.status != '2') {
                        var UpdateInput = {
                            uuid: detail.uuid,
                            status: '2'
                        };
                        var response = Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (data) {
                        }).error(function (response) {
                            $scope.showError('收银单' + item.no + '-' + detail.no + '审核失败：' + response.message);
                        });
                        promises.push(response);
                        count++;
                    } else {
                        ignoredNos = ignoredNos + item.no + '-' + detail.no + '<br>'
                    }
                })
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择任何未审核的收退银单，请先选择！');
            return;
        }
        if (ignoredNos !== '') {
            ignoredNos = ignoredNos.substr(0, ignoredNos.length - 1);
            $scope.showWarn('如下已审核过的收退银单将不再次审核：' + '<br>' + ignoredNos);
        }
        $q.all(promises).then(function (data) {
            $scope.refreshList();
            $scope.showInfo('共' + count + '笔审核成功！');
            $scope.getReceiptOrderMasterCount();
        }, function (data) {
            $scope.showError(data.data.message);
        });
    };

    $scope.revertConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var ignoredNos = '';
        var count = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                angular.forEach(item.detailList, function (detail) {
                    if (detail.status == '2' && detail.transferFlag != '2') {
                        var UpdateInput = {
                            uuid: detail.uuid,
                            status: '1'
                        };
                        var response = Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (response) {
                        }).error(function (response) {
                            $scope.showError('收银单' + item.no + '-' + detail.no + '取消审核失败：' + response.message);
                        });
                        promises.push(response);
                        count++;
                    } else {
                        ignoredNos = ignoredNos + item.no + '-' + detail.no + '<br>'
                    }
                })
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择任已审核的收退银单，请先选择订单！');
            return;
        }
        if (ignoredNos !== '') {
            ignoredNos = ignoredNos.substr(0, ignoredNos.length - 1);
            $scope.showWarn('如下未审核过或已抛转的收退银单将不执行取消审核：' + '<br>' + ignoredNos);
        }
        $q.all(promises).then(function (data) {
            $scope.refreshList();
            $scope.showInfo('共' + count + '笔取消审核成功！');
            $scope.getReceiptOrderMasterCount();
        }, function (data) {
            $scope.showError(data.data.message);
        });
    };

    $scope.transferAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var ignoredNos = '';
        var count = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                angular.forEach(item.detailList, function (detail) {
                    if (detail.status == '2' && detail.transferFlag != '2') {
                        var UpdateInput = {
                            uuid: detail.uuid,
                            transferFlag: '2',
                            receiptOrderConversion: 'true'
                        };
                        var response = Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (data) {
                        }).error(function (response) {
                            $scope.showError('收银单' + item.no + '-' + detail.no + '抛转失败：' + response.message);
                        });
                        promises.push(response);
                        count++;
                    } else {
                        ignoredNos = ignoredNos + item.no + '-' + detail.no + '<br>'
                    }
                })
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择待抛转的收退银单，请先选择！');
            return;
        }
        if (ignoredNos !== '') {
            ignoredNos = ignoredNos.substr(0, ignoredNos.length - 1);
            $scope.showWarn('如下未审核或已抛转的收退银单将不执行抛转：' + '<br>' + ignoredNos);
        }
        $q.all(promises).then(function (data) {
            $scope.refreshList();
            $scope.showInfo('共' + count + '笔抛转成功！');
            $scope.getReceiptOrderMasterCount();
        }, function (data) {
            $scope.showError(data.data.message);
        });
    };

    $scope.reTransferAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var ignoredNos = '';
        var count = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                angular.forEach(item.detailList, function (detail) {
                    if (detail.status == '2' && detail.transferFlag == '2') {
                        var UpdateInput = {
                            uuid: detail.uuid,
                            receiptOrderConversion: 'true'
                        };
                        var response = Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function (response) {
                        }).error(function (response) {
                            $scope.showError('收银单' + item.no + '-' + detail.no + '重新抛转失败：' + response.message);
                        });
                        promises.push(response);
                        count++;
                    } else {
                        ignoredNos = ignoredNos + item.no + '-' + detail.no + '<br>'
                    }
                })
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择待重新抛转的收退银单，请先选择！');
            return;
        }
        if (ignoredNos !== '') {
            ignoredNos = ignoredNos.substr(0, ignoredNos.length - 1);
            $scope.showWarn('如下未审核或未抛转的收退银单将不执行重新抛转：' + '<br>' + ignoredNos);
        }
        $q.all(promises).then(function (data) {
            $scope.refreshList();
            $scope.showInfo('共' + count + '笔重新抛转成功！');
            $scope.getReceiptOrderMasterCount();
        }, function (data) {
            console.info(data);
            $scope.showError(data.data.message);
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
            $scope.listFilterOption.select.channelUuid = data.uuid;
            $scope.listFilterOption.select.channelName = data.name;
        });
    };

    $scope.clearChannel = function () {
        $scope.listFilterOption.select.channelUuid = '';
        $scope.listFilterOption.select.channelName = '';
    };

    $scope.getReceiptOrderMasterCount = function () {
        Receipts.getReceiptOrderMasterCount(Constant.CONFIRM[1].value, RES_UUID_MAP.PSO.ORDER_RECEIPT.RES_UUID).success(function (data) {
            $scope.menuList[1].subList[9].suffix = data;
        });
    }
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
