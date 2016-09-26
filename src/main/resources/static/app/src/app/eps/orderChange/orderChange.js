angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ecommerce-orders-change', {
        controller: 'EpsOrderChangeController',
        templateUrl: 'app/src/app/eps/orderChange/orderChange.html'
    })
}]);

angular.module('IOne-Production').controller('EpsOrderChangeController', function ($q, $scope, $mdDialog, EpsOrderChangeMaster, EpsOrderChangeDetail, EpsOrderChangeExtendDetail, Constant, SaleTypes) {
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
        EpsOrderChangeMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
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

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.selectedItem.orderDate = new Date(item.orderDate);
        $scope.selectedItem.predictDeliverDate = new Date(item.predictDeliverDate);
        EpsOrderChangeDetail.get($scope.selectedItem.uuid).success(function (data) {
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

        EpsOrderChangeDetail.get(item.uuid).success(function (data) {
            item.detailList = data.content;
            if (data.content.length === 0) {
                $scope.showWarn("未查找到对应的商品信息！");
            }
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
            $scope.addObjectUuidParameters($scope.selectedItem);
            EpsOrderChangeMaster.add($scope.selectedItem.uuid, $scope.selectedItem).success(function (data) {
                $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                $scope.showInfo('变更单创建成功');
                $scope.refreshList();
                $scope.selectedItem = data;

                EpsOrderChangeDetail.get($scope.selectedItem.uuid).success(function (data) {
                    $scope.selectedItem.detailList = data.content;
                }).error(function (response) {
                    $scope.showError('获取变更单单身信息失败，原因：' + response.message);
                });
            }).error(function (response) {
                $scope.showError('变更单创建失败, 原因: ' + response.message);
            });
        } else if ($scope.status == 'edit') {
            $scope.addObjectUuidParameters($scope.selectedItem);
            EpsOrderChangeMaster.modify($scope.selectedItem.uuid, $scope.selectedItem).success(function (data) {
                $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                $scope.showInfo('变更单修改成功');
                $scope.refreshList();
                $scope.selectedItem = data;

                EpsOrderChangeDetail.get($scope.selectedItem.uuid).success(function (data) {
                    $scope.selectedItem.detailList = data.content;
                }).error(function (response) {
                    $scope.showError('获取变更单单身信息失败，原因：' + response.message);
                });
            }).error(function (response) {
                $scope.showError('变更单修改失败, 原因: ' + response.message);
            });
        }
    };

    $scope.addObjectUuidParameters = function (workingEpsOrderChangeMaster) {
        if (workingEpsOrderChangeMaster.channel != null) {
            workingEpsOrderChangeMaster.channelUuid = workingEpsOrderChangeMaster.channel.uuid;
        }
        if (workingEpsOrderChangeMaster.deliverWay != null) {
            workingEpsOrderChangeMaster.deliverWayUuid = workingEpsOrderChangeMaster.deliverWay.uuid;
        }
        if (workingEpsOrderChangeMaster.groupUser != null) {
            workingEpsOrderChangeMaster.groupUserUuid = workingEpsOrderChangeMaster.groupUser.uuid;
        }
        if (workingEpsOrderChangeMaster.receiveDistrict != null) {
            workingEpsOrderChangeMaster.receiveDistrictUuid = workingEpsOrderChangeMaster.receiveDistrict.uuid;
        }
        if (workingEpsOrderChangeMaster.predictDeliverDate) {
            workingEpsOrderChangeMaster.predictDeliverDate = moment(workingEpsOrderChangeMaster.predictDeliverDate).format('YYYY-MM-DD');
        }
    };

    /**
     * Delete detail item
     */
    $scope.closeDetailAction = function (detail) {
        EpsOrderChangeDetail.close($scope.selectedItem.uuid, detail.uuid).success(function (detailRep) {
            detail.status = Constant.STATUS[2].value;
            //angular.forEach($scope.selectedItem.extendDetailList, function (epsOrderChangeExtDetail, index) {
            //    if (epsOrderChangeExtDetail.epsOrderChangeDetail.uuid == detail.uuid) {
            //        epsOrderChangeExtDetail.status = Constant.STATUS[2].value;
            //    }
            //});

            $scope.showInfo('变更单单身结案成功！');
        }).error(function (response) {
            $scope.showError('变更单单身结案失败，原因：' + response.message);
        });
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
        $scope.disableBatchMenuButtons();
    };

    $scope.confirmClickAction = function (event, item, confirmVal) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        //$scope.showConfirm('审核后预定单的变更将会生效，确认审核吗？', '', function () {
        //    EpsOrderChangeMaster.confirm(item.uuid).success(function () {
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
            popMessage = "取消审核后电商销售单将会回退到之前版本，确认取消审核吗？"
        }

        $scope.showConfirm(popMessage, '', function () {
            if (confirmVal == Constant.CONFIRM[1].value) {
                EpsOrderChangeMaster.cancelConfirm(item.uuid).success(function () {
                    item.confirm = confirmVal;
                    $scope.updateOrderChangeDetailsConfirm(item);
                    $scope.showInfo('电商销售单变更单' + action + '成功！');
                    $scope.disableBatchMenuButtons();
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            } else {
                EpsOrderChangeMaster.confirm(item.uuid).success(function () {
                    item.confirm = confirmVal;
                    $scope.updateOrderChangeDetailsConfirm(item);
                    $scope.showInfo('电商销售单变更单' + action + '成功！');
                    $scope.disableBatchMenuButtons();
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            }
        });

    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        $scope.showConfirm('确认启用吗？', '', function () {
            EpsOrderChangeMaster.modify(item.uuid, {'status': '1'}).success(function () {
                item.status = Constant.STATUS[1].value;
                $scope.showInfo('启用成功！');
                $scope.disableBatchMenuButtons();
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.cancelStatusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');

        $scope.showConfirm('确认禁用吗？', '', function () {
            EpsOrderChangeMaster.modify(item.uuid, {'status': '2'}).success(function () {
                item.status = Constant.STATUS[2].value;
                $scope.showInfo('禁用成功！');
                $scope.disableBatchMenuButtons();
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
            EpsOrderChangeMaster.transfer(uuids).success(function (response) {
                if (response && response[0].code != 0) {
                    $scope.showError('抛转失败：' + response[0].msg);
                } else {
                    item.transferPsoFlag = Constant.TRANSFER_PSO_FLAG[1].value;
                    $scope.updateOrderChangeDetailsTransfer(item);
                    $scope.showInfo('电商销售单变更抛转成功！');
                    $scope.disableBatchMenuButtons();
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
                    var response = EpsOrderChangeMaster.confirm(item.uuid).success(function () {
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
                    var response = EpsOrderChangeMaster.cancelConfirm(item.uuid).success(function () {
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
     var response = EpsOrderChangeMaster.modify(item.uuid, {'confirm': '1'}).success(function () {
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
                    var response = EpsOrderChangeMaster.modify(item.uuid, {'status': '1'}).success(function () {
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
                    var response = EpsOrderChangeMaster.modify(item.uuid, {'status': '2'}).success(function () {
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

            var response = EpsOrderChangeMaster.transfer(uuids).success(function () {
                angular.forEach($scope.itemList, function (item) {
                    if (item.selected) {
                        item.transferPsoFlag = Constant.TRANSFER_PSO_FLAG[1].value;
                        $scope.updateOrderChangeDetailsTransfer(item);
                    }
                });
                $scope.showInfo('抛转成功！');
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
                $scope.selectedItemAmount += item.orderAmount;
            })
        }
        $scope.disableBatchMenuButtons();
    };

    /*************************************/
    // Get all extend details.
    $scope.refreshExtendDetailTab = function (selectedItem) {
        $scope.selectedItem.extendDetailList = [];
        angular.forEach($scope.selectedItem.detailList, function (orderDetail, index) {
            EpsOrderChangeExtendDetail.getAll(selectedItem.uuid, orderDetail.uuid).success(function (data) {
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
                    transferFlag = item.transferPsoFlag;
                } else {
                    if (transferFlag != item.transferPsoFlag) {
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
    $scope.updateOrderChangeDetailsTransfer = function (item) {
        if (item.detailList != null) {
            angular.forEach(item.detailList, function (detail) {
                detail.transferPsoFlag = item.transferPsoFlag;
            });
        }
    };

    $scope.openOrderDlg = function () {
        $mdDialog.show({
            controller: 'SelectEpsOrderController',
            templateUrl: 'app/src/app/eps/orderChange/selectOrderDlg.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            //$scope.selectedEpsOrder = data;
            $scope.selectedItem = data;
            $scope.selectedItem.orderDate = new Date(data.orderDate);
            $scope.selectedItem.predictDeliverDate = new Date(data.predictDeliverDate);
            $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
            $scope.status = 'add';
        });
    };

    SaleTypes.getAll().success(function (data) {
        $scope.saleTypes = data;
    });

    $scope.openDetailEditorDlg = function (epsOrderChangeDetail) {
        if ($scope.selectedItem.transferPsoFlag == '1') {
            $scope.showError('已抛转的变更单不能修改。');
            return;
        }
        $mdDialog.show({
            controller: 'EpsOrderChangeDetailController',
            templateUrl: 'app/src/app/eps/orderChange/detailEditorDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                workingOrderChangeDetail: epsOrderChangeDetail,
                saleTypes: $scope.saleTypes
            }
        }).then(function (data) {
            EpsOrderChangeDetail.modify($scope.selectedItem.uuid, epsOrderChangeDetail.uuid, data.workingOrderChangeDetail).success(function (detailRep) {
                $scope.selectedItem = detailRep.epsOrderChange;
                EpsOrderChangeDetail.get($scope.selectedItem.uuid).success(function (data) {
                    $scope.selectedItem.detailList = data.content;
                    //$scope.updateOrderDetailDeliverDate($scope.OrderDetailList);//YYYY-MM-DD
                    $scope.selectedItem.extendDetailList = [];
                    angular.forEach($scope.selectedItem.detailList, function (epsOrderChangeDetail, index) {
                        EpsOrderChangeExtendDetail.get(epsOrderChangeDetail.uuid).success(function (extDetailData) {
                            if (extDetailData.totalElements > 0) {
                                $scope.selectedItem.extendDetailList = $scope.selectedItem.extendDetailList.concat(extDetailData.content);
                            }
                        }).error(function (response) {
                            $scope.showError('刷新子单身数据失败，原因：' + response.message);
                        });
                    });
                }).error(function (response) {
                    $scope.showError('刷新单身数据失败，原因：' + response.message);
                });
                $scope.showInfo('变更单单身修改成功！');
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.openChannelDlg = function () {
        $mdDialog.show({
            controller: 'EChannelSearchController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            /*            if (angular.isUndefined($scope.selectedItem.channel.mall) || $scope.selectedItem.channel.mall == null) {
             } else {
             Mall = $scope.selectedItem.channel.mall;
             $scope.selectedItem.mallUuid = Mall.uuid;
             $scope.selectedItem.channel.mall = Mall;
             $scope.selectedItem.mallUuid = Mall.uuid;
             }*/
            $scope.selectedItem.channel = data;
            $scope.selectedItem.channelUuid = data.uuid;
            if (data.mall != null) {
                $scope.selectedItem.mallUuid = data.mall.uuid;
            }
        });
    };

    $scope.openDelivWayDlg = function () {
        $mdDialog.show({
            controller: 'EDelivWaySearchController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/selectDelivWay.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.deliverWay = data;
            $scope.selectedItem.deliverWayUuid = data.uuid;
        });
    };

    $scope.openGroupUserDlg = function () {
        $mdDialog.show({
            controller: 'EGroupUserSearchController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/selectGroupUser.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.groupUser = data;
            $scope.selectedItem.groupUserUuid = data.uuid;
        });
    };

    $scope.openAreaDlg = function () {
        $mdDialog.show({
            controller: 'EAreaSearchController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/selectArea.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.receiveDistrict = data;
            $scope.selectedItem.receiveDistrictUuid = data.uuid;
        });
    };

});

angular.module('IOne-Production').controller('EpsOrderChangeDetailController', function ($scope, $mdDialog, workingOrderChangeDetail, saleTypes) {
    $scope.workingOrderChangeDetail = angular.copy(workingOrderChangeDetail);
    $scope.itemSearchParam = {
        confirm: 2,
        release: 2,
        status: 1,
        eshopType: 2,
        assemblingFlag: 1
    };

    //电商销售类型下拉内容,只有'常规ST01'和'赠送ST04'
    $scope.saleTypes = angular.copy(saleTypes);
    var eSaleType = [];
    var i = 0;
    angular.forEach(saleTypes.content, function (saleType) {
        if (saleType.no == 'ST01') {
            eSaleType[i++] = saleType;
        }
        if (saleType.no == 'ST04') {
            eSaleType[i++] = saleType;
        }
    });
    $scope.saleTypes = eSaleType;

    $scope.disableOrderPrice = false;
    $scope.isChangingProduction = false;
    $scope.showChangingProductionPanel = function () {
        $scope.isChangingProduction = true;
    };
    $scope.hideChangingProductionPanel = function () {
        $scope.isChangingProduction = false;
    };
    //赠送类型的单价设置为0
    $scope.setZero = function (saleType) {
        if (saleType.name == '赠送') {
            $scope.workingOrderChangeDetail.orderPrice = 0;
            $scope.disableOrderPrice = true;
        } else {
            $scope.disableOrderPrice = false;
        }
    };
    $scope.selectBom = function (production) {
        if (production) {
            $scope.workingOrderChangeDetail.item = production;
            $scope.workingOrderChangeDetail.itemUuid = production.uuid;
            $scope.isChangingProduction = false;
        }
    };

    $scope.hideDlg = function () {
        $mdDialog.hide({
            'workingOrderChangeDetail': $scope.workingOrderChangeDetail
        });
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('SelectEpsOrderController', function ($scope, Constant, $mdDialog, EcommerceOrdersMaster) {
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
        EcommerceOrdersMaster.getAll(12, $scope.pageOption.currentPage, null,
            $scope.orderConfirm,
            $scope.orderStatus,
            $scope.orderTransferPsoFlag, null,
            $scope.orderNo
        ).success(function (data) {
            $scope.orderList = data.content;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshOrderList();

    $scope.selectOrder = function (order) {
        $scope.selectedEpsOrder = order;
        $mdDialog.hide($scope.selectedEpsOrder);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});