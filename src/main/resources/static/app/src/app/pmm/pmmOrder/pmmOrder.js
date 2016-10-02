angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/pmmOrder', {
        controller: 'PmmOrderController',
        templateUrl: 'app/src/app/pmm/pmmOrder/bookingSlip.html'
    })
}]);

angular.module('IOne-Production').controller('PmmOrderController', function ($scope, $q, PmmOrderMaster, PmmOrderDetail, PmmOrderExtendDetail, PmmOrderExtendDetail2, OrderItemCustomDetail, OrderCustomScope, OrderChannelCurrency, OrderChannelTax, SaleTypes, CBIEmployeeService, $mdDialog, $timeout, Constant, ErpAdapterService) {

    //initialize model value.
    $scope.orderListMenu = {
        select: {
            confirm: Constant.AUDIT[1].value,
            status: Constant.STATUS[1].value,
            transferFlag: Constant.TRANSFER_PSO_FLAG[2].value,
            startDate: null,
            endDate: null
        },
        selectAll: false,
        effectiveType: '2',
        showQueryBar: true,
        showEmployee: false,
        showTransferPso: false,
        'orderMasterNo': {display: true, name: '预订单单号'},
        showPsoOrderMstNo: true
    };

    $scope.PURCHASE_FLAG = Constant.PURCHASE_FLAG;

    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: 'b02e037f-f78e-4da1-9788-b75fd0548ed2'},
        '101-delete': {display: true, name: '删除', uuid: '8fd21947-8b89-4527-8685-cf9cc3297d8e'},
        '102-edit': {display: true, name: '编辑', uuid: '8b091c83-f5c3-422c-92b5-0e819ec95223'},

        '200-cancel': {display: true, name: '取消新增', uuid: 'fc669edb-5dc0-4b33-a7e6-4a2b9e8042d3'},
        '201-save': {display: true, name: '保存', uuid: '301107cb-25e4-4971-8684-22e6219cfbbb'},

        '302-save': {display: true, name: '保存', uuid: 'e3b32b44-07fc-44c9-a49d-56e88ffd62b5'},
        '303-cancel': {display: true, name: '取消修改', uuid: '988b6271-4723-43aa-ab71-441139a0ed13'},
        '304-quit': {display: true, name: '退出编辑', uuid: '5f0d0f3f-627e-49d2-bffb-5f40bfca491d'},

        '107-change': {display: false, name: '变更', uuid: 'aac96850-da1c-47d6-b0f5-20f80230b2b4'},
        '108-changehistory': {display: false, name: '变更记录查询', uuid: 'e6e97d14-233b-4553-94a7-2117069d0167'},

        '410-selectAll': {display: false, name: '全选', uuid: '22f2be57-7bc3-4dfa-85e3-66bafa5c7727'},
        '411-audit': {display: true, name: '审核', uuid: 'a7c7e8bf-0880-441e-9f6e-8d979b736b6e'},
        '412-return': {display: true, name: '退回', uuid: '5fd6c1ca-021a-4b67-974d-f584c28abee8'},
        '413-throw': {display: true, name: '抛转后台', uuid: '43562127-3a49-4a6a-89db-dbeb995f04a1'},
        '414-effective': {display: true, name: '失效作废', uuid: 'd73deefc-3d88-4d4b-8f47-24627cce3e54'},
        '416-revertAudit': {display: true, name: '取消审核', uuid: 'eba0caea-4fbf-4eec-8fde-44eafdfba4ac'},
        '420-purchaseSubmit': {display: true, name: '采购发出', uuid: '253b66a1-c0a7-4f5a-a2c8-7fc92bb36501'},
        '421-purchaseBack': {display: true, name: '采购退回', uuid: 'd48d68fc-591d-40a2-b3b7-72f4d8bc512e'}
    };

    $scope.orderListMenuDisplayOption = {
        '400-selectAll': {display: true, name: '全选', uuid: 'dfba15d0-55c2-4f32-9f0f-dc7391412b7c'},
        '401-audit': {display: true, name: '审核', uuid: 'a5fd6757-e65a-4adc-af32-d3701f280b36'},
        '402-return': {display: true, name: '退回', uuid: 'eb2036ef-8469-4ee7-b1d0-02c08a28e598'},
        '403-throw': {display: true, name: '抛转后台', uuid: '0b45d232-28ad-40de-93c1-95636ae6fadc'},
        '404-effective': {display: true, name: '失效作废', uuid: '1d0983c8-8d11-4a40-8140-d267e03d04a4'},
        '405-query': {display: true, name: '查询', uuid: '992b0fef-abca-461c-91b7-07036d54d3f4'},
        '406-revertAudit': {display: true, name: '取消审核', uuid: 'ab4da1cc-be55-4cd3-8a44-afc74d6237dc'},
        '408-add': {display: true, name: '新增', uuid: '862577df-fa98-4538-acc4-adf0687e787b'}
    };

    $scope.itemOperationMenuDisplayOption = {
        '500-item-edit': {display: true, name: ''},
        '501-item-delete': {display: true, name: ''}
    };

    $scope.orderListMenuAction = function (menuId, $event) {
        //Main menu
        if (menuId == 400) {
            $scope.selectAllMenuAction();
        } else if (menuId == 401) {
            $scope.auditMenuAction();
        } else if (menuId == 402) {
            $scope.returnMenuAction();
        } else if (menuId == 403) {
            $scope.throwMenuAction();
        } else if (menuId == 404) {
            $scope.effectiveMenuAction();
        } else if (menuId == 405) {
            $scope.queryMenuAction();
        } else if (menuId == 406) {
            $scope.revertAuditMenuAction();
        } else if (menuId == 407) {
            $scope.oneOffSync();
        } else if (menuId == 408) {
            $scope.preAddMenuAction();
        } else if (menuId == 409) {
            $scope.rollbackTransfer();
        }
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.$watch('orderListMenu.select', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.queryMenuAction();
    }, true);

    $scope.queryEnter = function (e) {
        if (e.keyCode === 13) {
            $scope.pageOption.currentPage = 0;
            $scope.pageOption.totalPage = 0;
            $scope.pageOption.totalElements = 0;
            $scope.queryMenuAction();
        }
    };

    $scope.editItem = function (orderMaster) {
        $scope.selectedDetail = [];
        $scope.orderListMenu.selectAll = false;

        $scope.selectedItem = orderMaster;

        if ($scope.selectedItem.orderDate != null) {
            $scope.selectedItem.orderDate = new Date($scope.selectedItem.orderDate);
        }
        if ($scope.selectedItem.psoTransferDate != null) {
            $scope.selectedItem.psoTransferDate = moment($scope.selectedItem.psoTransferDate).format('YYYY-MM-DD HH:mm:ss');
        }

        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);

        //需要考虑灰化其他按钮
        $scope.resetButtonDisabled();
        $scope.orderListMenu.effectiveType = orderMaster.status;
        $scope.refreshDetail(orderMaster.uuid);
        $scope.changeButtonStatus(orderMaster);
        OrderChannelCurrency.getAll().success(function (data) {
            $scope.channelCurrencies = data.content;
        });

        OrderChannelTax.getAll().success(function (data) {
            $scope.channelTaxs = data.content;
        });
        SaleTypes.getAll().success(function (data) {
            $scope.saleTypes = data.content;
        });

        //若有来源单号，说明是被抛转的单据，此时不允许点删除按钮
        if ($scope.selectedItem.psoTransferNo != undefined && $scope.selectedItem.psoTransferNo != null) {
            $scope.formMenuDisplayOption['102-edit'].display = false;
            $scope.formMenuDisplayOption['101-delete'].display = false;
        } else {
            $scope.formMenuDisplayOption['102-edit'].display = true;
            $scope.formMenuDisplayOption['101-delete'].display = true;
        }

        // 已经审核(confirm = 2)的订单不可再对订单做删除和编辑
        if ($scope.selectedItem.confirm == '2') {
            $scope.formMenuDisplayOption['102-edit'].display = false;
            $scope.formMenuDisplayOption['101-delete'].display = false;
        }

    };

    //更新产品信息
    $scope.refreshDetail = function (masterUuid) {
        PmmOrderDetail.get(masterUuid).success(function (data) {
            $scope.OrderDetailList = data;
            $scope.updateOrderDetailListDate($scope.OrderDetailList);
            $scope.OrderExtendDetailList = [];
            $scope.refreshDeliveryList(masterUuid);
            $scope.selectedDetail = [];
            $scope.resetDetailButtonDisabled();
        });
    };

    $scope.refreshDeliveryList = function (masterUuid) {
        PmmOrderExtendDetail.getAll(masterUuid).success(function (data) {
            $scope.OrderExtendDetailList = data.content;
        });
    };

    $scope.listTabSelected = function () {
        $scope.orderListMenu.showQueryBar = true;
        $scope.orderListMenuDisplayOption['400-selectAll'].display = true;
        $scope.queryMenuActionWithPaging();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);

        // 自定义属性reset
        $scope.allCustomsScopes = null;
        $scope.orderExtendDetail2List = null;
        $scope.selectedItemCustoms = null;
        $scope.changeSubTabIndexs(0);

        $scope.getMenuAuthData($scope.RES_UUID_MAP.PO.PMM_ORDER.LIST_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
        //empty selected item in form
        $scope.selectedDetail = [];
        $scope.OrderDetailList = null;
    };

    $scope.formTabSelected = function () {
        $scope.orderListMenu.showQueryBar = false;
        $scope.orderListMenuDisplayOption['400-selectAll'].display = false;
        $scope.getMenuAuthData($scope.RES_UUID_MAP.PO.PMM_ORDER.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.prodInfoTabSelected = function () {
        $scope.changeSubTabIndexs(0);
        // 自定义属性reset
        $scope.allCustomsScopes = null;
        $scope.orderExtendDetail2List = null;
        $scope.selectedItemCustoms = null;

    };

    $scope.deliverInfoTabSelected = function () {
        $scope.changeSubTabIndexs(1);
        // 自定义属性reset
        $scope.allCustomsScopes = null;
        $scope.orderExtendDetail2List = null;
        $scope.selectedItemCustoms = null;
    };

    $scope.receiptInfoTabSelected = function () {
        $scope.changeSubTabIndexs(3);
        // 自定义属性reset
        $scope.allCustomsScopes = null;
        $scope.orderExtendDetail2List = null;
        $scope.selectedItemCustoms = null;
        ReceiptDetail.get($scope.selectedItem.uuid).success(function (data) {
            $scope.ReceiptOrderDetailList = data;
        });
    };

    $scope.customTabSelected = function () {
        $scope.changeSubTabIndexs(2);
        //don't refer above method and set customScopes to null
    };

    $scope.selected = [];
    $scope.selectedItemsCount = 0;
    $scope.selectedItemsTotalPrice = 0.00;
    $scope.toggle = function (item, selected) {
        var idx = selected.indexOf(item);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(item);
        }

        $scope.orderListMenu.effectiveType = item.status;
        //需要考虑灰化其他按钮
        $scope.resetInitialValue();
        $scope.changeButtonStatusAndCalTotalPrice();
        $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
        $scope.selectedItemsCount = selected.length;
    };

    $scope.changeButtonStatusAndCalTotalPrice = function () {
        var firstLoop = true;
        angular.forEach($scope.selected, function (orderMaster) {
            $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice + orderMaster.oriPurAmt;
            //initialize effectiveType
            if (firstLoop) {
                firstLoop = false;
                $scope.orderListMenu.effectiveType = orderMaster.status;
                $scope.firstOrderMasterStatus = orderMaster.status;
            } else {
                if ($scope.firstOrderMasterStatus !== orderMaster.status) {
                    $scope.effectiveType_disabled = 1;
                }
            }
            $scope.changeButtonStatus(orderMaster);
        });
    };

    $scope.changeButtonStatus = function (orderMaster) {
        //confirm:1=未审核/2=已审核/3=审核中/4=退回   status:"1=有效/2=无效  transferFlag format = "1=是/2=否",
        //只有未审核和退回状态的单据才可以作废,
        if (orderMaster.confirm == 2 || orderMaster.confirm == 3) {
            $scope.effectiveType_disabled = 1;
        }

        //未审核和审核中的都可以退回
        if (orderMaster.confirm == 2 || orderMaster.confirm == 4) {
            $scope.return_button_disabled = 1;
        }
        // //如果都是勾选的未审核的，允许审核  只要有一个是已审核的，就不允许审核
        // if (orderMaster.confirm == 2 || orderMaster.confirm == 4) {
        //     $scope.audit_button_disabled = 1;
        // }
        //只有已审核且尚未抛转的单子可以抛转
        if (!(orderMaster.confirm == 2 && orderMaster.transferFlag != 1 )) {
            $scope.throw_button_disabled = 1;
        } else {
            $scope.throw_button_disabled = 0;
        }
        //只有已审核并且尚未抛转的单据可取消审核，若勾选单据中有其他审核状态的单据，则灰显按钮，若用户无权限取消审核，也灰显按钮；
        console.log("orderMaster.confirm:" + orderMaster.confirm + 'orderMaster.transferFlag:' + orderMaster.transferFlag);

        if (!(orderMaster.confirm == 2 || orderMaster.confirm == 4)) {
            $scope.revert_audit_button_disabled = 1;
            $scope.audit_button_disabled = 0;
        } else {
            $scope.revert_audit_button_disabled = 0;
            $scope.audit_button_disabled = 1;
        }

        if (orderMaster.confirm == '2' && (orderMaster.purchaseFlag == null || orderMaster.purchaseFlag == '1' || orderMaster.purchaseFlag == '3')) {
            // 【采购发出】按钮只有在PMM_ORDER_M ST.CONFIRM='2'已审核且PMM_ORDER_MST.PURCHASE_FLAG='1'采购未发出或'3'采购退回状态才可点击
            $scope.purchase_submit_button_disabled = 0;
            $scope.purchase_back_button_disabled = 1;
        } else if (orderMaster.confirm == '2' && orderMaster.purchaseFlag == '2') {
            // 【采购退回】按钮只有在PMM_ORDER_MST.CONFIRM='2'已审核且PMM_ORDER_MST.PURCHASE_FLAG='2'采购发出状态才可点击
            $scope.purchase_submit_button_disabled = 1;
            $scope.purchase_back_button_disabled = 0;
        } else {
            $scope.purchase_submit_button_disabled = 1;
            $scope.purchase_back_button_disabled = 1;
        }

    };

    $scope.changeDetailButtonStatus = function () {
        $scope.audit_detail_disabled = 0;
        $scope.revert_audit_detail_disabled = 0;
        $scope.purchase_submit_detail_disabled = 0;
        $scope.purchase_back_detail_disabled = 0;
        angular.forEach($scope.selectedDetail, function (detail) {
            if ($scope.audit_detail_disabled != 1 && (detail.confirm == 2 || detail.confirm == 4)) {
                $scope.audit_detail_disabled = 1;
            }

            if ($scope.revert_audit_detail_disabled != 1 && detail.confirm != 2) {
                $scope.revert_audit_detail_disabled = 1;
                $scope.purchase_submit_detail_disabled = 1;
                $scope.purchase_back_detail_disabled = 1;
            }

            if ($scope.purchase_submit_detail_disabled != 1 && detail.purchaseFlag == 2) {
                $scope.purchase_submit_detail_disabled = 1;
            }

            if ($scope.purchase_back_detail_disabled != 1 && detail.purchaseFlag != 2) {
                $scope.purchase_back_detail_disabled = 1;
            }
        });
    };


    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };


    $scope.selectedDetail = [];
    $scope.selectDetailAllAction = function (selectDetailAllFlag) {
        if (selectDetailAllFlag == true) {
            angular.forEach($scope.OrderDetailList.content, function (item) {
                var idx = $scope.selectedDetail.indexOf(item);
                if (idx < 0) {
                    $scope.selectedDetail.push(item);
                }
            });
        } else {
            $scope.selectedDetail = [];
        }
        $scope.changeDetailButtonStatus();
    };


    $scope.toggleDetail = function (item, selectedDetail) {
        var idx = selectedDetail.indexOf(item);
        if (idx > -1) {
            selectedDetail.splice(idx, 1);
            $scope.resetDetailButtonDisabled();
        }
        else {
            selectedDetail.push(item);
        }

        $scope.orderListMenu.effectiveType = item.status;
        $scope.changeDetailButtonStatus();
    };


    $scope.changeButtonStatuOnly = function () {
        var firstLoop = true;
        angular.forEach($scope.selectedDetail, function (orderDetail) {
            //initialize effectiveType
            if (firstLoop) {
                firstLoop = false;
                $scope.orderListMenu.effectiveType = orderDetail.status;
                $scope.firstOrderDetailStatus = orderDetail.status;
            } else {
                if ($scope.firstOrderDetailStatus !== orderDetail.status) {
                    $scope.effectiveType_disabled = 1;
                }
            }
            $scope.changeButtonStatus(orderDetail);
        });
    };


    $scope.selectAllMenuAction = function () {
        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            if ($scope.orderListMenu.selectAll == true) {
                angular.forEach($scope.OrderDetailList.content, function (item) {
                    var idx = $scope.selected.indexOf(item);
                    if (idx < 0) {
                        $scope.selected.push(item);
                    }
                });
                //需要考虑灰化其他按钮
                $scope.resetButtonDisabled();
                $scope.changeButtonStatuOnly();
            } else if ($scope.orderListMenu.selectAll == false) {
                $scope.selected = [];
                $scope.orderListMenu.effectiveType = '1';
                $scope.resetButtonDisabled();
            }
        } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
            if ($scope.orderListMenu.selectAll == true) {
                angular.forEach($scope.OrderMasterList.content, function (item) {
                    var idx = $scope.selected.indexOf(item);
                    if (idx < 0) {
                        $scope.selected.push(item);
                    }
                });
                //需要考虑灰化其他按钮
                $scope.resetInitialValue();

                $scope.changeButtonStatusAndCalTotalPrice();
                $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
                $scope.selectedItemsCount = $scope.selected.length;
            } else if ($scope.orderListMenu.selectAll == false) {
                $scope.selected = [];
                //           $scope.orderListMenu.selectAll = false;
                $scope.orderListMenu.effectiveType = '1';
                $scope.resetInitialValue();
            }
        }

    };

    $scope.refreshMasterAndDetail = function () {
        PmmOrderMaster.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem = data;
            $scope.updateOrderMasterDate($scope.selectedItem);
            $scope.selectedDetail = [];
            $scope.orderListMenu.selectAll = false;

            //需要考虑灰化其他按钮
            $scope.resetButtonDisabled();

            $scope.orderListMenu.effectiveType = data.status;

            PmmOrderDetail.get($scope.selectedItem.uuid).success(function (data) {
                $scope.OrderDetailList = data;
                $scope.updateOrderDetailListDate($scope.OrderDetailList);
                $scope.showInfo('修改数据成功。');
            });

        })
    };


    $scope.effectiveMenuAction = function () {
        if ($scope.selected.length > 0 || $scope.selectedTabIndex == 1) {
            $scope.showConfirm('确认修改启用状态吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var OrderMasterUpdateInput = {
                        uuid: $scope.selectedItem.uuid,
                        status: $scope.orderListMenu.effectiveType
                    };
                    PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.status = $scope.orderListMenu.effectiveType;
                        $scope.editItem($scope.selectedItem);
                        PmmOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PO.PMM_ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                            $scope.menuList[1].subList[2].suffix = data;
                        });
                        $scope.showInfo('修改数据成功。');
                    });
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    //update $scope.selected
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var OrderMasterUpdateInput = {
                            uuid: item.uuid,
                            status: $scope.orderListMenu.effectiveType
                        };
                        var response = PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function (data) {
                        $scope.queryMenuActionWithPaging();
                        $scope.showInfo('修改数据成功。');
                    });
                }
            });
        }

    };

    //操作更新pso_so_mst.confirm='2' 或 '3'，视用户审核权限
    $scope.auditMenuAction = function () {
        if ($scope.selected.length > 0 || $scope.selectedTabIndex == 1) {
            $scope.showConfirm('确认审核吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var OrderMasterUpdateInput = {
                        uuid: $scope.selectedItem.uuid,
                        confirm: '2'
                    };
                    PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.confirm = '2';
                        $scope.editItem($scope.selectedItem);
                        PmmOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PO.PMM_ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                            $scope.menuList[1].subList[2].suffix = data;
                        });
                        $scope.showInfo('修改数据成功。');
                    });
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    //update $scope.selected (multiple confirm)
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var OrderMasterUpdateInput = {
                            uuid: item.uuid,
                            confirm: '2'
                        };
                        var response = PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function (data) {
                        angular.forEach($scope.selected, function (item) {
                            item.confirm = '2';
                        });
                        $scope.resetInitialValue();
                        $scope.changeButtonStatusAndCalTotalPrice();
                        $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
                        $scope.selectedItemsCount = $scope.selected.length;
                        //$scope.queryMenuActionWithPaging();
                        $scope.showInfo('修改数据成功。');
                    });
                }

            });
        }

    };

    $scope.returnMenuAction = function () {
        if ($scope.selected.length > 0 || $scope.selectedTabIndex == 1) {
            $scope.showConfirm('确认退回吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var OrderMasterUpdateInput = {
                        uuid: $scope.selectedItem.uuid,
                        confirm: '4'
                    };
                    PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.confirm = '4';
                        $scope.editItem($scope.selectedItem);
                        PmmOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PO.PMM_ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                            $scope.menuList[1].subList[2].suffix = data;
                        });
                        $scope.showInfo('修改数据成功。');
                    });

                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    //update $scope.selected
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var OrderMasterUpdateInput = {
                            uuid: item.uuid,
                            confirm: '4'
                        };
                        var response = PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function (data) {
                        $scope.queryMenuActionWithPaging();
                        $scope.showInfo('修改数据成功。');
                    });

                }
            });
        }

    };

    $scope.throwMenuAction = function () {
    console.log($scope);
        if ($scope.selected.length > 0 || $scope.selectedTabIndex == 1) {
            $scope.showConfirm('确认抛转吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var OrderMasterUpdateInput = {
                        uuid: $scope.selectedItem.uuid,
                        transferFlag: '1'
                    };
                    PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.transferFlag = '1';
                        $scope.editItem($scope.selectedItem);
                        PmmOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PO.PMM_ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                            $scope.menuList[1].subList[2].suffix = data;
                        });
                        $scope.showInfo('修改数据成功。');
                        var transferData = { 'PMM_ORDER_MST_UUID': $scope.selectedItem.uuid };
                        ErpAdapterService.transferErpAdapter('/pmmOrderToOeaTask', transferData, function () {
                            $scope.showInfo('抛转成功。');
                        });
                    });
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var orderMasterUuids = "";
                    angular.forEach($scope.selected, function (item) {
                        orderMasterUuids += item.uuid + ","
                    });
                    if (orderMasterUuids.length > 0) {
                        orderMasterUuids = orderMasterUuids.substr(0, orderMasterUuids.length - 1);
                    }
                    var OrderMasterUpdateInput = {
                        uuid: orderMasterUuids,
                        transferFlag: '1'
                    };
                    var response = PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.queryMenuActionWithPaging();
                        $scope.showInfo('修改数据成功。');
                    }).error(function (data) {
                        $scope.showError(data.message);
                    });
                    var transferData = { 'PMM_ORDER_MST_UUID': orderMasterUuids };
                    ErpAdapterService.transferErpAdapter('/pmmOrderToOeaTask', transferData, $scope, function () {
                        $scope.showInfo('抛转成功。');
                    });
                }
            });
        }
    };

    $scope.revertAuditMenuAction = function () {
        if ($scope.selected.length > 0 || $scope.selectedTabIndex == 1) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var OrderMasterUpdateInput = {
                        uuid: $scope.selectedItem.uuid,
                        confirm: '1'
                    };
                    PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.confirm = '1';
                        $scope.editItem($scope.selectedItem);
                        PmmOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PO.PMM_ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                            $scope.menuList[1].subList[2].suffix = data;
                        });
                        $scope.showInfo('修改数据成功。');
                    });
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    //update $scope.selected
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var OrderMasterUpdateInput = {
                            uuid: item.uuid,
                            confirm: '1'
                        };
                        var response = PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function (data) {
                        angular.forEach($scope.selected, function (item) {
                            item.confirm = '1';
                        });
                        $scope.resetInitialValue();
                        $scope.changeButtonStatusAndCalTotalPrice();
                        $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
                        $scope.selectedItemsCount = $scope.selected.length;
                        //$scope.queryMenuActionWithPaging();
                        $scope.showInfo('修改数据成功。');
                    });

                }
            });
        }

    };

    $scope.resetInitialValue = function () {
        $scope.selectedItem = null;
        $scope.selectedItemsCount = 0;
        $scope.selectedItemsTotalPrice = 0.00;
        $scope.resetButtonDisabled();
    };
    $scope.resetButtonDisabled = function () {
        $scope.effectiveType_disabled = 0;
        $scope.return_button_disabled = 0;
        $scope.audit_button_disabled = 0;
        $scope.throw_button_disabled = 0;
        $scope.revert_audit_button_disabled = 0;
        $scope.purchase_submit_button_disabled = 1;
        $scope.purchase_back_button_disabled = 1;
    };

    $scope.resetDetailButtonDisabled = function () {
        $scope.audit_detail_disabled = 0;
        $scope.revert_audit_detail_disabled = 0;
        $scope.purchase_submit_detail_disabled = 0;
        $scope.purchase_back_detail_disabled = 0;
    };

    $scope.queryMenuAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 100;
        $scope.pageOption.totalElements = 100;
        $scope.queryMenuActionWithPaging();
    };
    $scope.queryMenuActionWithPaging = function () {
        $scope.selectedItem = null;
        $scope.selected = [];
        $scope.selectedItemsCount = 0;
        $scope.selectedItemsTotalPrice = 0.00;
        $scope.orderListMenu.selectAll = false;
        $scope.orderListMenu.effectiveType = '2';

        $scope.resetInitialValue();

        if ($scope.orderListMenu.select.startDate !== undefined) {
            if ($scope.orderListMenu.select.startDate !== null) {
                orderDateBegin = new Date($scope.orderListMenu.select.startDate);
                orderDateBegin = moment(orderDateBegin).format('YYYY-MM-DD');
            } else {
                orderDateBegin = null;
            }
        } else {
            orderDateBegin = null;
        }
        if ($scope.orderListMenu.select.endDate !== undefined) {
            if ($scope.orderListMenu.select.endDate !== null) {
                orderDateEnd = new Date($scope.orderListMenu.select.endDate);
                orderDateEnd = moment(orderDateEnd).format('YYYY-MM-DD');
            } else {
                orderDateEnd = null;
            }
        } else {
            orderDateEnd = null;
        }

        if ($scope.orderListMenu.no !== undefined) {
            pmmOrderNo = $scope.orderListMenu.no;
        } else {
            pmmOrderNo = null;
        }

        if ($scope.orderListMenu.salesOrderMasterNo !== undefined) {
            salesOrderMasterNo = $scope.orderListMenu.salesOrderMasterNo;
        } else {
            salesOrderMasterNo = null;
        }


        // if ($scope.orderListMenu.employeeName !== undefined) {
        //     employeeName = $scope.orderListMenu.employeeName;
        // } else {
        //     employeeName = null;
        // }

        confirm = $scope.orderListMenu.select.confirm;
        status = $scope.orderListMenu.select.status;
        transferFlag = $scope.orderListMenu.select.transferFlag;

        PmmOrderMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, confirm, status, transferFlag,
            pmmOrderNo, salesOrderMasterNo, orderDateBegin, orderDateEnd, RES_UUID_MAP.PO.PMM_ORDER.LIST_PAGE.RES_UUID).success(function (data) {


                $scope.OrderMasterList = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;

                angular.forEach($scope.OrderMasterList.content, function (order) {
                    if (order.orderDate != null) {
                        order.orderDate = new Date(order.orderDate);
                    }
                    if (order.psoTransferDate != null) {
                        order.psoTransferDate = new Date(order.psoTransferDate);
                    }
                    PmmOrderDetail.get(order.uuid).success(function (detail) {
                        order.orderDetailCount = detail.totalElements
                    });
                });


                // $scope.getOrderDetailCountByMasterUuid();
            PmmOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PO.PMM_ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                    $scope.menuList[1].subList[2].suffix = data;
                })
            }
        )
    };


    $scope.getOrderDetailCountByMasterUuid = function () {
        var orderMasterUuids = "";
        angular.forEach($scope.OrderMasterList.content, function (orderMaster) {
            $scope.updateOrderMasterDate(orderMaster);
            orderMasterUuids = orderMasterUuids + orderMaster.uuid + ","
        });
        PmmOrderDetail.getAllCountByMasterUuids(orderMasterUuids).success(function (data) {
            var map = [];
            angular.forEach(data, function (orderMasterWithCount) {
                map[orderMasterWithCount.uuid] = orderMasterWithCount.detailCount;
            });
            angular.forEach($scope.OrderMasterList.content, function (orderMaster) {
                if (undefined != map[orderMaster.uuid]) {
                    orderMaster.orderDetailCount = map[orderMaster.uuid];
                } else {
                    orderMaster.orderDetailCount = 0;
                }
            });
        });
    };

    //Save modification.
    $scope.modifyMenuAction = function () {
        if ($scope.selectedItem) {
            PmmOrderMaster.modify($scope.selectedItem).success(function () {
                $scope.showInfo('修改数据成功。');
            }).error(function () {
                $scope.showError('修改数据失败。');
            });
        }
    };

    $scope.cancelModifyMenuAction = function () {
        PmmOrderMaster.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem = data;
            $scope.updateOrderMasterDate($scope.selectedItem);
        })
    };

    $scope.exitModifyMenuAction = function () {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.preAddMenuAction = function () {
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
        CBIEmployeeService.getByNo($scope.currentUser).success(function (data) {
            if (data.content[0]) {
                $scope.selectedItem.employee = data.content[0];
                $scope.selectedItem.channel = data.content[0].channel;
                $scope.selectedItem.channelUuid = data.content[0].channel.uuid;
                $scope.selectedItem.department = $scope.selectedItem.employee.department;
            }
        });

        orderDate = new Date();
        $scope.selectedItem = {
            confirm: '1',
            status: '1',
            transferFlag: '2',
            orderDate: orderDate,
            purchaseFlag: '1'
        };
        $scope.OrderDetailList = {};
    };

    $scope.addMenuAction = function () {
        if ($scope.selectedItem) {
            if (!$scope.selectedItem.channel) {
                $scope.showError("请选择经销商!");
                return;
            }
            console.log($scope.selectedItem);
            PmmOrderMaster.add($scope.selectedItem).success(function (data) {
                $scope.selectedItem = data;
                var promises = [];
                angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                    var response = PmmOrderDetail.add($scope.selectedItem.uuid, orderDetail).success(function (data) {
                    });
                    promises.push(response);
                });

                $q.all(promises).then(function () {
                    $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
                    $scope.editItem($scope.selectedItem);
                    $scope.showInfo('新增成功。');
                }, function () {
                    PmmOrderMaster.delete($scope.selectedItem.uuid).success(function () {
                    });
                    $scope.showInfo('新增失败。');
                });
            }).error(function () {
                $scope.showError('新增失败。');
            });
        }
    };

    $scope.cancelAddMenuAction = function () {
        $scope.listTabSelected();
    };

    $scope.deleteMenuAction = function () {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem) {
                PmmOrderMaster.delete($scope.selectedItem.uuid).success(function () {
                    $scope.showInfo('删除成功。');
                    //kevin?
                    $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
                });
            }
        });
    };

    $scope.changeMenuAction = function () {

    };
    $scope.changeHistoryMenuAction = function () {

    };

    $scope.openOrderItemsDlg = function () {
        if ($scope.selectedItem.channel == undefined || $scope.selectedItem.channel == null) {
            $scope.showWarn('请选择经销商。');
        } else {
            $mdDialog.show({
                controller: 'OrderItemsSearchController',
                templateUrl: 'app/src/app/pmm/pmmOrder/selectItems.html',
                parent: angular.element(document.body),
                targetEvent: event,
                locals: {
                    channelUuid: $scope.selectedItem.channel.uuid,
                    saleTypes: $scope.saleTypes
                }
            }).then(function (data) {
                //existing order
                if ($scope.selectedItem.uuid != undefined && $scope.selectedItem.uuid != null) {
                    PmmOrderDetail.add($scope.selectedItem.uuid, data.addOrderDetail).success(function (data) {
                        $scope.editItem(data.pmmOrderMst);
                        $scope.showInfo('新增产品成功。');
                    });
                } else {
                    //new order
                    if ($scope.OrderDetailList.content == undefined) {
                        $scope.OrderDetailList.content = [];
                    }
                    $scope.OrderDetailList.content.push(data.addOrderDetail);

                }
            });
        }
    };

    $scope.orderDetailDeleteMenuAction = function (orderDetail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem.uuid != undefined && $scope.selectedItem.uuid != null) {
                PmmOrderDetail.delete(orderDetail.pmmOrderMst.uuid, orderDetail.uuid).success(function () {
                    $scope.editItem($scope.selectedItem);
                    $scope.showInfo('删除成功。');
                });
            } else {
                $scope.OrderDetailList.content.splice($scope.OrderDetailList.content.indexOf(orderDetail), 1);
            }
        });
    };

    $scope.confirmOrderItem = function () {
        if ($scope.selectedDetail.length > 0) {
            $scope.showConfirm('确认审核吗？', '', function () {
                var promises = [];
                angular.forEach($scope.selectedDetail, function (item) {
                    var PmmOrderDetailUpdateInput = {
                        uuid: item.uuid,
                        confirm: '2'
                    };

                    var response = PmmOrderDetail.modify(item.pmmOrderMst.uuid, item.uuid, PmmOrderDetailUpdateInput).success(function () {
                        item.confirm = '2';
                    });
                    promises.push(response);
                });
                $q.all(promises).then(function (data) {
                    $scope.refreshDetail($scope.selectedItem.uuid);
                    var detailConfirmCount = 0;

                    angular.forEach($scope.OrderDetailList.content, function (detailItem) {
                        if (detailItem.confirm == '2') {
                            detailConfirmCount = detailConfirmCount + 1;
                        }
                    });
                    $scope.selectedDetail = [];
                    //若所有单身己審核，則自動審核單頭
                    if ($scope.OrderDetailList.totalElements == detailConfirmCount) {
                        var OrderMasterUpdateInput = {
                            uuid: $scope.selectedItem.uuid,
                            confirm: '2'
                        };
                        PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                            $scope.selectedItem.confirm = 2;
                            $scope.changeButtonStatus($scope.selectedItem);
                        });
                    }

                    $scope.showInfo('审核成功。');
                });
            });
        }
    };

    $scope.unConfirmOrderItem = function () {
        if ($scope.selectedDetail.length > 0) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                var allDetailConfirm = false;
                var detailConfirmCount = 0;
                angular.forEach($scope.OrderDetailList.content, function (detailItem) {
                    if (detailItem.confirm == '2') {
                        detailConfirmCount = detailConfirmCount + 1;
                    }
                });
                if ($scope.OrderDetailList.totalElements == detailConfirmCount) {
                    allDetailConfirm = true;
                }

                var promises = [];
                angular.forEach($scope.selectedDetail, function (item) {
                    var PmmOrderDetailUpdateInput = {
                        uuid: item.uuid,
                        confirm: '1'
                    };
                    var response = PmmOrderDetail.modify(item.pmmOrderMst.uuid, item.uuid, PmmOrderDetailUpdateInput).success(function () {
                    });
                    promises.push(response);
                });
                $q.all(promises).then(function (data) {
                    $scope.refreshDetail($scope.selectedItem.uuid);
                    $scope.selectedDetail = [];
                    //若有其它一筆單身取消審核，則自動取消審核單頭'
                    if (allDetailConfirm) {
                        var OrderMasterUpdateInput = {
                            uuid: $scope.selectedItem.uuid,
                            confirm: '1'
                        };
                        PmmOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                            $scope.selectedItem.confirm = '1';
                            $scope.changeButtonStatus($scope.selectedItem);
                        });
                    }

                    $scope.showInfo('取消审核成功。');
                });
            });
        }
    };

    //修改产品信息
    $scope.orderDetailEditMenuAction = function (orderDetail) {
        $mdDialog.show({
            controller: 'PmmOrderDetailController',
            templateUrl: 'app/src/app/pmm/pmmOrder/orderDetailEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedOrderDetail: orderDetail,
                saleTypes: $scope.saleTypes
            }
        }).then(function (data) {

            PmmOrderDetail.modify(data.selectedOrderDetail.pmmOrderMst.uuid, data.selectedOrderDetail.uuid, data.selectedOrderDetail).success(function () {
                $scope.refreshDetail(data.selectedOrderDetail.pmmOrderMst.uuid);
                // PmmOrderDetail.get(data.selectedOrderDetail.pmmOrderMst.uuid).success(function (data) {
                //     $scope.OrderDetailList = data;
                //     $scope.updateOrderDetailListDate($scope.OrderDetailList);
                // });
                $scope.showInfo('修改成功。');
            })
        });
    };

    $scope.updateOrderDetailListDate = function (OrderDetailList) {
        angular.forEach(OrderDetailList.content, function (orderDetail) {
            $scope.updateOrderDetailDate(orderDetail);
        });
    };

    $scope.updateOrderDetailDate = function (orderDetail) {
        if (null != orderDetail.deliverDate) {
            orderDetail.deliverDate = new Date(orderDetail.deliverDate);
        }
    };

    $scope.updateOrderMasterDate = function (orderMaster) {
        if (null != orderMaster.deliverDate) {
            orderMaster.deliverDate = new Date(orderMaster.deliverDate);
        }
        if (null != orderMaster.orderDate) {
            orderMaster.orderDate = new Date(orderMaster.orderDate);
        }
        if (null != orderMaster.transferDate) {
            orderMaster.transferDate = new Date(orderMaster.transferDate);
        }

        if (undefined != orderMaster.psoOrderMstNo && null != orderMaster.psoOrderMstNo) {
            var idx = orderMaster.psoOrderMstNo.indexOf(',');
            if (idx > 0) {
                orderMaster.psoOrderMstNo = null;
            }
        }

    };

    //修改出货信息
    $scope.orderExtendDetailEditMenuAction = function (orderExtendDetail) {
        $mdDialog.show({
            controller: 'PmmOrderExtendDetailController',
            templateUrl: 'app/src/app/pmm/pmmOrder/orderExtendDetailEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedOrderExtendDetail: orderExtendDetail
            }
        }).then(function (data) {
            PmmOrderExtendDetail.modify(data.selectedOrderExtendDetail.pmmOrderDetail.uuid, data.selectedOrderExtendDetail.uuid, data.selectedOrderExtendDetail)
                .success(function () {
                    PmmOrderDetail.get(data.selectedOrderExtendDetail.pmmOrderDetail.pmmOrderMaster.uuid, data.selectedOrderExtendDetail.pmmOrderDetail.uuid).success(function (data) {
                        $scope.OrderDetailList = data;
                        $scope.updateOrderDetailListDate($scope.OrderDetailList);
                        $scope.OrderExtendDetailList = [];
                        angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                            PmmOrderExtendDetail.get(orderDetail.uuid).success(function (data) {
                                $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                            });
                        });
                        $scope.showInfo('修改成功。');
                    });


                });
        });
    };


    $scope.editItemCustom = function (orderExtendDetail) {
        $scope.selectedOrderExtendDetail = orderExtendDetail;
        $scope.changeSubTabIndexs(2);
        //get item all the custom detail
        OrderItemCustomDetail.getCustomDetail(orderExtendDetail.item.uuid).success(function (data) {
            $scope.allCustomsScopes = {};
            $scope.selectedItemCustoms = data;
            angular.forEach($scope.selectedItemCustoms.content, function (value) {
                value.informationUuids = JSON.parse(value.information);
            });

            angular.forEach($scope.selectedItemCustoms.content, function (itemCustomDetail) {
                angular.forEach(itemCustomDetail.informationUuids, function (informationUuid) {
                    OrderCustomScope.getCustomScope(itemCustomDetail.itemCustom.uuid, informationUuid).success(function (data) {
                        if ($scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] == undefined) {
                            var value = {};
                            value[data.uuid] = data;
                            $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] = value;
                        } else {
                            var value = $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid];
                            value[data.uuid] = data;
                            $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] = value;
                        }
                    })
                });

            });

        });
        var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;
        PmmOrderExtendDetail2.get(orderExtendDetailUuid).success(function (data) {
            $scope.orderExtendDetail2List = data;
            angular.forEach($scope.orderExtendDetail2List.content, function (value) {
                value.informationUuids = JSON.parse(value.information);
            })
        })
    };


    $scope.openAddCustomDlg = function () {
        $mdDialog.show({
            controller: 'PmmOrderExtendDetail2Controller',
            templateUrl: 'app/src/app/pmm/pmmOrder/addCustomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                allCustomsScopes: $scope.allCustomsScopes,
                custom: null,
                allCustoms: $scope.selectedItemCustoms,
                op: 'add',
                itemUuid: $scope.selectedOrderExtendDetail.parentItem.uuid
            }
        }).then(function (data) {
            var OrderExtendDetail2Input = {
                salesOrderExtendDetailUuid: $scope.selectedOrderExtendDetail.uuid,
                no: Math.random().toString(36).substring(10),
                itemUuid: $scope.selectedOrderExtendDetail.item.uuid,
                itemCustomUuid: data.selectedCustom.itemCustom.uuid,
                // information: data.selectedCustom.information,
                information: data.selectedCustom.informationScope
            };
            // masterUuid, detailUuid, orderExtendDetailUuid, OrderExtendDetail2Input
            var masterUuid = $scope.selectedOrderExtendDetail.pmmOrderDetail.pmmOrderMst.uuid;
            var detailUuid = $scope.selectedOrderExtendDetail.pmmOrderDetail.uuid;
            var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;

            PmmOrderExtendDetail2.add(orderExtendDetailUuid, OrderExtendDetail2Input).success(function (response) {
                response.informationUuids = data.selectedCustom.informationUuids;
                $scope.orderExtendDetail2List.content.push(response);
                $scope.OrderExtendDetailList = [];

                $scope.refreshDeliveryList(detailUuid);
                $scope.editItemCustom($scope.selectedOrderExtendDetail);
                // angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                //     PmmOrderExtendDetail.get(orderDetail.uuid).success(function (data) {
                //
                //         $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                //     });
                // });
                $scope.showInfo('新增自定义信息成功。');
            })
        });
    };

    $scope.openEditCustomDlg = function (custom) {
        console.log(custom);
        $mdDialog.show({
            controller: 'PmmOrderExtendDetail2Controller',
            templateUrl: 'app/src/app/pmm/pmmOrder/addCustomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                allCustoms: $scope.selectedItemCustoms,
                allCustomsScopes: $scope.allCustomsScopes,
                custom: custom,
                op: 'modify',
                itemUuid: $scope.selectedOrderExtendDetail.parentItem.uuid
            }
        }).then(function (data) {
            var masterUuid = $scope.selectedOrderExtendDetail.pmmOrderDetail.pmmOrderMst.uuid;
            var detailUuid = $scope.selectedOrderExtendDetail.pmmOrderDetail.uuid;
            var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;

            var OrderExtendDetail2UpdateInput = {
                itemCustomUuid: data.selectedCustom.itemCustom.uuid,
                // information: data.selectedCustom.information
                information: data.selectedCustom.informationScope
            };

            PmmOrderExtendDetail2.modify(orderExtendDetailUuid, custom.uuid, OrderExtendDetail2UpdateInput).success(function () {
                $scope.OrderExtendDetailList = [];
                $scope.refreshDeliveryList(detailUuid);
                $scope.editItemCustom($scope.selectedOrderExtendDetail);
                $scope.showInfo('修改自定义信息成功。');
            })
        });
    };

    $scope.deleteItemCustom = function (deletedOrderExtendDetail2) {

        $scope.showConfirm('确认删除吗？', '删除的自定义信息不可恢复。', function () {
            if (deletedOrderExtendDetail2) {
                var masterUuid = $scope.selectedOrderExtendDetail.pmmOrderDetail.pmmOrderMst.uuid;
                var detailUuid = $scope.selectedOrderExtendDetail.pmmOrderDetail.uuid;
                var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;
                PmmOrderExtendDetail2.delete(orderExtendDetailUuid, deletedOrderExtendDetail2.uuid).success(function () {
                    // angular.forEach($scope.orderExtendDetail2List.content, function (item, index) {
                    //     if (deletedOrderExtendDetail2 == item) {
                    //         $scope.orderExtendDetail2List.content.splice(index, 1);
                    //     }
                    // });
                    // $scope.OrderExtendDetailList = [];
                    // angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                    //     PmmOrderExtendDetail.get(orderDetail.uuid).success(function (data) {
                    //         $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                    //     });
                    // });
                    $scope.refreshDeliveryList(detailUuid);
                    $scope.editItemCustom($scope.selectedOrderExtendDetail);

                    $scope.showInfo('删除成功。');
                });
            }
        });
    };

    $scope.openOrderChannelDlg = function () {
        $mdDialog.show({
            controller: 'OrderChannelSearchController',
            templateUrl: 'app/src/app/pmm/pmmOrder/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.channel = data;
            $scope.selectedItem.channelUuid = data.uuid;

        });

    };

    $scope.openOrderCustomerDlg = function () {
        $mdDialog.show({
            controller: 'OrderCustomerSearchController',
            templateUrl: 'app/src/app/pmm/pmmOrder/selectCustomer.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.customer = data;
            $scope.selectedItem.customerUuid = data.uuid;
        });
    };

    $scope.openOrderPromotionDlg = function () {
        $mdDialog.show({
            controller: 'OrderPromotionSearchController',
            templateUrl: 'app/src/app/pmm/pmmOrder/selectPromotion.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.promotion = data;
            $scope.selectedItem.promotionUuid = data.uuid;
        });
    };

    $scope.changePurchaseFlag = function (flag) {
        var msg = flag == 2 ? '确认发出采购吗？' : '确认取消采购吗？';
        $scope.showConfirm(msg, '', function () {
            PmmOrderMaster.changePurchaseFlag($scope.selectedItem.uuid, flag).success(function (data) {
                $scope.selectedItem = data;
                $scope.changeButtonStatus(data);
                $scope.refreshDetail(data.uuid);
                $scope.showInfo('修改成功。');
            });
        });
    };

    $scope.changeDtlPurchaseFlag = function (flag) {
        var msg = flag == 2 ? '确认发出采购吗？' : '确认取消采购吗？';
        $scope.showConfirm(msg, '', function () {
            var dtlUuid = '';
            angular.forEach($scope.selectedDetail, function (dtl) {
                dtlUuid += (dtlUuid == '' ? '' : ',') + dtl.uuid;
            });
            if (dtlUuid == '') {
                return;
            }
            PmmOrderDetail.changeDtlPurchaseFlag($scope.selectedItem.uuid, dtlUuid, flag).success(function (data) {
                PmmOrderMaster.get($scope.selectedItem.uuid).success(function (data) {
                    $scope.selectedItem = data;
                    $scope.changeButtonStatus(data);
                    $scope.refreshDetail(data.uuid);
                });
                $scope.showInfo('修改成功。');
            });
        });
    };

    $scope.getDetailBgcolor = function (detail) {
        var retObj = {};
        if (detail.purchaseFlag == '2') {
            retObj = {'background-color': 'green'};
        } else if (detail.purchaseFlag == '3') {
            retObj = {'background-color': 'yellow'};
        }
        return retObj;
    };
});


angular.module('IOne-Production').controller('OrderChannelSearchController', function ($scope, $mdDialog, ChannelService) {
    $scope.pageOption = {
        sizePerPage: 6,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.refreshChannel = function () {
        ChannelService.getAllGlobalQuery($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword).success(function (data) {
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

angular.module('IOne-Production').controller('OrderCustomerSearchController', function ($scope, $mdDialog, OrderCustomers) {
    $scope.pageOption = {
        sizePerPage: 6,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.refreshData = function () {
        OrderCustomers.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.searchKeyword).success(function (data) {
            $scope.allData = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshData();

    $scope.selectData = function (data) {
        $scope.data = data;
        $mdDialog.hide($scope.data);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.data);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('OrderItemsSearchController', function ($scope, $q, $mdDialog, OrderItems, channelUuid, saleTypes) {

    $scope.channelUuid = channelUuid;
    $scope.saleTypes = saleTypes;
    $scope.addOrderDetail = {};
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.refreshData = function () {
        OrderItems.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, channelUuid, $scope.searchNo, $scope.searchName).success(function (data) {
            $scope.allData = data;
            if ($scope.allData.content.length < 1) {
                $scope.showError('当前经销商没有商品，请检查渠道定价是否设置。');
            }
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshData();

    $scope.selectData = function (data) {
    console.log($scope.addOrderDetail);
        $scope.addOrderDetail.item = data;
        $scope.addOrderDetail.itemUuid = data.uuid;
        $scope.addOrderDetail.oriPurPrice = data.suggestPrice;
        $scope.addOrderDetail.orderQty = 1;
        $scope.addOrderDetail.oriPurAmt = parseFloat(($scope.addOrderDetail.oriPurPrice * $scope.addOrderDetail.orderQty).toFixed(2));
        $scope.addOrderDetail.standardPrice = data.standardPrice;
        $scope.addOrderDetail.customizeFlag = data.customizationFlag == 'Y' ? 1 : 2;

//        angular.forEach($scope.saleTypes, function (saleType, index) {
//            if (saleType.name == '常规') {
                $scope.addOrderDetail.saleTypeUuid = '162A8B4C-3C3A-4D72-BB3E-47538CFA5CE8';
//            }
//        });
        $scope.addOrderDetail.customizeFlag = 2;
        $scope.addOrderDetail.presentFlag = 2;
        // $scope.addOrderDetail.originalStandardAmount = parseFloat(($scope.addOrderDetail.standardPrice * $scope.addOrderDetail.orderQuantity).toFixed(2));
        $scope.addOrderDetail.itemUuid = data.uuid;
        $scope.refreshUI();
    };

    $scope.changePurPrice = function (price) {
        //若有特价，则采购单价预设为特別單價
        $scope.addOrderDetail.oriPurPrice = price;
        $scope.changePurAmt();
    };

    //数量= 金额*单价
    $scope.changePurAmt = function () {
        $scope.addOrderDetail.oriPurAmt = $scope.addOrderDetail.oriPurPrice * $scope.addOrderDetail.orderQty;
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.hideDlg = function () {
        if (null == $scope.addOrderDetail.item) {
            $scope.showError("请选择商品");
        } else if (null == $scope.addOrderDetail.orderQty) {
            $scope.showError("请输入采购数量");
        } else if (null == $scope.addOrderDetail.oriPurPrice) {
            $scope.showError("请输入采购单价");
        } else {
            $scope.addOrderDetail.oriPurPrice = $scope.addOrderDetail.oriTransactionPrice + $scope.addOrderDetail.perCustomizePrice;
            $scope.addOrderDetail.natPurPrice = $scope.addOrderDetail.natTransactionPrice + $scope.addOrderDetail.perCustomizePrice;
            $scope.addOrderDetail.oriPurAmt = $scope.addOrderDetail.oriPurPrice * $scope.addOrderDetail.orderQty;
            $scope.addOrderDetail.natPurAmt = $scope.addOrderDetail.natPurPrice * $scope.addOrderDetail.orderQty ;
            $scope.addOrderDetail.oriPurAmtTax = $scope.addOrderDetail.oriPurAmt + $scope.addOrderDetail.oriPurTax;
            $scope.addOrderDetail.natPurAmtTax = $scope.addOrderDetail.natPurAmt + $scope.addOrderDetail.natPurTax;

            $mdDialog.hide({
                'addOrderDetail': $scope.addOrderDetail
            });
        }
    };

    $scope.showError = function (info) {
        toastr["error"](info)
    };

    $scope.refreshUI = function () {
        $scope.addOrderDetail.oriStandardAmt = $scope.addOrderDetail.item.standardPrice * $scope.addOrderDetail.orderQty;
        $scope.addOrderDetail.natStandardAmt = $scope.addOrderDetail.oriStandardAmt;
        $scope.addOrderDetail.specialPrice = '';
        $scope.addOrderDetail.promotionDiscountRate = '';
        $scope.addOrderDetail.promotionPrice = '';
        if ($scope.addOrderDetail.saleTypeUuid == '162A8B4C-3C3A-4D72-BB3E-47538CFA5CE8') { // 常规
            $scope.addOrderDetail.oriTransactionPrice = $scope.addOrderDetail.item.suggestPrice;
        } else if ($scope.addOrderDetail.saleTypeUuid == 'D3DE3DF8-5D38-4083-A41A-B0E440E3786E') { // 折扣
            $scope.addOrderDetail.oriTransactionPrice = 0;
        } else if ($scope.addOrderDetail.saleTypeUuid == 'AA929EC9-4392-4C23-A12D-346936F26DCC') { // 赠送
            $scope.addOrderDetail.oriTransactionPrice = 0;
        } else if ($scope.addOrderDetail.saleTypeUuid == 'F1DEDA0E-A607-4934-B305-EEC3C447C509') { // 特价
            $scope.addOrderDetail.oriTransactionPrice = $scope.addOrderDetail.specialPrice;
        }
        $scope.addOrderDetail.natTransactionPrice = $scope.addOrderDetail.oriTransactionPrice;
//        $scope.specialPriceDisplay = false;
//        $scope.promotionDisplay = false;
//        angular.forEach($scope.saleTypes, function (saleType, index) {
//            if (saleType.uuid == saleTypeUuid) {
//                if (saleType.no == 'ST05') {
//                    $scope.specialPriceDisplay = true;
//                }
//
//                if (saleType.no == 'ST07') {
//                    $scope.promotionDisplay = true;
//                }
//            }
//        });
    };

    $scope.chgCustomizeFlag = function (orderDetail) {
        orderDetail.perCustomizePrice = '';
    };

    $scope.calcPromotionPrice = function () {
        $scope.addOrderDetail.promotionPrice = parseFloat(($scope.addOrderDetail.item.suggestPrice * $scope.addOrderDetail.promotionDiscountRate).toFixed(2));
    };
});

angular.module('IOne-Production').controller('PmmOrderExtendDetail2Controller', function ($scope, $mdDialog, allCustoms, allCustomsScopes, custom, op, ItemRelationService, itemUuid) {

    $scope.allCustoms = allCustoms.content;
    $scope.allCustomsScopes = allCustomsScopes;
    $scope.selectedCustom = custom;
    $scope.op = op;
    $scope.itemUuid = itemUuid;

    if ($scope.selectedCustom) {
        console.log($scope.selectedCustom);
        angular.forEach($scope.selectedCustom.informationUuids, function (value, index) {
            angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
                if (item.uuid == value) {
                    item.checked = true;
                }
            })
        });

        ItemRelationService.getAll($scope.itemUuid, $scope.selectedCustom.itemCustom.uuid, $scope.selectedCustom.informationUuids).success(function (itemRelationData) {
            $scope.itemRelationList = itemRelationData.content;
            $scope.selectedCustom.informationScope = $scope.selectedCustom.information;
        });

    } else {

        $scope.selectedCustom = {
            informationUuids: [],
            //astrict: 2
            itemCustom: {astrict: 2}

        };
    }

    $scope.customChangeHandler = function (customUuid) {
        angular.forEach($scope.allCustoms, function (value, index) {
            if (value.itemCustom.uuid == customUuid) {
                $scope.selectedCustom.itemCustom = value.itemCustom;
                //$scope.selectedCustom.informationUuids = value.informationUuids;
            }
        });

        angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
            item.checked = false;
        });

        angular.forEach($scope.selectedCustom.informationUuids, function (value, index) {
            angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
                if (item.uuid == value) {
                    item.checked = true;
                }
            })
        });
        if ($scope.selectedCustom.itemCustom.scopeUuid != undefined) {
            $scope.selectedCustom.itemCustom.scopeUuid = null;
        }

    };

    $scope.checkBoxChangeHandler = function (data, selected) {
        if (selected == true) {
            $scope.selectedCustom.informationUuids.push(data.uuid);
        } else {
            angular.forEach($scope.selectedCustom.informationUuids, function (value, index) {
                if (value == data.uuid) {
                    $scope.selectedCustom.informationUuids.splice(index, 1);
                }
            });
        }
        if ($scope.selectedCustom.informationUuids.length > 0) {
            ItemRelationService.getAll($scope.itemUuid, $scope.selectedCustom.itemCustom.uuid, $scope.selectedCustom.informationUuids).success(function (itemRelationData) {
                $scope.itemRelationList = itemRelationData.content;
            });
        } else {
            $scope.itemRelationList = null;
            $scope.selectedCustom.informationScope = null;
        }
    };

    $scope.radioChangeHandler = function () {
        $scope.selectedCustom.informationUuids = [];
        $scope.selectedCustom.informationUuids.push($scope.selectedCustom.itemCustom.scopeUuid);
    };


    $scope.hideDlg = function () {
        $scope.selectedCustom.information = JSON.stringify($scope.selectedCustom.informationUuids);
        $mdDialog.hide({
            'selectedCustom': $scope.selectedCustom
        });
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('PmmOrderExtendDetailController', function ($scope, $mdDialog, selectedOrderExtendDetail) {
    $scope.selectedOrderExtendDetail = angular.copy(selectedOrderExtendDetail);
    $scope.hideDlg = function () {
        $mdDialog.hide({
            'selectedOrderExtendDetail': $scope.selectedOrderExtendDetail
        });
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('PmmOrderDetailController', function ($scope, $mdDialog, selectedOrderDetail, saleTypes) {
    $scope.selectedOrderDetail = angular.copy(selectedOrderDetail);
    $scope.saleTypes = saleTypes;

    $scope.hideDlg = function () {
        $mdDialog.hide({
            'selectedOrderDetail': $scope.selectedOrderDetail
        });
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('OrderPromotionSearchController', function ($scope, $mdDialog, ChannelPromotionService) {
    $scope.pageOption = {
        sizePerPage: 6,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.refresh = function () {
        ChannelPromotionService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 2, 1, '', '', $scope.searchKeyword)
        .success(function (data) {
            $scope.resp = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refresh();

    $scope.select = function (data) {
        $scope.promotion = data;
        $mdDialog.hide($scope.promotion);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.promotion);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});


