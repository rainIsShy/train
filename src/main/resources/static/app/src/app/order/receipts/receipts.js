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
        'batchReTransfer': {display: true, name: '批量重抛', uuid: 'DF5F7982-B0F4-4ED4-8A6E-62AFB40F84C7'},
        'auditTransfer': {display: true, name: '审核抛转', uuid: '38af05ca-1baa-4660-869f-0ed680309bd0'},
        'oneOffReTransfer': {display: true, name: '一键重新抛转', uuid: '9d361cd0-7775-48f3-a1d6-1dc4d2e2a471'},
        'revert': {display: true, name: '还原', uuid: 'a3399bef-1e8a-4f8d-9907-3b47693c4a2b'}
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
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function () {
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
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function () {
                    detail.status = '2';
                    $scope.showInfo('审核成功！');
                    $scope.getReceiptOrderMasterCount();
                }).error(function (response) {
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
                    receiptOrderReConversion: 'true'
                };
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function () {
                    $scope.showInfo('重新抛转成功！');
                }).error(function (response) {
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
                Receipts.modify(detail.orderMaster.uuid, UpdateInput).success(function () {
                    detail.transferFlag = '2';
                    $scope.showInfo('抛转成功！');
                }).error(function (response) {
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
            Receipts.oneOffSync(detail.orderMaster.uuid, updateInput).success(function () {
                detail.transferFlag = '2';
                $scope.showInfo('一键同步成功。');
            }).error(function (response) {
                $scope.showError(response.message);
            })
        });
    };

    $scope.detailOneOffReTransferClickAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认一键重新抛转吗？', "", function () {
            Receipts.oneOffReTransfer(detail.orderMaster.uuid, [detail.uuid]).success(function () {
                $scope.showInfo('一键重新抛转成功。');
            }).error(function (err) {
                $scope.showError('一键重新抛转失败。<br />' + err.message);
            });
        });
    };


    $scope.detailAuditTransferClickAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        console.log(detail);
        $scope.showConfirm('确认审核抛转吗？', "", function () {
            Receipts.auditTransfer(detail.orderMaster.uuid, [detail.uuid]).success(function () {
                detail.status = Constant.CONFIRM[2].value;
                detail.transferFlag = Constant.TRANSFER_FLAG[2].value;
                $scope.showInfo('审核抛转成功。');
            }).error(function (err) {
                $scope.showError('审核抛转失败。<br />' + err.message);
            });
        });
    };

    $scope.detailRevertTransferClickAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认抛转还原吗？', "", function () {
            Receipts.revertTransfer(detail.orderMaster.uuid, [detail.uuid]).success(function () {
                detail.transferFlag = Constant.TRANSFER_FLAG[1].value;
                $scope.showInfo('抛转还原成功。');
            }).error(function (err) {
                $scope.showError('抛转还原失败。<br />' + err.message);
            });
        });
    };

    //批量审核
    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        var ignoredNos = '';
        var updateInput = {
            uuid: [],
            status: '2'
        };
        angular.forEach($scope.itemList, function (item) {
            if (item.selected) {
                angular.forEach(item.detailList, function (detail) {
                    if (detail.status != '2') {
                        updateInput.uuid.push(detail.uuid);
                    } else {
                        ignoredNos += item.no + '-' + detail.no + '<br>';
                    }
                });
            }
        });

        if (!updateInput.uuid.length) {
            $scope.showWarn('没有选择任何未审核的收退银单，请先选择！');
            return;
        }
        if (ignoredNos) {
            $scope.showWarn('如下已审核过的收退银单将不再次审核：<br>' + ignoredNos);
        }
        Receipts.modify('_batch', updateInput).success(function () {
            $scope.refreshList();
            $scope.getReceiptOrderMasterCount();
            $scope.showInfo('共' + updateInput.uuid.length + '笔审核成功！');
        }).error(function (response) {
            $scope.showError('审核失败：' + response.message);
        });
    };

    $scope.revertConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        var ignoredNos = '';
        var updateInput = {
            uuid: [],
            status: '1'
        };
        angular.forEach($scope.itemList, function (item) {
            if (item.selected) {
                angular.forEach(item.detailList, function (detail) {
                    if (detail.status == '2' && detail.transferFlag != '2') {
                        updateInput.uuid.push(detail.uuid);
                    } else {
                        ignoredNos += item.no + '-' + detail.no + '<br>';
                    }
                });
            }
        });

        if (!updateInput.uuid.length) {
            $scope.showWarn('没有选择任已审核的收退银单，请先选择订单！');
            return;
        }
        if (ignoredNos) {
            $scope.showWarn('如下未审核过或已抛转的收退银单将不执行取消审核：<br>' + ignoredNos);
        }
        Receipts.modify('_batch', updateInput).success(function () {
            $scope.refreshList();
            $scope.getReceiptOrderMasterCount();
            $scope.showInfo('共' + updateInput.uuid.length + '笔取消审核成功！');
        }).error(function (response) {
            $scope.showError('取消审核失败：' + response.message);
        });
    };

    $scope.transferAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        var ignoredNos = '';
        var updateInput = {
            uuid: [],
            transferFlag: '2',
            receiptOrderConversion: 'true'
        };
        angular.forEach($scope.itemList, function (item) {
            if (item.selected) {
                angular.forEach(item.detailList, function (detail) {
                    if (detail.status == '2' && detail.transferFlag != '2') {
                        updateInput.uuid.push(detail.uuid);
                    } else {
                        ignoredNos += item.no + '-' + detail.no + '<br>';
                    }
                });
            }
        });

        if (!updateInput.uuid.length) {
            $scope.showWarn('没有选择待抛转的收退银单，请先选择！');
            return;
        }
        if (ignoredNos) {
            $scope.showWarn('如下未审核或已抛转的收退银单将不执行抛转：<br>' + ignoredNos);
        }
        Receipts.modify('_batch', updateInput).success(function () {
            $scope.refreshList();
            $scope.getReceiptOrderMasterCount();
            $scope.showInfo('共' + updateInput.uuid.length + '笔抛转成功！');
        }).error(function (response) {
            $scope.showError('抛转失败：' + response.message);
        });
    };

    $scope.reTransferAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var ignoredNos = '';
        var updateInput = {
            uuid: [],
            receiptOrderReConversion: 'true'
        };
        angular.forEach($scope.itemList, function (item) {
            if (item.selected) {
                angular.forEach(item.detailList, function (detail) {
                    if ($scope.isReTransferable(detail)) {
                        updateInput.uuid.push(detail.uuid);
                    } else {
                        ignoredNos += item.no + '-' + detail.no + '<br>';
                    }
                });
            }
        });

        if (!updateInput.uuid.length) {
            $scope.showWarn('没有选择待重新抛转的收退银单，请先选择！');
            return;
        }
        if (ignoredNos) {
            $scope.showWarn('如下未审核,未抛转或是销退退款的收退银单将不执行重新抛转：' + '<br>' + ignoredNos);
        }
        Receipts.modify('_batch', updateInput).success(function () {
            $scope.refreshList();
            $scope.getReceiptOrderMasterCount();
            $scope.showInfo('共' + updateInput.uuid.length + '笔重新抛转成功！');
        }).error(function (response) {
            $scope.showError('重新抛转失败：' + response.message);
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

    $scope.isReTransferable = function (receiptOrderDetail) {
        return receiptOrderDetail.transferFlag == Constant.TRANSFER_FLAG[2].value &&
            receiptOrderDetail.paidType != Constant.PAID_TYPE[4].value &&
            $scope.menuDisplayOption['reTransfer1'].display &&
            ( $scope.menuAuthDataMap[$scope.menuDisplayOption['reTransfer1'].uuid] || $scope.isAdmin() || !$scope.menuDisplayOption['reTransfer1'].uuid);
    }

    $scope.isOneOffReTransferable = function (receiptOrderDetail) {
        return receiptOrderDetail.transferFlag == Constant.TRANSFER_FLAG[2].value &&
            receiptOrderDetail.paidType != Constant.PAID_TYPE[4].value &&
            $scope.menuDisplayOption['oneOffReTransfer'].display &&
            ( $scope.menuAuthDataMap[$scope.menuDisplayOption['oneOffReTransfer'].uuid] || $scope.isAdmin() || !$scope.menuDisplayOption['oneOffReTransfer'].uuid);
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
