angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/channelPrice', {
        controller: 'ChannelPriceController',
        templateUrl: 'app/src/app/ocm/channel_price/channelPrice.html'
    })
}]);

angular.module('IOne-Production').controller('ChannelPriceController', function ($scope, $q, OCMParametersService, WarehousesService, ChannelService, ChannelPriceService, ChannelLevelService, CatalogueTemplate, Catalogue, ProductionCatalogueDetails, $mdDialog, $timeout, Constant) {
    //initialize model value.
    $scope.ocmListMenu = {
        selectAll: false,
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        showQueryBar: true,
    };

    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: '885E841C-03FE-4DE9-A393-27C5D860C20F'},
        '101-delete': {display: false, name: '删除', uuid: '6C46231A-FC5B-4F1E-9325-2DC6A8136BB4'},
        '102-edit': {display: true, name: '编辑', uuid: '4A7E5038-2319-4089-AE5D-FDCB32C3FFB5'},
        '109-copy': {display: true, name: '导入', uuid: 'C1E09C8F-489B-4E92-AED9-7A185DE3E989'},
        '110-syncPrice': {display: true, name: '同步定价', uuid: '4dceb5a1-41ac-4cae-87b9-f6b2a12d2093'},
        '301-delete': {display: true, name: '清空', uuid: 'c47d30c5-6550-45a2-9b4c-931895ef8f1c'},

        '200-cancel': {display: true, name: '取消新增', uuid: '8536C6CE-75F0-46F4-9CFA-A3DE2AB371CE'},
        '201-save': {display: true, name: '保存', uuid: 'C03E7689-267F-4A6B-AA7D-88A99C9CEFF0'},
        '202-continueAdd': {display: true, name: '继续导入商品', uuid: 'A9B52AFC-55C3-4AD2-A6CC-2E45EFD8F29C'},


        '302-save': {display: true, name: '保存', uuid: '01673539-3C67-4E76-B616-3767B07E6922'},
        '303-cancel': {display: true, name: '取消修改', uuid: 'FD70B726-FF76-45B4-B667-BB778B3C2AA9'},
        '304-quit': {display: true, name: '退出编辑', uuid: '63367BAD-6D79-4994-B420-EBFAA30D8357'},

        '611-selectAll': {display: true, name: '全选', uuid: ''},
        '612-audit': {display: true, name: '审核', uuid: '2BC1695C-CF0F-4B01-B88E-6CAED78A2452'},
        '613-revertAudit': {display: true, name: '取消审核', uuid: 'B6C422E7-C211-4C8F-854B-E46A1938B4DA'},
        '614-valid': {display: true, name: '有效', uuid: '9C3D50A1-4389-412B-9C7E-37B46B61FA52'},
        '615-invalid': {display: true, name: '无效', uuid: '12984716-C4B6-4A5C-8C77-D20F3D84951A'}
    };


    $scope.ocmListMenuDisplayOption = {
        '600-query': {display: true, name: '查询', uuid: 'ABF33FF5-D32C-4E8C-8AF1-6436E00AC244'},
        '601-selectAll': {display: true, name: '全选', uuid: 'AAA16052-5A07-4582-A6FB-D45AE5A7A4A0'},
        '602-audit': {display: true, name: '审核', uuid: '69C01DDB-8BE3-4920-B757-EB448EF66B9A'},
        '603-revertAudit': {display: true, name: '取消审核', uuid: '4160BFAF-08DB-4EFE-95D2-642928450A1A'},
        '604-valid': {display: true, name: '有效', uuid: '0BE2ACF6-90D3-4C16-AE8F-74E5B589B217'},
        '605-invalid': {display: true, name: '无效', uuid: 'E3951469-7BB5-4786-9A4C-5FF7C785D574'},
    };

    $scope.menuAction = function (menuId, $event) {
        //Main menu
        if (menuId == 100) {
            $scope.preAddMenuAction();
        } else if (menuId == 101) {
            $scope.deleteMenuAction();
        } else if (menuId == 102) {
            $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
        } else if (menuId == 103) {
            $scope.copyMenuAction();
        } else if (menuId == 104) {
            $scope.statusMenuAction();
        } else if (menuId == 105) {
            $scope.confirmMenuAction();
        } else if (menuId == 106) {
            $scope.releaseMenuAction();
        } else if (menuId == 107) {
            $scope.changeMenuAction();
        } else if (menuId == 108) {
            $scope.changeHistoryMenuAction();
        } else if (menuId == 109) {
            $scope.copyChannelPrice();
        } else if (menuId == 110) {
            $scope.syncChannelPrice();
        }

        //Add menu
        if (menuId == 200) {
            $scope.cancelAddMenuAction();
        } else if (menuId == 201) {
            $scope.addMenuAction();
        } else if (menuId == 202) {
            $scope.continueAddMenuAction();
        }


        //Modify menu
        if (menuId == 300) {
            $scope.addNodeMenuAction($event);
        } else if (menuId == 301) {
            $scope.deleteNodeMenuAction($event);
        } else if (menuId == 302) {
            $scope.modifyMenuAction();
        } else if (menuId == 303) {
            $scope.cancelModifyMenuAction();
        } else if (menuId == 304) {
            $scope.exitModifyMenuAction();
        }

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

        $scope.queryChannelPriceWithPaging();


        WarehousesService.getAll().success(function (data) {
            $scope.warehouses = data;
        });

        ChannelLevelService.getAll(100, 0, '', '', '', '', '', '', $scope.selectedItem.uuid, '', '').success(function (data) {
            if (data.totalElements) {

            }
        });

    };


    $scope.searchChannelPriceWithPaging = function () {
        //need reset paging everytime
        $scope.pageOptionOfChannelPrice.currentPage = 0;
        $scope.pageOptionOfChannelPrice.totalPage = 0;
        $scope.pageOptionOfChannelPrice.totalElements = 0;

        $scope.ocmListMenu.selectAll = false;
        $scope.selected = [];
        $scope.resetInitialValue();

        ChannelPriceService.getAllWithPaging($scope.pageOptionOfChannelPrice.sizePerPage, $scope.pageOptionOfChannelPrice.currentPage, $scope.selectedItem.uuid, $scope.catalogueName, $scope.itemName, $scope.warehouseUuid)
            .success(function (data) {
                $scope.parseCatalogueName(data);
                $scope.ChannelPriceList = data;
                $scope.pageOptionOfChannelPrice.totalPage = data.totalPages;
                $scope.pageOptionOfChannelPrice.totalElements = data.totalElements;
            });
    };

    $scope.queryChannelPriceWithPaging = function () {
        $scope.ocmListMenu.selectAll = false;
        $scope.selected = [];
        $scope.resetInitialValue();

        ChannelPriceService.getAllWithPaging($scope.pageOptionOfChannelPrice.sizePerPage, $scope.pageOptionOfChannelPrice.currentPage, $scope.selectedItem.uuid, $scope.catalogueName, $scope.itemName)
            .success(function (data) {
                $scope.parseCatalogueName(data);
                $scope.ChannelPriceList = data;
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
        if ($scope.ocmListMenu.channelNo !== undefined) {
            channelNo = $scope.ocmListMenu.channelNo;
        } else {
            channelNo = null;
        }

        confirm = $scope.ocmListMenu.confirm;
        status = $scope.ocmListMenu.status;

        ChannelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, confirm,
            status, channelName, channelNo, RES_UUID_MAP.OCM.CHANNEL_PRICE.LIST_PAGE.RES_UUID)
            .success(function (data) {
                $scope.ChannelList = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
                var channelUuid = "";
                angular.forEach($scope.ChannelList.content, function (channel) {
                    channelUuid = channelUuid + channel.uuid + ","
                });
                ChannelPriceService.getAllCountByChannelUuid(channelUuid).success(function (data) {
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
        $scope.ChannelPriceList = [];
        $scope.selectedItem = null;
        $scope.itemName = null;
        $scope.catalogueName = null;
        $scope.standardPriceDiscountRate = null;
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
                angular.forEach($scope.ChannelPriceList.content, function (item) {
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
                        var response = ChannelPriceService.modify(channelPrice.uuid, ChannelPriceUpdateInput).success(function () {

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
                        var response = ChannelPriceService.modifyAll(ChannelPriceUpdateInput).success(function (data) {
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
                        var response = ChannelPriceService.modify(channelPrice.uuid, ChannelPriceUpdateInput).success(function () {

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
                        var response = ChannelPriceService.modifyAll(ChannelPriceUpdateInput).success(function (data) {
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
                        var response = ChannelPriceService.modify(channelPrice.uuid, ChannelPriceUpdateInput).success(function () {

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
                        var response = ChannelPriceService.modifyAll(ChannelPriceUpdateInput).success(function (data) {
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
                        var response = ChannelPriceService.modify(channelPrice.uuid, ChannelPriceUpdateInput).success(function () {

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
                        var response = ChannelPriceService.modifyAll(ChannelPriceUpdateInput).success(function (data) {
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

    $scope.updateStandardPriceInBatch = function () {
        if (undefined != $scope.standardPriceDiscountRate && null != $scope.standardPriceDiscountRate) {
            var msg = $scope.createPromptMsg();

            $scope.showConfirm('确认批量价格维护吗？', msg, function () {
                $scope.logining = true;
                ChannelPriceService.updateStandardPriceInBatch($scope.selectedItem.uuid, $scope.catalogueName, $scope.itemName, $scope.warehouseUuid, $scope.standardPriceDiscountRate)
                    .success(function (data) {
                        $scope.logining = false;
                        $scope.showInfo('修改数据成功。');
                        $scope.searchChannelPriceWithPaging();
                    }).error(function (data) {
                    $scope.logining = false;
                    $scope.showError(data.message);
                });
            });
        }
    };
    $scope.updateSalePriceInBatch = function () {
        if (undefined != $scope.saleDiscountRate && null != $scope.saleDiscountRate) {
            var msg = $scope.createPromptMsg();
            $scope.showConfirm('确认批量折扣维护吗？', msg, function () {
                $scope.logining = true;
                ChannelPriceService.updateSalePriceInBatch($scope.selectedItem.uuid, $scope.catalogueName, $scope.itemName, $scope.warehouseUuid, $scope.saleDiscountRate)
                    .success(function (data) {
                        $scope.logining = false;
                        $scope.showInfo('修改数据成功。');
                        $scope.searchChannelPriceWithPaging();
                    }).error(function (data) {
                    $scope.showError(data.message);
                });
            });
        }
    };
    $scope.updateWarehouseInBatch = function () {
        if (undefined != $scope.warehouseUpdatedUuid && null != $scope.warehouseUpdatedUuid) {
            var msg = $scope.createPromptMsg();
            $scope.showConfirm('确认批量仓库维护吗？', msg, function () {
                $scope.logining = true;
                ChannelPriceService.updateWarehouseInBatch($scope.selectedItem.uuid, $scope.catalogueName, $scope.itemName, $scope.warehouseUuid, $scope.warehouseUpdatedUuid)
                    .success(function (data) {
                        $scope.logining = false;
                        $scope.showInfo('修改数据成功。');
                        $scope.searchChannelPriceWithPaging();
                    }).error(function (data) {
                    $scope.showError(data.message);
                });
            });
        }
    };
    $scope.createPromptMsg = function () {
        var msg = "";
        if (undefined != $scope.catalogueName && null != $scope.catalogueName && $scope.catalogueName.lenth != 0) {
            msg = "目录名称:" + $scope.catalogueName;
        }
        if (undefined != $scope.itemName && null != $scope.itemName && $scope.itemName.lenth != 0) {
            msg = msg + " 商品信息:" + $scope.itemName;
        }
        if (undefined != $scope.warehouseUuid && null != $scope.warehouseUuid && $scope.warehouseUuid.lenth != 0) {
            angular.forEach($scope.warehouses.content, function (warehouse) {
                if (warehouse.uuid == $scope.warehouseUuid) {
                    msg = msg + " 仓库:" + warehouse.name;
                }
            });
        }
        return msg;
    };

    //Save modification.
    $scope.modifyMenuAction = function () {
        if ($scope.ChannelPriceList) {
            var promises = [];
            angular.forEach($scope.ChannelPriceList.content, function (channelPrice) {
                var response = ChannelPriceService.modify(channelPrice.uuid, channelPrice).success(function (data) {
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
        $scope.ExistedChannelPriceList = $scope.ChannelPriceList;
        //loop
        $scope.ChannelPriceList = {content: []};

        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
        $scope.openProductionSelectDlg();
    };

    $scope.continueAddMenuAction = function () {
        $scope.openProductionSelectDlg();
    };

    $scope.addMenuAction = function () {
        if ($scope.ChannelPriceList.content != undefined && $scope.ChannelPriceList.content.length > 0) {
            var promises = [];

            angular.forEach($scope.ChannelPriceList.content, function (channelPrice) {
                channelPrice.channelUuid = $scope.selectedItem.uuid;
                channelPrice.catalogueUuid = channelPrice.catalogue.uuid;
                channelPrice.itemUuid = channelPrice.item.uuid;
                var channelPriceResponse = ChannelPriceService.add(channelPrice).error(function (data) {
                    $scope.showError(data.message);
                });
                promises.push(channelPriceResponse);
            });

            $q.all(promises).then(function (data) {
                $scope.showInfo('新增渠道商品定价成功。');
                $scope.editItem($scope.selectedItem);
            }, function (data) {
                $scope.showInfo('新增渠道商品定价完成。');
                $scope.editItem($scope.selectedItem);
            });
        } else {
            $scope.ChannelPriceList = $scope.ExistedChannelPriceList;
        }
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.parseCatalogueName = function (data) {
        angular.forEach(data.content, function (channelPrice) {
            var catalogue = channelPrice.catalogue;
            if (null != catalogue) {
                var catalogueName = catalogue.name;
                while (catalogue.parentCatalogue != null) {
                    var catalogue = catalogue.parentCatalogue;
                    catalogueName = catalogue.name + "->" + catalogueName;
                }
                channelPrice.catalogueName = catalogueName;
            }

        });
    };

    $scope.cancelAddMenuAction = function () {
        $scope.editItem($scope.selectedItem);
    };


    $scope.deleteMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除的商品定价不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelPrice) {

                        var response = ChannelPriceService.delete(channelPrice.uuid).success(function (data) {
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

    $scope.deleteNodeMenuAction = function () {
        $scope.showConfirm('确认清空吗？', '清空的商品定价不可恢复。', function () {
            ChannelPriceService.deleteByChannel($scope.selectedItem.uuid).success(function (data) {
                $scope.showInfo('清空数据成功。');
                $scope.editItem($scope.selectedItem);
            });
        });
    };

    $scope.copyChannelPrice = function () {
        $mdDialog.show({
            controller: 'OCMChannelSearchController',
            templateUrl: 'app/src/app/ocm/channel_price/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {

            $scope.selectedItem.sourceChannel = data;
            $scope.selectedItem.sourceChannelUuid = data.uuid;
            ChannelPriceService.copy($scope.selectedItem.sourceChannelUuid, $scope.selectedItem.uuid).success(function (data) {
                if (data.status == "COMPLETED") {
                    $scope.showInfo('拷贝渠道商品定价完成。');
                    $scope.editItem($scope.selectedItem);
                } else {
                    $scope.showError('拷贝渠道商品定价失败。');
                }
            }).error(function (data) {
                $scope.showError('拷贝渠道商品定价失败。');
            });
        });

    };

    $scope.syncChannelPrice = function () {
        $scope.showConfirm('确认同步定价吗？', '', function () {
            $scope.logining = true;
            ChannelService.syncChannelPrice($scope.selectedItem.uuid)
                .success(function (data) {
                    $scope.logining = false;
                    $scope.showInfo('同步定价成功。');
                    $scope.editItem($scope.selectedItem);
                }).error(function (data) {
                $scope.logining = false;
                $scope.showError(data.message);
            });
        });
    };

    $scope.deleteNodeMenuAction = function () {
        $scope.showConfirm('确认清空吗？', '清空的商品定价不可恢复。', function () {
            ChannelPriceService.deleteByChannel($scope.selectedItem.uuid).success(function (data) {
                $scope.showInfo('清空数据成功。');
                $scope.editItem($scope.selectedItem);
            });
        });
    };


    $scope.openProductionSelectDlg = function () {
        $mdDialog.show({
            controller: 'ProductionSelectController',
            templateUrl: 'app/src/app/ocm/channel_price/productionSelectDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                channel: $scope.selectedItem,
                op: 'add'
            }
        }).then(function (data) {
            $scope.nodeDataUuid = data.nodeDataUuid;
            $scope.logining = true;
            ProductionCatalogueDetails.getByCatalogueAndChannel(data.nodeDataUuid, $scope.selectedItem.uuid,
                RES_UUID_MAP.OCM.CHANNEL_PRICE.ADD.RES_UUID).success(function (data) {
                $scope.logining = false;
                if (null != data && data.length > 50) {
                    $scope.showConfirm('当前目录下商品数为' + data.length, '确认导入当前目录下的所有商品定价吗？', function () {
                        $scope.logining = true;
                        ProductionCatalogueDetails.postByCatalogueAndChannel($scope.nodeDataUuid, $scope.selectedItem.uuid,
                            RES_UUID_MAP.OCM.CHANNEL_PRICE.ADD.RES_UUID).success(function (data) {
                            $scope.logining = false;
                            $scope.showInfo('新增渠道商品定价成功。');
                            $scope.editItem($scope.selectedItem);
                        });
                    });
                } else {
                    $scope.populateChannelPrice(data);
                }

            });
        });
    };

    OCMParametersService.getAll().success(function (ocmParameterData) {
        $scope.standardPriceCoefficient = ocmParameterData.content[0].standardPriceCoefficient;
        $scope.saleDiscountRateFromServer = ocmParameterData.content[0].saleDiscountRate;
    });

    $scope.populateChannelPrice = function (data) {
        if (data && data.length > 0) {
            var content = [];
            angular.forEach(data, function (link) {
                var catalogue = link.catalogue;
                var catalogueName = catalogue.name;
                while (catalogue.parentCatalogue != null) {
                    var catalogue = catalogue.parentCatalogue;
                    catalogueName = catalogue.name + "->" + catalogueName;
                }
                var standardPriceVar = parseFloat((link.item.suggestPrice * $scope.standardPriceCoefficient).toFixed(0));
                var salePriceVar = parseFloat((standardPriceVar * $scope.saleDiscountRateFromServer ).toFixed(2));
                var channelPrice = {
                    channel: $scope.selectedItem,
                    catalogue: link.catalogue,
                    item: link.item,
//                         standardPrice:link.item.suggestPrice,
                    saleDiscountRate: 0.6,
                    standardPrice: standardPriceVar,
                    salePrice: salePriceVar,
//                         salePrice:link.item.suggestPrice,
                    confirm: 1,
                    status: 1,
                    catalogueName: catalogueName
                };
                content.push(channelPrice);
            });


            $scope.ChannelPriceList.content = $scope.ChannelPriceList.content.concat(content);


            if (content.length == 0) {
                $scope.showInfo('当前目录没有商品或者商品已经导入！');
            }

        }
    };
})
;

angular.module('IOne-Production').controller('OCMChannelSearchController', function ($scope, $mdDialog, ChannelService, Constant) {
    $scope.pageOption = {
        sizePerPage: 6,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };
    $scope.RES_UUID_MAP = RES_UUID_MAP;
    $scope.refreshChannel = function () {
        ChannelService.getAllGlobalQuery($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword, $scope.RES_UUID_MAP.CBI.CHANNEL.RES_UUID).success(function (data) {
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


angular.module('IOne-Production').controller('ProductionSelectController', function ($scope, $mdDialog, CatalogueTemplate, Catalogue, ProductionCatalogueDetails, Constant, channel) {
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

    $scope.nodeDataClickHandler = function ($event) {
        if ($event && $event.stopPropagation) {
            $event.stopPropagation();
        }
        if ($event && $event.preventDefault) {
            $event.preventDefault();
        }
    };

    $scope.refreshAllTemplate = function () {
        CatalogueTemplate.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.status, $scope.listFilterOption.confirm, $scope.listFilterOption.release).success(function (data) {
            $scope.catalogueTemplates = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            var setFirstOpen = false;

            if (data && data.content) {
                $scope.selectedTemplateData = {};
                $scope.selectedTemplateNodeDataUI = {};
                angular.forEach(data.content, function (content) {

                    if (content && content.details) {
                        //display them all by default.
                        content.display = true;
                        content.open = false;

                        content.dataStatus = content.dataStatus == null ? 2 : 1;
                        content.dataConfirm = content.dataConfirm == null ? 1 : 2;
                        content.dataRelease = content.dataRelease == null ? 1 : 2;

                        //Put a index in the node to easy the use of mdChips
                        angular.forEach(content.details, function (node, index) {
                            node.index = index;
                        });

                        //Open the first one by default.
                        if (content.details.length > 0) {
                            if (setFirstOpen == false) {
                                content.open = true;
                                setFirstOpen = true;
                            }
                            //Get the data of first root node
                            $scope.refreshTemplateData(content, content.details[0]);
                        }
                    }
                });
            }
        });

        $scope.selectedItem = null;
        $scope.selectedTemplateNode = null;
        $scope.selectedTemplateNodeData = null;
        $scope.selectedTemplateNodeDataUuid = null;
    };


    //Refresh the data of one template
    $scope.refreshTemplateData = function (template, node) {
        //Refresh only when there is data for this template
        if (template && template.details && template.details.length > 0) {

            var dataHandler = function (template, node, data) {
                angular.forEach(data, function (item) {
                    item.catalogueTemplateDetail.index = node.index;
                });
                //template object
                var content = $scope.selectedTemplateData[template.uuid];
                if (content == undefined || content == null) {
                    content = [data];
                    $scope.selectedTemplateData[template.uuid] = content;
                    $scope.refreshUI(template);
                }
            };

            //Get the first node data
//             this.getForRootWithFilter = function(templateDetailUuid,resUuid,cptUuids,cptNames) {
//             Catalogue.getForRootWithFilter(node.uuid,$scope.channel.uuid,'32D037F8-DB58-4BC2-A64F-7283356C4564','catalogue').success(function(data) {
            Catalogue.getForRootWithFilter(node.uuid, RES_UUID_MAP.OCM.CHANNEL_PRICE.ADD.RES_UUID).success(function (data) {
                dataHandler(template, node, data.content);
            });

        }
    };

    $scope.refreshUI = function (template) {
        $scope.selectedTemplateNodeDataUI[template.uuid] = {};

        angular.forEach(template.details, function (item) {
            $scope.selectedTemplateNodeDataUI[template.uuid][item.index] = item.name;

            if ($scope.selectedTemplateData[template.uuid][item.index]) {
                angular.forEach($scope.selectedTemplateData[template.uuid][item.index], function (data) {
                    if (angular.isDefined(data.selected) && data.selected) {
                        $scope.selectedTemplateNodeDataUI[template.uuid][item.index] = data.name;
                    }
                });
            }
        });
    };

    $scope.refreshProduction = function (catalogueUuid) {
        ProductionCatalogueDetails.getByCatalogueAndChannel(catalogueUuid, $scope.channel.uuid).success(function (data) {
            $scope.linkData = data;
        });
    };

    $scope.nodeDataChangeHandler = function (template, node, nodeDataList, nodeDataUuid) {
        if ($scope.isRefreshing) {
            return;
        }
        //Delete all sub data of current node
        $scope.selectedTemplateData[template.uuid].splice(node.index + 1);
        $scope.selectedTemplateNode = node;
        $scope.selectedTemplateNodeDataUuid = nodeDataUuid;

        angular.forEach(nodeDataList, function (item) {
            if (item.uuid == nodeDataUuid) {
                item.selected = true;
                $scope.selectedTemplateNodeData = item;
            } else {
                item.selected = false;
            }
        });

        $scope.refreshUI(template);
//         $scope.refreshProduction(nodeDataUuid);
        $scope.nodeDataUuid = nodeDataUuid;

        var nextNode = template.details[node.index + 1];

        //Already the last node
        if (nextNode == undefined || nextNode == undefined) {

        } else {
            $scope.isRefreshing = true;

//             Catalogue.getWithFilter(nextNode.uuid, nodeDataUuid,'6FD91D15-A8BB-4C91-A124-8CE4C756887F','32D037F8-DB58-4BC2-A64F-7283356C4564','catalogue').success(function(data) {

            Catalogue.get(nextNode.uuid, nodeDataUuid,
                RES_UUID_MAP.OCM.CHANNEL_PRICE.ADD.RES_UUID).success(function (data) {

                if (data && data.content && data.content.length > 0) {
                    $scope.selectedTemplateData[template.uuid].push(data.content);
                }
                $scope.isRefreshing = false;
            }).error(function () {
                $scope.isRefreshing = false;
            });
        }
    };

    $scope.nodeDataClickHandler = function ($event) {
        if ($event && $event.stopPropagation) {
            $event.stopPropagation();
        }
        if ($event && $event.preventDefault) {
            $event.preventDefault();
        }
    };

    $scope.openQuickView = function ($event, production) {
        $mdDialog.show({
            controller: 'QuickViewController',
            templateUrl: 'app/src/app/production/production/quick_view.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                productionUuid: production.uuid
            }
        }).then(function (data) {

        });

        $event.stopPropagation();
        $event.preventDefault();
    };

    $scope.hideDlg = function () {
        $mdDialog.hide({
            'nodeDataUuid': $scope.nodeDataUuid
        });
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});




