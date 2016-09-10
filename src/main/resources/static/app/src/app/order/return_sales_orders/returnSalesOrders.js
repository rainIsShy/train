angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/return-sales-orders', {
        controller: 'PSOReturnSalesOrdersController',
        templateUrl: 'app/src/app/order/return_sales_orders/returnSalesOrders.html'
    })
}]);

angular.module('IOne-Production').controller('PSOReturnSalesOrdersController', function ($scope, PSOReturnSalesOrdersMasterService, PSOReturnSalesOrdersDetailsService, PSOReturnSalesOrdersExtendsService, Constant, $mdDialog, $q) {
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
            returnSalesOrderDetailStatus: Constant.STATUS[0].value,
            returnSalesOrderDetailConfirm: Constant.AUDIT[0].value,
            returnSalesOrderDetailTransfer: Constant.TRANSFER_PSO_FLAG[0].value,
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
        PSOReturnSalesOrdersMasterService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.select.confirm, $scope.listFilterOption.select.status, $scope.listFilterOption.select.transferPsoFlag,
            $scope.listFilterOption.no, $scope.listFilterOption.select.startOrderDate, $scope.listFilterOption.select.endOrderDate, $scope.listFilterOption.select.channelUuid, $scope.listFilterOption.customerName, '1',
            $scope.listFilterOption.select.returnSalesOrderDetailConfirm, $scope.listFilterOption.select.returnSalesOrderDetailStatus, $scope.listFilterOption.select.returnSalesOrderDetailTransfer, $scope.RES_UUID_MAP.PSO.SO_RETURN.RES_UUID)
            .success(function (data) {
                $scope.itemList = data.content;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
                $scope.selectAllFlag = false;
                $scope.selectedItemSize = 0;
                $scope.selectedItemAmount = 0;
                $scope.selectedItemReturnAmount = 0;
                //get details
                angular.forEach($scope.itemList, function (item) {
                    PSOReturnSalesOrdersDetailsService.getAll(item.uuid).success(function (data) {
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
        //PSOReturnSalesOrdersDetailsService.getAll(item.uuid).success(function (data) {
        //    //$scope.subItemList = data.content;
        //    $scope.selectedItem.detailList = data.content;
        //    $scope.setDetailsBgColor(item.detailList);
        //    angular.forEach(item.detailList, function (returnDetail) {
        //        PSOReturnSalesOrdersExtendsService.getAll(returnDetail.salesOrderMaster.uuid, returnDetail.uuid).success(function (data) {
        //            if (data.totalElements > 0) {
        //                item.extendDetailList = item.extendDetailList.concat(data.content);
        //            }
        //        }).error(function (response) {
        //            $scope.showError(response.message);
        //        });
        //    });
        //});
        angular.forEach(item.detailList, function (returnDetail) {
            PSOReturnSalesOrdersExtendsService.getAll(returnDetail.salesOrderMaster.uuid, returnDetail.uuid).success(function (data) {
                if (data.totalElements > 0) {
                    item.extendDetailList = item.extendDetailList.concat(data.content);
                }
            }).error(function (response) {
                $scope.showError(response.message);
            });
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
        //console.info($scope.itemList);
        //if (item.showMorePanel) {
        //    PSOReturnSalesOrdersDetailsService.getAll(item.uuid).success(function (data) {
        //        $scope.subItemList = data.content;
        //        item.detailList = $scope.subItemList;
        //        $scope.setDetailsBgColor(item.detailList);
        //    });
        //}
    };

    $scope.setDetailsBgColor = function (detailList) {
        angular.forEach(detailList, function (detail) {
            //    if (detail.paidType == '1') {
            //        detail.bgColor = {'background-color': '#76EEC6'};//green
            //    } else if (detail.paidType == '2') {
            //        detail.bgColor = {'background-color': '#76EEC6;'};//green
            //    } else if (detail.paidType == '3') {
            //        detail.bgColor = {'background-color': '#FFEC8B;'};//yellow
            //    } else if (detail.paidType == '4') {
            detail.bgColor = {'background-color': '#FFAEB9;'};//red
            //    }
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
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {
            if ($scope.domain == 'CBI_BASE_ORDER_TYPE') {
                SalesOrderMaster.add($scope.source).success(function (data) {
                    $scope.showInfo('新增数据成功。');
                }).error(function (data) {
                    $scope.showError('新增失败:' + '<br>' + data.message);
                });

            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'CBI_BASE_ORDER_TYPE') {
                SalesOrderMaster.modify($scope.source.uuid, $scope.source).success(function (data) {
                    $scope.showInfo('修改数据成功。');
                }).error(function (data) {
                    $scope.showError('修改失败:' + '<br>' + data.message);
                });
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

    //$scope.confirmClickAction = function (event, item) {
    //    $scope.stopEventPropagation(event);
    //    if (item.confirm == Constant.CONFIRM[2].value) {
    //        $scope.showConfirm('确认取消审核吗？', '', function () {
    //            var UpdateInput = {
    //                uuid: item.uuid,
    //                confirm: Constant.CONFIRM[1].value
    //            };
    //            SalesOrderMaster.modify(item.uuid, UpdateInput).success(function () {
    //                item.confirm = Constant.CONFIRM[1].value;
    //                $scope.showInfo('取消审核成功！');
    //            }).error(function (response) {
    //                //$scope.showError($scope.getError(response.message));
    //                $scope.showError(response.message);
    //            });
    //        });
    //    } else {
    //        $scope.showConfirm('确认审核吗？', '', function () {
    //            var UpdateInput = {
    //                uuid: item.uuid,
    //                confirm: Constant.CONFIRM[2].value
    //            };
    //            SalesOrderMaster.modify(item.uuid, UpdateInput).success(function () {
    //                item.confirm = Constant.CONFIRM[2].value;
    //                $scope.showInfo('审核成功！');
    //            }).error(function (response) {
    //                //$scope.showError($scope.getError(response.message));
    //                $scope.showError(response.message);
    //            });
    //        });
    //    }
    //};

    $scope.confirmClickAction = function (event, item, confirmVal, bApplyAll) {
        $scope.stopEventPropagation(event);
        var action = "审核";
        if (confirmVal == 1) {
            action = "取消审核";
        }
        $scope.showConfirm('确认' + action + '吗？', '', function () {
            var detailUuids = "";
            angular.forEach(item.detailList, function (detail) {
                if (bApplyAll === true) {
                    if (detail.confirm != confirmVal) {
                        detailUuids += detail.uuid + ",";
                    }
                } else {
                    if (detail.confirm != confirmVal && detail.selected == true) {
                        detailUuids += detail.uuid + ",";
                    }
                }
            });
            //console.info(detailUuids);
            if (detailUuids != "") {
                PSOReturnSalesOrdersDetailsService.confirm(item.uuid, detailUuids, confirmVal).success(function (data) {
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

    $scope.transferClickAction = function (event, item, bApplyAll) {
        $scope.stopEventPropagation(event);

        $scope.showConfirm('确认抛转吗？', '', function () {
            var detailUuids = "";
            angular.forEach(item.detailList, function (detail) {
                if (bApplyAll === true) {
                    if (detail.transferReturnFlag != '1') {
                        detailUuids += detail.uuid + ",";
                    }
                } else {
                    if (detail.transferReturnFlag != '1' && detail.selected == true) {
                        detailUuids += detail.uuid + ",";
                    }
                }
            });
            if (detailUuids != "") {
                detailUuids = detailUuids.substring(0, detailUuids.length - 1);
            }

            if (detailUuids != "") {
                PSOReturnSalesOrdersDetailsService.transfer(item.uuid, detailUuids).success(function (response) {
                    if (response.status == 'COMPLETED') {
                        $scope.updateDetailsTransferState(item.detailList, detailUuids);
                        $scope.updateMasterStateByReturnDetails(item);
                        $scope.disableBatchMenuButtons();
                        $scope.disableDetailMenuButtons();
                        $scope.showInfo('预订单退货单抛转成功！');
                        $scope.getReturnOrderMasterCount();
                    } else {
                        if (response.message != undefined) {
                            $scope.showError('预订单退货单抛转失败,状态:' + response.status + '<br>' + response.message);
                        } else {
                            $scope.showError('预订单退货单抛转失败,状态:' + response.status);
                        }
                    }
                }).error(function (response) {
                    $scope.showError('预订单退货单抛转失败,状态:' + response.status + '<br>' + response.message);
                });
            } else {
                $scope.showWarn("请选择需要抛转的商品！");
            }
        });
    };


    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == Constant.STATUS[1].value) {
            $scope.showConfirm('确认改为失效吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[2].value
                };
                SalesOrderMaster.modify(item.uuid, UpdateInput).success(function () {
                    item.status = Constant.STATUS[2].value;
                    $scope.showInfo('修改为失效成功！');
                    $scope.getReturnOrderMasterCount();
                }).error(function (response) {
                    //$scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        } else {
            $scope.showConfirm('确认改为生效吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[1].value
                };
                SalesOrderMaster.modify(item.uuid, UpdateInput).success(function () {
                    item.status = Constant.STATUS[1].value;
                    $scope.showInfo('修改为生效成功！');
                    $scope.getReturnOrderMasterCount();
                }).error(function (response) {
                    //$scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        }
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status != '1' || item.confirm != '1') {
            $scope.showWarn('仅当预订单类型的状态是有效且未审核时才允许删除!');
            return;
        }
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            SalesOrderMaster.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
                $scope.getReturnOrderMasterCount();
            });
        });
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var noDeleteNos = '';
        var count = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.status == '1' && item.confirm == '1') {
                    var response = SalesOrderMaster.delete(item.uuid).success(function () {
                    });
                    promises.push(response);
                    count++;
                } else {
                    noDeleteNos = noDeleteNos + item.no + '<br>';
                }
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择任何状态是有效且未审核的可删除项目，请选择！');
            return;
        }
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if (noDeleteNos !== '') {
                $scope.showWarn('以下状态是失效或已审核的的项目将不会删除：' + '<br>' + noDeleteNos);
            }
            $q.all(promises).then(function (data) {
                //console.info(data);
                $scope.refreshList();
                $scope.showInfo('删除成功！');
                $scope.getReturnOrderMasterCount();
            }, function (data) {
                $scope.showError(data.message);
                $scope.showError(data.data.message);
            });
        });
    };

    //批量审核
    //$scope.confirmAllClickAction = function (event) {
    //    $scope.stopEventPropagation(event);
    //    var promises = [];
    //    var confirmedNos = '';
    //    var count = 0;
    //    angular.forEach($scope.itemList, function (item) {
    //        if (item.selected === true) {
    //            if (item.confirm != Constant.CONFIRM[2].value) {
    //                var UpdateInput = {
    //                    uuid: item.uuid,
    //                    confirm: Constant.CONFIRM[2].value
    //                };
    //                var response = SalesOrderMaster.modify(item.uuid, UpdateInput).success(function () {
    //                });
    //                promises.push(response);
    //                count++;
    //            } else {
    //                confirmedNos = confirmedNos + item.no + '<br>';
    //            }
    //        }
    //    });
    //    if (count == 0) {
    //        $scope.showWarn('没有选择任何未审核的项目，请先选择！');
    //        return;
    //    }
    //    if (confirmedNos !== '') {
    //        //confirmedNos = confirmedNos.substr(0, confirmedNos.length - 1);
    //        $scope.showWarn('以下已审核过的项目将不再次审核：' + '<br>' + confirmedNos);
    //    }
    //    $q.all(promises).then(function (data) {
    //        //console.info(data);
    //        $scope.refreshList();
    //        $scope.showInfo('审核成功！');
    //    }, function (data) {
    //        $scope.showError(data.message);
    //        $scope.showError(data.data.message);
    //    });
    //};

    $scope.confirmAllClickAction = function (event, confirmVal) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }

        var action = "审核";
        if (confirmVal == 1) {
            action = "取消审核";
        }
        $scope.showConfirm('确认' + action + '吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var detailUuids = "";
                    angular.forEach(item.detailList, function (detail) {
                        if (detail.confirm != confirmVal) {
                            detailUuids += detail.uuid + ",";
                        }
                    });

                    if (detailUuids != "") {
                        var response = PSOReturnSalesOrdersDetailsService.confirm(item.uuid, detailUuids, confirmVal).success(function (data) {
                            $scope.updateDetailsConfirmState(item.detailList, data);
                            $scope.updateMasterStateByReturnDetails(item);
                        }).error(function (response) {
                            bError = true;
                            $scope.showError('预订单退货单' + item.no + action + '失败：' + response.message);
                        });
                        promises.push(response);
                    } else {
                        $scope.showWarn("请选择需要" + action + "的预订单退货单！");
                    }
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('预订单退货单' + action + '成功！');
                    $scope.getReturnOrderMasterCount();
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

        var action = "抛转";
        $scope.showConfirm('确认' + action + '吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var detailUuids = "";
                    angular.forEach(item.detailList, function (detail) {
                        if (detail.transferReturnFlag != '1') {
                            detailUuids += detail.uuid + ",";
                        }
                    });
                    if (detailUuids != "") {
                        detailUuids = detailUuids.substring(0, detailUuids.length - 1);
                    }

                    if (detailUuids != "") {
                        var response = PSOReturnSalesOrdersDetailsService.transfer(item.uuid, detailUuids).success(function (response) {
                            if (response.status == 'COMPLETED') {
                                $scope.updateDetailsTransferState(item.detailList, detailUuids);
                                $scope.updateMasterStateByReturnDetails(item);
                                $scope.showInfo('预订单退货单抛转成功！');
                            } else {
                                bError = true;
                                if (response.message != undefined) {
                                    $scope.showError('预订单退货单' + item.no + '抛转失败,状态:' + response.status + '<br>' + response.message);
                                }
                                else {
                                    $scope.showError('预订单退货单' + item.no + '抛转失败,状态:' + response.status);
                                }
                            }
                        }).error(function (response) {
                            bError = true;
                            $scope.showError('预订单退货单' + item.no + action + '失败,状态:' + response.status + '<br>' + response.message);
                        });
                        promises.push(response);
                    } else {
                        $scope.showWarn("请选择需要" + action + "的预订单退货单！");
                    }
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('预订单退货单' + action + '成功！');
                    $scope.getReturnOrderMasterCount();
                }
                $scope.disableBatchMenuButtons();
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

    $scope.confirmDetailClickAction = function (event, item, confirmVal, detail) {
        $scope.stopEventPropagation(event);
        var action = "审核";
        if (confirmVal == 1) {
            action = "取消审核";
        }

        $scope.showConfirm('确认' + action + '吗？', '', function () {
            PSOReturnSalesOrdersDetailsService.confirm(item.uuid, detail.uuid, confirmVal).success(function (data) {
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

    $scope.transferDetailClickAction = function (event, item, detail) {
        $scope.stopEventPropagation(event);

        $scope.showConfirm('确认抛转吗？', '', function () {
            PSOReturnSalesOrdersDetailsService.transfer(item.uuid, detail.uuid).success(function (response) {
                if (response.status == 'COMPLETED') {
                    detail.transferReturnFlag = '1';
                    $scope.updateMasterStateByReturnDetails(item);
                    $scope.disableBatchMenuButtons();
                    $scope.disableDetailMenuButtons();
                    $scope.showInfo('预订单退货单抛转成功！');
                    $scope.getReturnOrderMasterCount();
                } else {
                    if (response.message != undefined) {
                        $scope.showError('预订单退货单抛转失败,状态:' + response.status + '<br>' + response.message);
                    }
                    else {
                        $scope.showError('预订单退货单抛转失败,状态:' + response.status);
                    }
                }
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    $scope.detailConfirmClickAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        if (detail.confirm == 2) {
            $scope.showConfirm('确认取消审核退货单身吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    confirm: '1'
                };
                PSOReturnSalesOrdersDetailsService.modify(detail.salesOrderMaster.uuid, UpdateInput).success(function (data) {
                    detail.confirm = '1';
                    //console.info("取消审核成功返回：");
                    //console.info(data);
                    $scope.showInfo('取消审核成功！');
                    $scope.getReturnOrderMasterCount();
                }).error(function (response) {
                    //$scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        } else {
            $scope.showConfirm('确认审核退货单身吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    confirm: '2'
                };
                PSOReturnSalesOrdersDetailsService.modify(detail.salesOrderMaster.uuid, UpdateInput).success(function (data) {
                    detail.confirm = '2';
                    //console.info("审核成功返回：");
                    //console.info(data);
                    $scope.showInfo('审核成功！');
                    $scope.getReturnOrderMasterCount();
                }).error(function (response) {
                    //$scope.showError($scope.getError(response.message));
                    $scope.showError(response.message);
                });
            });
        }
    };

    $scope.detailStatusClickAction = function (event, detail) {
        $scope.stopEventPropagation(event);
        if (detail.status == 1) {
            $scope.showConfirm('确认将退货单身改为失效吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    status: '2'
                };
                PSOReturnSalesOrdersDetailsService.modify(detail.salesOrderMaster.uuid, UpdateInput).success(function (data) {
                    detail.status = '2';
                    $scope.showInfo('设置失效成功！');
                    $scope.getReturnOrderMasterCount();
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            });
        } else {
            $scope.showConfirm('确认将退货单身改为生效吗？', '', function () {
                var UpdateInput = {
                    uuid: detail.uuid,
                    status: '1'
                };
                PSOReturnSalesOrdersDetailsService.modify(detail.salesOrderMaster.uuid, UpdateInput).success(function (data) {
                    detail.status = '1';
                    $scope.showInfo('设置生效成功成功！');
                    $scope.getReturnOrderMasterCount();
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            });
        }
    };


    //$scope.detailTransferClickAction = function (event, detail) {
    //    $scope.stopEventPropagation(event);
    //    if (detail.transferReturnFlag == 1) {
    //        $scope.showConfirm('确认重新抛转退货单身吗？', '', function () {
    //            var UpdateInput = {
    //                uuid: detail.uuid
    //            };
    //            PSOReturnSalesOrdersDetailsService.modify(detail.salesOrderMaster.uuid, UpdateInput).success(function (data) {
    //                //console.info("重新抛转成功返回：");
    //                //console.info(data);
    //                $scope.showInfo('重新抛转成功！');
    //            }).error(function (response) {
    //                //$scope.showError($scope.getError(response.message));
    //                $scope.showError(response.message);
    //            });
    //        });
    //    } else {
    //        $scope.showConfirm('确认抛转退货单身吗？', '', function () {
    //            var UpdateInput = {
    //                uuid: detail.uuid,
    //                transferReturnFlag: '1'
    //            };
    //            PSOReturnSalesOrdersDetailsService.modify(detail.salesOrderMaster.uuid, UpdateInput).success(function (data) {
    //                detail.transferReturnFlag = '1';
    //                $scope.showInfo('抛转成功！');
    //            }).error(function (response) {
    //                $scope.showError(response.message);
    //            });
    //        });
    //    }
    //};

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

    $scope.updateDetailsTransferState = function (details, transferredDetailUuids) {
        if (details != null && transferredDetailUuids != null) {
            angular.forEach(details, function (detail) {
                angular.forEach(transferredDetailUuids.split(','), function (detailUuid) {
                    if (detail.uuid == detailUuid) {
                        detail.transferReturnFlag = Constant.TRANSFER_PSO_FLAG[1].value;
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
            if (detail.transferReturnFlag == Constant.TRANSFER_PSO_FLAG[2].value || detail.transferReturnFlag == '') {
                transferPsoFlag = detail.transferReturnFlag;
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

            if (diffTransfer == true || diffConfirm == true) {
                $scope.disabledBatchTransfer = true;
            } else if (transfer == '1' || confirm == '1') { //已抛转或未审核
                $scope.disabledBatchTransfer = true;
            } else {
                $scope.disabledBatchTransfer = false;
            }
        }
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
            } else if (transfer == '1' || confirm == '1') {
                $scope.disabledDetailTransfer = true;
            } else {
                $scope.disabledDetailTransfer = false;
            }
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
