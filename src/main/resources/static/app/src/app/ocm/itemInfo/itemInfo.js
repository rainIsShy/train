angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/channelItemInfo', {
        controller: 'ChannelItemInfoController',
        templateUrl: 'app/src/app/ocm/itemInfo/itemInfo.html'
    })
}]);

angular.module('IOne-Production').controller('ChannelItemInfoController', function ($scope, $q, OCMParametersService, ProductionCatalogueDetails, ChannelService, ChannelItemInfoService, CatalogueTemplate, Catalogue, Production, $mdDialog, $timeout, Constant) {
    //initialize model value.
    $scope.STOP_SALE_FLAG = Constant.STOP_SALE_FLAG;
    $scope.listFilterItem = {
        itemUuids: []
    };
    $scope.ocmListMenu = {
        selectAll: false,
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        showQueryBar: true,
    };

    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: '9002AD3B-6B24-43DF-84B9-286FC005FC40'},
        '101-delete': {display: true, name: '删除', uuid: '31A2EB81-05F3-471D-8EAD-E1B100B641D4'},
        '102-edit': {display: true, name: '编辑', uuid: '5ED118EE-99C2-45DB-B4D5-1A80995DFA28'},
        //'109-copy': {display: true, name: '导入', uuid: ''},

        '200-cancel': {display: true, name: '取消新增', uuid: 'bd5bce23-4be1-4489-a303-1e709a4f9332'},
        '201-save': {display: true, name: '保存', uuid: '2c6e53b7-82db-438a-a8c2-91efbddf5e68'},
        //'202-continueAdd': {display: true, name: '继续导入商品', uuid: 'c4cb4449-0a9f-4aca-a454-62a34c7403e5'},

        '302-save': {display: true, name: '保存', uuid: '48263821-da76-44aa-93ea-75bd19835243'},
        '303-cancel': {display: true, name: '取消修改', uuid: '8c1d59c2-476d-424d-9a9e-099ec3f9ed8a'},
        '304-quit': {display: true, name: '退出编辑', uuid: '995679b5-da55-4bb6-8cf7-eecaeefb54d2'},
        //
        '611-selectAll': {display: true, name: '全选', uuid: ''}//,
        // '612-audit': {display: true, name: '审核', uuid: '2BC1695C-CF0F-4B01-B88E-6CAED78A2452'},
        // '613-revertAudit': {display: true, name: '取消审核', uuid: 'B6C422E7-C211-4C8F-854B-E46A1938B4DA'},
        // '614-valid': {display: true, name: '有效', uuid: '9C3D50A1-4389-412B-9C7E-37B46B61FA52'},
        // '615-invalid': {display: true, name: '无效', uuid: '12984716-C4B6-4A5C-8C77-D20F3D84951A'},
    };


    $scope.ocmListMenuDisplayOption = {
        '600-query': {display: true, name: '查询', uuid: ''},
        '601-selectAll': {display: true, name: '全选', uuid: ''},
        '602-audit': {display: true, name: '审核', uuid: ''},
        '603-revertAudit': {display: true, name: '取消审核', uuid: ''},
        '604-valid': {display: true, name: '有效', uuid: ''},
        '605-invalid': {display: true, name: '无效', uuid: ''}//,
    };

    $scope.pageOption = {
        sizePerPage: 14,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.pageOptionOfChannelPrice = {
        sizePerPage: 14,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.editItem = function (channel) {
        $scope.selectedItem = channel;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        $scope.pageOptionOfChannelPrice.currentPage = 0;
        $scope.pageOptionOfChannelPrice.totalPage = 0;
        $scope.pageOptionOfChannelPrice.totalElements = 0;
        $scope.listFilterItem.itemUuids.length = 0;
        $scope.queryChannelPriceWithPaging();


    };


    $scope.searchChannelPriceWithPaging = function () {
        //need reset paging everytime
        $scope.pageOptionOfChannelPrice.currentPage = 0;
        $scope.pageOptionOfChannelPrice.totalPage = 0;
        $scope.pageOptionOfChannelPrice.totalElements = 0;

        $scope.ocmListMenu.selectAll = false;
        $scope.selected = [];
        $scope.resetInitialValue();

        ChannelItemInfoService.getAllWithPaging($scope.pageOptionOfChannelPrice.sizePerPage, $scope.pageOptionOfChannelPrice.currentPage, $scope.selectedItem.uuid)
            .success(function (data) {
                $scope.ChannelInfoList = data;
                $scope.pageOptionOfChannelPrice.totalPage = data.totalPages;
                $scope.pageOptionOfChannelPrice.totalElements = data.totalElements;
            });
    };
    $scope.queryChannelPriceWithPaging = function () {
        $scope.ocmListMenu.selectAll = false;
        $scope.selected = [];
        $scope.resetInitialValue();

        ChannelItemInfoService.getAllWithPaging($scope.pageOptionOfChannelPrice.sizePerPage, $scope.pageOptionOfChannelPrice.currentPage, $scope.selectedItem.uuid)
            .success(function (data) {
                $scope.ChannelInfoList = data;
                $scope.pageOptionOfChannelPrice.totalPage = data.totalPages;
                $scope.pageOptionOfChannelPrice.totalElements = data.totalElements;
            });
    };

    $scope.queryMenuAction = function () {
        $scope.resetInitialValue();
        $scope.selected = [];
        $scope.ocmListMenu.selectAll = false;
        if ($scope.ocmListMenu.channelName !== undefined) {
            channelName = $scope.ocmListMenu.channelName;
        } else {
            channelName = null;
        }

        confirm = $scope.ocmListMenu.confirm;
        status = $scope.ocmListMenu.status;

        ChannelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, confirm,
            status, channelName, '', RES_UUID_MAP.OCM.CHANNEL_PRICE.LIST_PAGE.RES_UUID)
            .success(function (data) {
                $scope.ChannelList = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
                var channelUuid = "";
                angular.forEach($scope.ChannelList.content, function (channel) {
                    channelUuid = channelUuid + channel.uuid + ","
                });
                ChannelItemInfoService.getAllCountByChannelUuid(channelUuid).success(function (data) {
                    var map = [];
                    angular.forEach(data, function (channelItemCount) {
                        map[channelItemCount.uuid] = channelItemCount.itemCount;
                    });
                    angular.forEach($scope.ChannelList.content, function (channel) {
                        if (undefined != map[channel.uuid]) {
                            channel.channelPriceCount = map[channel.uuid];
                        } else {
                            channel.channelPriceCount = 0;
                        }
                    });
                });
            });
    };


    $scope.changeSaleDiscountRate = function (channelPrice) {
        channelPrice.salePrice = parseFloat((channelPrice.standardPrice * channelPrice.saleDiscountRate).toFixed(2));
    };

    $scope.changeSalePrice = function (channelPrice) {
        channelPrice.saleDiscountRate = parseFloat((channelPrice.salePrice / channelPrice.standardPrice).toFixed(4));
    };

    $scope.listTabSelected = function () {
        $scope.ocmListMenu.showQueryBar = true;
        $scope.queryMenuAction();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
        $scope.selected = [];
        $scope.ChannelInfoList = [];
        $scope.selectedItem = null;
        $scope.itemName = null;
        $scope.catalogueName = null;
        $scope.stopSaleFlag = null;
        $scope.saleDiscountRate = null;

        $scope.getMenuAuthData($scope.RES_UUID_MAP.OCM.CHANNEL_PRICE.LIST_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.formTabSelected = function () {
        $scope.ocmListMenu.showQueryBar = false;
        $scope.selected = [];
        $scope.getMenuAuthData($scope.RES_UUID_MAP.OCM.CHANNEL_PRICE.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };
    $scope.selected = [];
    $scope.toggle = function (item, selected) {
        var idx = selected.indexOf(item);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(item);
        }
        $scope.ocmListMenu.effectiveType = item.status;

        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            $scope.changeButtonStatus();
        }

    };

    $scope.resetInitialValue = function () {
        $scope.revert_audit_button_disabled = 0;
        $scope.audit_button_disabled = 0;
        $scope.valid_status_button_disabled = 0;
        $scope.invalid_status_button_disabled = 0;
    };
    $scope.changeButtonStatus = function () {
        $scope.resetInitialValue();
        var firstLoop = true;
        // only channel price will come into this logic
        angular.forEach($scope.selected, function (channelPrice) {
            $scope.changeButtonStatusByConfirm(channelPrice);
            $scope.changeButtonStatusByStatus(channelPrice);
            if (firstLoop) {
                firstLoop = false;
                $scope.firstLoopStatus = channelPrice.status;
                $scope.firstLoopConfirm = channelPrice.confirm;
            } else {
                if ($scope.firstLoopStatus !== channelPrice.status) {
                    $scope.valid_status_button_disabled = 1;
                    $scope.invalid_status_button_disabled = 1;
                }
                if ($scope.firstLoopConfirm !== channelPrice.confirm) {
                    $scope.audit_button_disabled = 1;
                    $scope.revert_audit_button_disabled = 1;
                }
            }
        });
    };
    $scope.changeButtonStatusByConfirm = function (channelPrice) {
//    'STATUS': {
//        0: {value: '0', name: '全部'},
//        1: {value: '1', name: '有效'},
//        2: {value: '2', name: '无效'}
//    },
//    'CONFIRM': {
//        0: {value: '0', name: '全部'},
//        1: {value: '1', name: '未审核'},
//        2: {value: '2', name: '已审核'}
//    },
        if (channelPrice.confirm == Constant.CONFIRM[1].value) {
            $scope.revert_audit_button_disabled = 1;
        } else {
            $scope.audit_button_disabled = 1;
        }

//已审核：可取消审核，不可有效、无效
//未审核：可审核，可有效，可无效
        if (channelPrice.confirm == Constant.CONFIRM[2].value) {
            $scope.valid_status_button_disabled = 1;
            $scope.invalid_status_button_disabled = 1;
        }
    };
    $scope.changeButtonStatusByStatus = function (channelPrice) {

//    'STATUS': {
//        0: {value: '0', name: '全部'},
//        1: {value: '1', name: '有效'},
//        2: {value: '2', name: '无效'}
//    },
//    'CONFIRM': {
//        0: {value: '0', name: '全部'},
//        1: {value: '1', name: '未审核'},
//        2: {value: '2', name: '已审核'}
//    },
        if (channelPrice.status == Constant.STATUS[1].value) {
            $scope.valid_status_button_disabled = 1;
        } else {
            $scope.invalid_status_button_disabled = 1;
        }

//           有效：可无效， 可审核或取消审核
//           无效：可有效，不可审核，取消审核
        if (channelPrice.status == Constant.STATUS[2].value) {
            $scope.audit_button_disabled = 1;
            $scope.revert_audit_button_disabled = 1;
        }
    };
    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.selectAllMenuAction = function () {
        if ($scope.ocmListMenu.selectAll == true) {
            $scope.selected = [];
            if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                angular.forEach($scope.ChannelInfoList.content, function (item) {
                    $scope.selected.push(item);
                });
                $scope.changeButtonStatus();
            } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                angular.forEach($scope.ChannelList.content, function (item) {
                    $scope.selected.push(item);
                });
            }
        } else if ($scope.ocmListMenu.selectAll == false) {
            $scope.selected = [];
        }
    };

    $scope.validStatusMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelPrice) {
                        var ChannelPriceUpdateInput = {
                            status: Constant.STATUS[1].value
                        };
                        var response = ChannelItemInfoService.modify(channelPrice.uuid, ChannelPriceUpdateInput).success(function () {

                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.editItem($scope.selectedItem);
                    })
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channel) {

                        var ChannelPriceUpdateInput = {
                            channelUuid: channel.uuid,
                            status: Constant.STATUS[1].value
                        };
                        var response = ChannelItemInfoService.modifyAll(ChannelPriceUpdateInput).success(function (data) {
                        });
                        promises.push(response);

                    });
                    $q.all(promises).then(function (data) {
                        $scope.showInfo('修改数据成功。');
                        $scope.queryMenuAction();
                    })
                }
            });
        }

    };

    $scope.invalidStatusMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelPrice) {
                        var ChannelPriceUpdateInput = {
                            status: Constant.STATUS[2].value
                        };
                        var response = ChannelItemInfoService.modify(channelPrice.uuid, ChannelPriceUpdateInput).success(function () {

                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.editItem($scope.selectedItem);
                    })
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channel) {
                        var ChannelPriceUpdateInput = {
                            channelUuid: channel.uuid,
                            status: Constant.STATUS[2].value
                        };
                        var response = ChannelItemInfoService.modifyAll(ChannelPriceUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.queryMenuAction();
                    })
                }
            });
        }

    };


    $scope.revertAuditMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelPrice) {
                        var ChannelPriceUpdateInput = {
                            confirm: Constant.CONFIRM[1].value
                        };
                        var response = ChannelItemInfoService.modify(channelPrice.uuid, ChannelPriceUpdateInput).success(function () {

                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.editItem($scope.selectedItem);
                    })
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channel) {
                        var ChannelPriceUpdateInput = {
                            channelUuid: channel.uuid,
                            confirm: Constant.CONFIRM[1].value
                        };
                        var response = ChannelItemInfoService.modifyAll(ChannelPriceUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.queryMenuAction();
                    })
                }
            });
        }

    };

    $scope.auditMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认审核吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelPrice) {
                        var ChannelPriceUpdateInput = {
                            confirm: Constant.CONFIRM[2].value
                        };
                        var response = ChannelItemInfoService.modify(channelPrice.uuid, ChannelPriceUpdateInput).success(function () {

                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.editItem($scope.selectedItem);
                    })
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channel) {
                        var ChannelPriceUpdateInput = {
                            channelUuid: channel.uuid,
                            confirm: Constant.CONFIRM[2].value
                        };
                        var response = ChannelItemInfoService.modifyAll(ChannelPriceUpdateInput).success(function (data) {
                        });
                        promises.push(response);

                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.queryMenuAction();
                    })
                }
            });
        }
    };


    $scope.createPromptMsg = function () {
        var msg = "";

        if (undefined != $scope.itemName && null != $scope.itemName && $scope.itemName.lenth != 0) {
            msg = msg + " 商品名称:" + $scope.itemName;
        }

        return msg;
    };

    //Save modification.
    $scope.modifyMenuAction = function () {
        if ($scope.ChannelInfoList) {
            var promises = [];
            angular.forEach($scope.ChannelInfoList.content, function (channelInfo) {
                var response = ChannelItemInfoService.modify(channelInfo.uuid, channelInfo).success(function (data) {
                });
                promises.push(response);
            });
            $q.all(promises).then(function () {
                $scope.showInfo('修改数据成功。');
            })
        }
    };

    $scope.cancelModifyMenuAction = function () {
        $scope.searchChannelPriceWithPaging();
    };

    $scope.exitModifyMenuAction = function () {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        $scope.ocmListMenu.selectAll == false;
    };

    $scope.preAddMenuAction = function () {
        $scope.ocmListMenu.showQueryBar = false;
        $scope.selected = [];

        //bak
        $scope.ExistedChannelInfoList = $scope.ChannelInfoList;
        //loop
        $scope.ChannelInfoList = {content: []};

        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
        $scope.openProductionSelectDlg();
    };

    $scope.continueAddMenuAction = function () {
        $scope.openProductionSelectDlg();
    };

    $scope.addMenuAction = function () {
        if ($scope.ChannelInfoList.content != undefined && $scope.ChannelInfoList.content.length > 0) {
            var promises = [];

            angular.forEach($scope.ChannelInfoList.content, function (channelInfo) {
                channelInfo.channelUuid = $scope.selectedItem.uuid;
                channelInfo.itemUuid = channelInfo.item.uuid;
                var channelInfoResponse = ChannelItemInfoService.add(channelInfo).error(function (data) {
                    $scope.showError(data.message);
                });
                promises.push(channelInfoResponse);
            });

            $q.all(promises).then(function (data) {
                $scope.showInfo('新增渠道商品定价成功。');
                $scope.editItem($scope.selectedItem);
            }, function (data) {
                $scope.showInfo('新增渠道商品信息完成。');
                $scope.editItem($scope.selectedItem);
            });
        } else {
            $scope.ChannelInfoList = $scope.ExistedChannelInfoList;
        }
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.cancelAddMenuAction = function () {
        $scope.editItem($scope.selectedItem);
    };

    $scope.deleteMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除的渠道商品信息不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelItemInfo) {
                        var response = ChannelItemInfoService.delete(channelItemInfo.uuid).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('删除数据成功。');
                        $scope.editItem($scope.selectedItem);
                    });
                }
            });
        }
    };


    $scope.openProductionSelectDlg = function () {
        $mdDialog.show({
            controller: 'ProductionSelectItemController',
            templateUrl: 'app/src/app/ocm/itemInfo/productionSelectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                channel: $scope.selectedItem,
                listFilterItem: $scope.listFilterItem.itemUuids,
                op: 'add'
            }
        }).then(function (data) {
            $scope.logining = true;
            $scope.populateChannelPrice(data);

        });
    };


    $scope.populateChannelPrice = function (data) {
        var content = [];
        var channelPrice = {
            channel: $scope.selectedItem,
            item: data,
            stopSaleFlag: 'N',
            salePrice: 0,
            saleUnit: ''

        };
        content.push(channelPrice);

        $scope.ChannelInfoList.content = $scope.ChannelInfoList.content.concat(content);

        if (content.length == 0) {
            $scope.showInfo('当前目录没有商品或者商品已经导入！');
        }
        $scope.logining = false;
    };
});


angular.module('IOne-Production').controller('ProductionSelectItemController', function ($scope, $mdDialog, Production, Catalogue, ProductionCatalogueDetails, Constant, channel, listFilterItem) {
    $scope.listFilterItem = listFilterItem;
    $scope.channel = channel;
    $scope.pageOptionForProd = {
        sizePerPage: 1000,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[1].value,
        confirm: Constant.CONFIRM[2].value,
        release: Constant.RELEASE[2].value
    };

    $scope.$watch('listFilterOption', function () {
        $scope.refreshAllTemplate();
    }, true);

    $scope.selectedTemplateData = {};


    $scope.refreshAllTemplate = function () {
        Production.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.release, $scope.listFilterOption.status, 0, 0).success(function (data) {
            var dataResult = [];
            angular.forEach(data.content, function (item) {
                if ($scope.listFilterItem.indexOf(item.uuid) == -1)
                    dataResult.push(item);
            });
            $scope.allProductionsData = dataResult;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });

        $scope.selectedItem = null;
        $scope.selectedTemplateNode = null;
        $scope.selectedTemplateNodeData = null;
        $scope.selectedTemplateNodeDataUuid = null;
    };

    $scope.select = function (selectedObject) {
        $scope.selectedTemplateNode = selectedObject;
        $mdDialog.hide($scope.selectedTemplateNode);
    };


    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});
