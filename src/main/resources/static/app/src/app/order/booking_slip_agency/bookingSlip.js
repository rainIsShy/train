angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/salesOrder', {
        controller: 'bookingSlipAgencyController',
        templateUrl: 'app/src/app/order/booking_slip_agency/bookingSlip.html'
    })
}]);

angular.module('IOne-Production').controller('bookingSlipAgencyController', function ($scope, $q, PSOdeliverWays, SalesOrderMaster, SalesOrderDetail, SalesOrderExtendDetail, SalesOrderExtendDetail2, OrderItemCustomDetail, OrderCustomScope, OrderChannelCurrency, OrderChannelTax, SaleTypes, $mdDialog, $timeout, Constant) {

    //initialize model value.
    $scope.orderListMenu = {
        select: {
            confirm: Constant.AUDIT[1].value,
            status: Constant.STATUS[1].value,
            transferPsoFlag: Constant.TRANSFER_PSO_FLAG[2].value,
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

    $scope.formMenuDisplayOption = {
        '100-add': {display: false, name: '新增', uuid: '90011648-4AC7-40EB-A847-FAAD9117F838'},
        '101-delete': {display: true, name: '删除', uuid: '5C49B5A1-76EF-417B-9C54-238FB7148AEA'},
        '102-edit': {display: true, name: '编辑', uuid: 'C913DB2D-2473-4807-9221-22AA37E14848'},

        '200-cancel': {display: true, name: '取消新增', uuid: 'BF2D1976-E3AC-47BD-90D3-64AF175FC449'},
        '201-save': {display: true, name: '保存', uuid: '64F8C22E-4AF6-4840-B50C-B47E5CDC45BE'},

        '302-save': {display: true, name: '保存', uuid: 'B226ADDD-328C-44F2-93F3-B4443ADF8E45'},
        '303-cancel': {display: true, name: '取消修改', uuid: '07FF1596-1835-475C-8F80-1B732688C987'},
        '304-quit': {display: true, name: '退出编辑', uuid: '2799A0EB-6BF5-4962-9400-12FA06DD4C78'},

        '107-change': {display: true, name: '变更', uuid: '4D0309D3-16E0-4517-AA09-0F9246786101'},
        '108-changehistory': {display: true, name: '变更记录查询', uuid: '4D7273D6-970C-4825-93CD-73209782CBE8'},

        '410-selectAll': {display: false, name: '全选', uuid: 'F0051ECE-0DD8-41E4-ACA1-7D0FFF15D512'},
        '411-audit': {display: true, name: '审核', uuid: '3DB45A72-755E-4580-8F81-BDC80A06A7CC'},
        '412-return': {display: true, name: '退回', uuid: '43073BCFD-66D2-4E29-8930-ED3A09C698E0'},
        '413-throw': {display: true, name: '抛转后台', uuid: '938FFFD8-BCDD-424E-BF22-F90D6EB872BA'},
        '414-effective': {display: true, name: '失效作废', uuid: '443EF412-7E38-45EF-B6B4-E0A954D0BFD4'},
        '416-revertAudit': {display: true, name: '取消审核', uuid: 'A7468800-9F3C-4116-9016-73CF1CA3F493'}
    };

    $scope.orderListMenuDisplayOption = {
        '400-selectAll': {display: true, name: '全选', uuid: 'B4951D9E-7F02-4330-ADFC-09150CDF992F'},
        '401-audit': {display: true, name: '审核', uuid: '0D7CA48A-B2DD-4BC2-8981-3D3575FD6DCA'},
        '402-return': {display: true, name: '退回', uuid: '4AC1D963-529A-4938-97BB-DF9DB2343DA2'},
        '403-throw': {display: true, name: '抛转后台', uuid: 'B14A229A-6035-445D-9E93-10F99A0333F3'},
        '404-effective': {display: true, name: '失效作废', uuid: 'B6D5104F-0DC9-47C8-843E-CC7677C5D059'},
        '405-query': {display: true, name: '查询', uuid: '4B848B3E-5A1A-4453-9356-6ADE97D93608'},
        '406-revertAudit': {display: true, name: '取消审核', uuid: 'E67D450A-8ABA-48A3-97AA-4FDD1937FA7A'},
        '408-add': {display: true, name: '新增', uuid: '90011648-4AC7-40EB-A847-FAAD9117F838'}
    };

    $scope.itemOperationMenuDisplayOption = {
        '500-item-edit': {display: true, name: ''},
        '501-item-delete': {display: true, name: ''}
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.editItem = function (orderMaster) {
        $scope.selectedDetail = [];
        $scope.orderListMenu.selectAll = false;

        $scope.selectedItem = orderMaster;

//            if(undefined !=  $scope.selectedItem.psoOrderMstNo && null !=  $scope.selectedItem.psoOrderMstNo){
//                  var idx = $scope.selectedItem.psoOrderMstNo.indexOf(',')
//                  if(idx > 0){
//                        $scope.selectedItem.psoOrderMstNo = $scope.selectedItem.psoOrderMstNo.substring(0,idx);
//                  }
//            }

        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);

        //需要考虑灰化其他按钮
        $scope.resetButtonDisabled();
        $scope.changeButtonStatus(orderMaster);
        $scope.orderListMenu.effectiveType = orderMaster.status;

        SalesOrderDetail.get(orderMaster.uuid).success(function (data) {
            $scope.OrderDetailList = data;
            $scope.updateOrderDetaiListDate($scope.OrderDetailList);
            $scope.OrderExtendDetailList = [];
            angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                SalesOrderExtendDetail.get(orderMaster.uuid, orderDetail.uuid).success(function (data) {
                    $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                });
            });
        });

        OrderChannelCurrency.getAll().success(function (data) {
            $scope.channelCurrencies = data.content;
        });

        OrderChannelTax.getAll().success(function (data) {
            $scope.channelTaxs = data.content;
        });
        SaleTypes.getAll().success(function (data) {
            $scope.saleTypes = data.content;
        });

        PSOdeliverWays.getAll().success(function (data) {
            $scope.deliverWays = data.content;
        });

        if ($scope.selectedItem.orderTransferNo != undefined && $scope.selectedItem.orderTransferNo != null) {
            $scope.formMenuDisplayOption['102-edit'].display = false;
            $scope.formMenuDisplayOption['101-delete'].display = false;
        } else {
            $scope.formMenuDisplayOption['102-edit'].display = true;
            $scope.formMenuDisplayOption['101-delete'].display = true;
        }

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

        $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.SO.LIST_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
        //empty selected item in form
        $scope.selectedDetail = [];
        $scope.OrderDetailList = null;
    };

    $scope.formTabSelected = function () {
        $scope.orderListMenu.showQueryBar = false;
        $scope.orderListMenuDisplayOption['400-selectAll'].display = false;
        $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.SO.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.prodInfoTabSelected = function () {
        $scope.changeSubTabIndexs(0);
        // 自定义属性reset
        $scope.allCustomsScopes = null;
        $scope.orderExtendDetail2List = null;
        $scope.selectedItemCustoms = null;


        //load orderDetail again, in case of itemAttribute was changed
//             SalesOrderDetail.get($scope.selectedItem.uuid).success(function(data) {
//                   $scope.OrderDetailList = data;
//                   $scope.updateOrderDetaiListDate( $scope.OrderDetailList);
//             });
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
            $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice + orderMaster.originalOrderAmount;
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
        //confirm:1=未审核/2=已审核/3=审核中/4=退回   status:"1=有效/2=无效  transferPsoFlag format = "1=是/2=否",
        //只有未审核和退回状态的单据才可以作废,
        if (orderMaster.confirm == 2 || orderMaster.confirm == 3) {
            $scope.effectiveType_disabled = 1;
        }

        //未审核和审核中的都可以退回
        if (orderMaster.confirm == 2 || orderMaster.confirm == 4) {
            $scope.return_button_disabled = 1;
        }
        //如果都是勾选的未审核的，允许审核  只要有一个是已审核的，就不允许审核
        if (orderMaster.confirm == 2 || orderMaster.confirm == 4) {
            $scope.audit_button_disabled = 1;
        }
        //只有已审核且尚未抛转的单子可以抛转
        if (!(orderMaster.confirm == 2 && orderMaster.transferPsoFlag != 1 )) {
            $scope.throw_button_disabled = 1;
        }
        //只有已审核并且尚未抛转的单据可取消审核，若勾选单据中有其他审核状态的单据，则灰显按钮，若用户无权限取消审核，也灰显按钮；
        if (!(orderMaster.confirm == 2 && orderMaster.transferPsoFlag != 1 )) {
            $scope.revert_audit_button_disabled = 1;
        }
    };
    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };


    $scope.selectedDetail = [];
    $scope.toggleDetail = function (item, selectedDetail) {
        var idx = selectedDetail.indexOf(item);
        if (idx > -1) {
            selectedDetail.splice(idx, 1);
        }
        else {
            selectedDetail.push(item);
        }

        $scope.orderListMenu.effectiveType = item.status;

        //需要考虑灰化其他按钮
        $scope.resetButtonDisabled();
        $scope.changeButtonStatuOnly();
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
                    var idx = $scope.selectedDetail.indexOf(item);
                    if (idx < 0) {
                        $scope.selectedDetail.push(item);
                    }
                });
                //需要考虑灰化其他按钮
                $scope.resetButtonDisabled();
                $scope.changeButtonStatuOnly();
            } else if ($scope.orderListMenu.selectAll == false) {
                $scope.selectedDetail = [];
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
        SalesOrderMaster.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem = data;
            $scope.updateOrderMasterDate($scope.selectedItem);
            $scope.selectedDetail = [];
            $scope.orderListMenu.selectAll = false;

            //需要考虑灰化其他按钮
            $scope.resetButtonDisabled();

            $scope.orderListMenu.effectiveType = data.status;

            SalesOrderDetail.get($scope.selectedItem.uuid).success(function (data) {
                $scope.OrderDetailList = data;
                $scope.updateOrderDetaiListDate($scope.OrderDetailList);
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
                    SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.status = $scope.orderListMenu.effectiveType;
                        $scope.editItem($scope.selectedItem);
                        SalesOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO.LIST_PAGE.RES_UUID).success(function (data) {
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
                        var response = SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
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
                    SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.confirm = '2';
                        $scope.editItem($scope.selectedItem);
                        SalesOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO.LIST_PAGE.RES_UUID).success(function (data) {
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
                            confirm: '2'
                        };
                        var response = SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
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
                    SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.confirm = '4';
                        $scope.editItem($scope.selectedItem);
                        SalesOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO.LIST_PAGE.RES_UUID).success(function (data) {
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
                        var response = SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
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
        if ($scope.selected.length > 0 || $scope.selectedTabIndex == 1) {
            $scope.showConfirm('确认抛转吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var OrderMasterUpdateInput = {
                        uuid: $scope.selectedItem.uuid,
                        transferPsoFlag: '1'
                    };
                    SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.transferPsoFlag = '1';
                        $scope.editItem($scope.selectedItem);
                        SalesOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO.LIST_PAGE.RES_UUID).success(function (data) {
                            $scope.menuList[1].subList[2].suffix = data;
                        });
                        $scope.showInfo('修改数据成功。');
                    });
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    //update $scope.selected
//                           var promises = [];
//                           angular.forEach( $scope.selected, function(item) {
//                                var OrderMasterUpdateInput = {
//                                    uuid:item.uuid,
//                                    transferPsoFlag: '1'
//                                }
//                               var response  =  SalesOrderMaster.modify(OrderMasterUpdateInput).success(function() {
//                                });
//                                promises.push(response);
//                           });
//                            $q.all(promises).then(function(data){
//                                 $scope.queryMenuActionWithPaging();
//                                 $scope.showInfo('修改数据成功。');
//                            });
//
                    var orderMasterUuids = "";
                    angular.forEach($scope.selected, function (item) {
                        orderMasterUuids = orderMasterUuids + item.uuid + ","
                    });
                    var OrderMasterUpdateInput = {
                        uuid: orderMasterUuids,
                        transferPsoFlag: '1'
                    };
                    var response = SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.queryMenuActionWithPaging();
                        $scope.showInfo('修改数据成功。');
                    }).error(function (data) {
                        $scope.showError(data.message);
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
                    SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.confirm = '1';
                        $scope.editItem($scope.selectedItem);
                        SalesOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO.LIST_PAGE.RES_UUID).success(function (data) {
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
                        var response = SalesOrderMaster.modify(OrderMasterUpdateInput).success(function () {
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

        if ($scope.orderListMenu.orderId !== undefined) {
            orderMasterNo = $scope.orderListMenu.orderId;
        } else {
            orderMasterNo = null;
        }

        if ($scope.orderListMenu.psoOrderMstNo !== undefined) {
            psoOrderMstNo = $scope.orderListMenu.psoOrderMstNo;
        } else {
            psoOrderMstNo = null;
        }


        if ($scope.orderListMenu.clientName !== undefined) {
            customerName = $scope.orderListMenu.clientName;
        } else {
            customerName = null;
        }

        if ($scope.orderListMenu.employeeName !== undefined) {
            employeeName = $scope.orderListMenu.employeeName;
        } else {
            employeeName = null;
        }

        if ($scope.orderListMenu.contractNo !== undefined) {
            contractNo = $scope.orderListMenu.contractNo;
        } else {
            contractNo = null;
        }

        confirm = $scope.orderListMenu.select.confirm;
        status = $scope.orderListMenu.select.status;
        transferPsoFlag = $scope.orderListMenu.select.transferPsoFlag;

        SalesOrderMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, confirm, status, transferPsoFlag,
            orderMasterNo, psoOrderMstNo, null, employeeName, orderDateBegin, orderDateEnd, RES_UUID_MAP.PSO.SO.LIST_PAGE.RES_UUID, null, customerName, null, contractNo)
            .success(function (data) {
                    $scope.OrderMasterList = data;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                    $scope.getOrderDetailCountByMasterUuid();
                    SalesOrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.SO.LIST_PAGE.RES_UUID).success(function (data) {
                        $scope.menuList[1].subList[2].suffix = data;
                    });

                $scope.selectedItem = null;
                $scope.selected = [];
                $scope.selectedItemsCount = 0;
                $scope.selectedItemsTotalPrice = 0.00;
                $scope.orderListMenu.selectAll = false;
                $scope.orderListMenu.effectiveType = '2';

                $scope.resetInitialValue();

                }
            )
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

    $scope.getOrderDetailCountByMasterUuid = function () {
        var orderMasterUuids = "";
        angular.forEach($scope.OrderMasterList.content, function (orderMaster) {
            $scope.updateOrderMasterDate(orderMaster);
            orderMasterUuids = orderMasterUuids + orderMaster.uuid + ","
        });
        SalesOrderDetail.getAllCountByMasterUuids(orderMasterUuids).success(function (data) {
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
            SalesOrderMaster.modify($scope.selectedItem).success(function () {
                $scope.showInfo('修改数据成功。');
            }).error(function () {
                $scope.showError('修改数据失败。');
            });
        }
    };

    $scope.cancelModifyMenuAction = function () {
        SalesOrderMaster.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem = data;
            $scope.updateOrderMasterDate($scope.selectedItem);

            PSOdeliverWays.getAll().success(function (data) {
                $scope.deliverWays = data.content;
            });
        })
    };

    $scope.exitModifyMenuAction = function () {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.preAddMenuAction = function () {
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);

        orderDate = new Date();
        deliverDate = new Date(orderDate.valueOf() + 2 * 24 * 60 * 60 * 1000);
        $scope.selectedItem = {
            confirm: '1',
            status: '1',
            transferPsoFlag: '2',
            orderDate: orderDate,
            deliverDate: deliverDate,
        };
        $scope.OrderDetailList = {};
    };

    $scope.addMenuAction = function () {
        if ($scope.selectedItem) {

            SalesOrderMaster.add($scope.selectedItem).success(function (data) {
                $scope.selectedItem = data;
                var promises = [];
                angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                    var response = SalesOrderDetail.add($scope.selectedItem.uuid, orderDetail).success(function (data) {
                    });
                    promises.push(response);
                });

                $q.all(promises).then(function () {
                    $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
                    $scope.editItem($scope.selectedItem);
                    $scope.showInfo('新增成功。');
                }, function () {
                    SalesOrderMaster.delete($scope.selectedItem.uuid).success(function () {
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
                SalesOrderMaster.delete($scope.selectedItem.uuid).success(function () {
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
                templateUrl: 'app/src/app/order/booking_slip_agency/selectItems.html',
                parent: angular.element(document.body),
                targetEvent: event,
                locals: {
                    channelUuid: $scope.selectedItem.channel.uuid,
                    saleTypes: $scope.saleTypes
                }
            }).then(function (data) {
                //existing order
                if ($scope.selectedItem.uuid != undefined && $scope.selectedItem.uuid != null) {
                    SalesOrderDetail.add($scope.selectedItem.uuid, data.addOrderDetail).success(function (data) {
                        $scope.editItem(data.salesOrderMaster);
                        $scope.showInfo('新增产品成功。');
                    });
                } else {
                    //new order
                    if ($scope.OrderDetailList.content == undefined) {
                        $scope.OrderDetailList.content = [];
                    }
                    $scope.OrderDetailList.content.push(data.addOrderDetail);

                    $scope.updateOrderMasterPrice($scope.OrderDetailList.content);
                }
            });
        }

    };

    $scope.orderDetailDeleteMenuAction = function (orderDetail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem.uuid != undefined && $scope.selectedItem.uuid != null) {
                SalesOrderDetail.delete(orderDetail.salesOrderMaster.uuid, orderDetail.uuid).success(function () {
                    $scope.editItem($scope.selectedItem);
                    $scope.showInfo('删除成功。');
                });
            } else {
                $scope.OrderDetailList.content.splice($scope.OrderDetailList.content.indexOf(orderDetail), 1);
                $scope.updateOrderMasterPrice($scope.OrderDetailList.content);
            }
        });
    };

//标准金额：pso_so_mst.ori_standard_amt 为pso_so_dtl.ori_standard_amt汇总   originalStandardAmount
//折扣金额：pso_so_mst.ori_discount_amt为pso_so_dtl.ori_discount_amt汇总   originalDiscountAmount
//折后金额：pso_so_mst.ori_order_amt为pso_so_dtl.ori_order_amt汇总   originalOrderAmount
//折扣率：pso_so_mst.discount_rate，不可维护，折后金额/标准金额  discountRate
    $scope.updateOrderMasterPrice = function (orderDetailList) {
        $scope.selectedItemsOriStandardAmt = 0.00;
        $scope.selectedItemsOriDiscountAmt = 0.00;
        $scope.selectedItemsOriOrderAmt = 0.00;
        $scope.selectedItemsDiscountRate = 0.00;

        angular.forEach(orderDetailList, function (orderDetail) {
            if (null != orderDetail.originalStandardAmount && null != orderDetail.originalDiscountAmount && null != orderDetail.originalOrderAmount) {
                $scope.selectedItemsOriStandardAmt = parseFloat(($scope.selectedItemsOriStandardAmt + orderDetail.originalStandardAmount * orderDetail.orderQuantity).toFixed(2));
                $scope.selectedItemsOriDiscountAmt = parseFloat(($scope.selectedItemsOriDiscountAmt + orderDetail.originalDiscountAmount * orderDetail.orderQuantity).toFixed(2));
                $scope.selectedItemsOriOrderAmt = parseFloat(($scope.selectedItemsOriOrderAmt + orderDetail.originalOrderAmount * orderDetail.orderQuantity).toFixed(2));
            }
        });
        if ($scope.selectedItemsOriStandardAmt != 0.00) {
            $scope.selectedItemsDiscountRate = parseFloat(($scope.selectedItemsOriOrderAmt / $scope.selectedItemsOriStandardAmt).toFixed(4));
        }

        $scope.selectedItem.originalStandardAmount = $scope.selectedItemsOriStandardAmt;
        $scope.selectedItem.originalDiscountAmount = $scope.selectedItemsOriDiscountAmt;
        $scope.selectedItem.originalOrderAmount = $scope.selectedItemsOriOrderAmt;
        $scope.selectedItem.discountRate = $scope.selectedItemsDiscountRate;
    };

    //修改产品信息
    $scope.orderDetailEditMenuAction = function (orderDetail) {
        $mdDialog.show({
            controller: 'SalesOrderDetailController',
            templateUrl: 'app/src/app/order/booking_slip_agency/orderDetailEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedOrderDetail: orderDetail,
                saleTypes: $scope.saleTypes
            }
        }).then(function (data) {

            SalesOrderDetail.modify(data.selectedOrderDetail.salesOrderMaster.uuid, data.selectedOrderDetail.uuid, data.selectedOrderDetail).success(function () {
                SalesOrderDetail.get(data.selectedOrderDetail.salesOrderMaster.uuid).success(function (data) {
                    $scope.OrderDetailList = data;
                    $scope.updateOrderDetaiListDate($scope.OrderDetailList);
                });
                $scope.showInfo('修改成功。');
            })
        });
    };

    $scope.updateOrderDetaiListDate = function (OrderDetailList) {
        angular.forEach(OrderDetailList.content, function (orderDetail) {
            $scope.updateOrderDetailDate(orderDetail);
        });
    };

    $scope.updateOrderDetailDate = function (orderDetail) {
        if (null != orderDetail.deliverDate) {
            orderDetail.deliverDate = new Date(orderDetail.deliverDate);
        }

//                 OrderDetail.orderDate= new Date(OrderDetail.orderDate);
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
            controller: 'SalesOrderExtendDetailController',
            templateUrl: 'app/src/app/order/booking_slip_agency/orderExtendDetailEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedOrderExtendDetail: orderExtendDetail
            }
        }).then(function (data) {
            SalesOrderExtendDetail.modify(data.selectedOrderExtendDetail.salesOrderDetail.salesOrderMaster.uuid, data.selectedOrderExtendDetail.salesOrderDetail.uuid, data.selectedOrderExtendDetail.uuid, data.selectedOrderExtendDetail)
                .success(function () {
                    SalesOrderDetail.get(data.selectedOrderExtendDetail.salesOrderDetail.salesOrderMaster.uuid, data.selectedOrderExtendDetail.salesOrderDetail.uuid).success(function (data) {
                        $scope.OrderDetailList = data;
                        $scope.updateOrderDetaiListDate($scope.OrderDetailList);
                        $scope.OrderExtendDetailList = [];
                        angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                            SalesOrderExtendDetail.get(orderDetail.salesOrderMaster.uuid, orderDetail.uuid).success(function (data) {
                                $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                            });
                        });
                        $scope.showInfo('修改成功。');
                    });

                    //                    OrderExtendDetail.get(data.selectedOrderExtendDetail.salesOrderDetail.salesOrderMaster.uuid, data.selectedOrderExtendDetail.salesOrderDetail.uuid).success(function(data) {
                    //                                      $scope.OrderExtendDetailListUpdated = $scope.OrderExtendDetailListUpdated.concat(data.content);
                    //                                      angular.forEach($scope.OrderExtendDetailListUpdated, function(orderExtendDetailUpdated, index) {
                    //                                                              var keepGoing = true;
                    //                                                              angular.forEach( $scope.OrderExtendDetailList, function(orderExtendDetail, index){
                    //                                                                  if(keepGoing) {
                    //                                                                    if(orderExtendDetailUpdated.uuid == orderExtendDetail.uuid){
                    //                                                                           orderExtendDetail = angular.copy(orderExtendDetailUpdated);
                    //                                                                           keepGoing = false;
                    //                                                                     };
                    //                                                                  }
                    //                                                              });
                    //
                    //                                                          });
                    //                                       $scope.showInfo('修改成功。');
                    //                     });

                });
        });
    };


    $scope.editItemCustom = function (orderExtendDetail) {
        $scope.selectedOrderExtendDetail = orderExtendDetail;
        $scope.changeSubTabIndexs(2);
        //get item all the custom detail
        OrderItemCustomDetail.getCustomDetail(orderExtendDetail.item.uuid).success(function (data) {
            $scope.allCustomsScopes = {};
            //Get customization detail
            //  ProductionItemCustom.get(orderExtendDetail.item.uuid).success(function(data) {
            $scope.selectedItemCustoms = data;
            angular.forEach($scope.selectedItemCustoms.content, function (value) {
                value.informationUuids = JSON.parse(value.information);
            });

            angular.forEach($scope.selectedItemCustoms.content, function (itemCustomDetail) {
                angular.forEach(itemCustomDetail.informationUuids, function (informationUuid) {
                    OrderCustomScope.getCustomScope(itemCustomDetail.itemCustom.uuid, informationUuid).success(function (data) {

                        if (data.brand != null && orderExtendDetail.item.brand != null && orderExtendDetail.item.brand.name != data.brand.name) {
                            //do nothing,because
                            //若plm_base_custom_scope.plm_base_brand_file_uuid非空（目前主要是颜色定制），还需通过plm_base_custom_scope.plm_base_brand_file_uuid
                            //关联来限制可定制的属性，通过 pso_order_ext_dtl2.plm_base_item_file_uuid=plm_base_item_file.uuid and
                            //plm_base_item_file.plm_base_brand_file_uuid=plm_base_custom_scope.plm_base_brand_file_uuid来限制允许定制的属性（如该包件允许定制的颜色）                                             //do nothing

                        } else {
                            console.log($scope.allCustomsScopes);
                            if ($scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] == undefined) {
                                var value = {};
                                value[data.uuid] = data;
                                $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] = value;
                            } else {
                                var value = $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid];
                                value[data.uuid] = data;
                                $scope.allCustomsScopes[itemCustomDetail.itemCustom.uuid] = value;
                            }
                        }

                    })
                });
            });

        });

        //get this particular orderExtendDetail's cutom detail which come from orderExtendDetail2
        // masterUuid, detailUuid, orderExtendDetailUuid, OrderExtendDetail2Input
        var masterUuid = $scope.selectedOrderExtendDetail.salesOrderDetail.salesOrderMaster.uuid;
        var detailUuid = $scope.selectedOrderExtendDetail.salesOrderDetail.uuid;
        var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;
        SalesOrderExtendDetail2.get(masterUuid, detailUuid, orderExtendDetailUuid).success(function (data) {
            $scope.orderExtendDetail2List = data;
            angular.forEach($scope.orderExtendDetail2List.content, function (value) {
                value.informationUuids = JSON.parse(value.information);
            })
        })
    };


    $scope.openAddCustomDlg = function () {
        $mdDialog.show({
            controller: 'SalesOrderExtendDetail2Controller',
            templateUrl: 'app/src/app/order/booking_slip_agency/addCustomDlg.html',
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
                // information: data.selectedCustom.information
                information: data.selectedCustom.informationScope
            };
            // masterUuid, detailUuid, orderExtendDetailUuid, OrderExtendDetail2Input
            var masterUuid = $scope.selectedOrderExtendDetail.salesOrderDetail.salesOrderMaster.uuid;
            var detailUuid = $scope.selectedOrderExtendDetail.salesOrderDetail.uuid;
            var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;

            SalesOrderExtendDetail2.add(masterUuid, detailUuid, orderExtendDetailUuid, OrderExtendDetail2Input).success(function (response) {
                response.informationUuids = data.selectedCustom.informationUuids;
                $scope.orderExtendDetail2List.content.push(response);
                $scope.OrderExtendDetailList = [];

                angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                    SalesOrderExtendDetail.get(orderDetail.salesOrderMaster.uuid, orderDetail.uuid).success(function (data) {
                        $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                    });
                });
                $scope.editItemCustom($scope.selectedOrderExtendDetail);
                $scope.showInfo('新增自定义信息成功。');
            })
        });
    };

    $scope.openEditCustomDlg = function (custom) {
        $mdDialog.show({
            controller: 'SalesOrderExtendDetail2Controller',
            templateUrl: 'app/src/app/order/booking_slip_agency/addCustomDlg.html',
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
            var masterUuid = $scope.selectedOrderExtendDetail.salesOrderDetail.salesOrderMaster.uuid;
            var detailUuid = $scope.selectedOrderExtendDetail.salesOrderDetail.uuid;
            var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;

            var OrderExtendDetail2UpdateInput = {
                itemCustomUuid: data.selectedCustom.itemCustom.uuid,
                //information: data.selectedCustom.information
                information: data.selectedCustom.informationScope
            };

            SalesOrderExtendDetail2.modify(masterUuid, detailUuid, orderExtendDetailUuid, custom.uuid, OrderExtendDetail2UpdateInput).success(function () {
                $scope.OrderExtendDetailList = [];
                angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                    SalesOrderExtendDetail.get(orderDetail.salesOrderMaster.uuid, orderDetail.uuid).success(function (data) {
                        $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                    });
                });
                $scope.editItemCustom($scope.selectedOrderExtendDetail);
                $scope.showInfo('修改自定义信息成功。');
            })
        });
    };

    $scope.deleteItemCustom = function (deletedOrderExtendDetail2) {

        $scope.showConfirm('确认删除吗？', '删除的自定义信息不可恢复。', function () {
            if (deletedOrderExtendDetail2) {
                var masterUuid = $scope.selectedOrderExtendDetail.salesOrderDetail.salesOrderMaster.uuid;
                var detailUuid = $scope.selectedOrderExtendDetail.salesOrderDetail.uuid;
                var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;
                SalesOrderExtendDetail2.delete(masterUuid, detailUuid, orderExtendDetailUuid, deletedOrderExtendDetail2.uuid).success(function () {
                    angular.forEach($scope.orderExtendDetail2List.content, function (item, index) {
                        if (deletedOrderExtendDetail2 == item) {
                            $scope.orderExtendDetail2List.content.splice(index, 1);
                        }
                    });
                    $scope.OrderExtendDetailList = [];
                    angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                        SalesOrderExtendDetail.get(orderDetail.salesOrderMaster.uuid, orderDetail.uuid).success(function (data) {
                            $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                        });
                    });

                    $scope.showInfo('删除成功。');
                });
            }
        });
    };


    $scope.openOrderChannelDlg = function () {
        $mdDialog.show({
            controller: 'OrderChannelSearchController',
            templateUrl: 'app/src/app/order/booking_slip_agency/selectChannel.html',
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
            templateUrl: 'app/src/app/order/booking_slip_agency/selectCustomer.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.customer = data;
            $scope.selectedItem.customerUuid = data.uuid;
        });
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
        sizePerPage: 6,
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
        $scope.addOrderDetail.item = data;
        $scope.addOrderDetail.itemUuid = data.uuid;

//        1、	最低出货价：pso_so_dtl.sale_price，不可修改，根据渠道定价带出
//        2、	标准价：pso_so_dtl.standard_price，不可修改，根据渠道定价带出
//        3、	最低出货折扣率：pso_so_dtl.sale_discount_rate，不可修改，根据渠道定价带出
        $scope.addOrderDetail.standardPrice = data.standardPrice;
        $scope.addOrderDetail.saleDiscountRate = data.saleDiscountRate;
        $scope.addOrderDetail.salePrice = data.salePrice;

        $scope.addOrderDetail.orderQuantity = 1;
        angular.forEach($scope.saleTypes, function (saleType, index) {
            if (saleType.name == '常规') {
                $scope.addOrderDetail.saleTypeUuid = saleType.uuid;
            }
        });
        $scope.addOrderDetail.customizeFlag = 2;


        $scope.addOrderDetail.originalStandardAmount = parseFloat(($scope.addOrderDetail.standardPrice * $scope.addOrderDetail.orderQuantity).toFixed(2));

        $scope.addOrderDetail.itemUuid = data.uuid;
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.hideDlg = function () {
        if (null == $scope.addOrderDetail.item) {
            $scope.showError("请选择商品");
        } else if (null == $scope.addOrderDetail.orderQuantity) {
            $scope.showError("请输入数量");
        } else if (null == $scope.addOrderDetail.originalOrderPrice) {
            $scope.showError("请输入订单单价");
        } else {
            $mdDialog.hide({
                'addOrderDetail': $scope.addOrderDetail
            });
        }
    };

    $scope.showError = function (info) {
        toastr["error"](info)
    };


    //2、    特价单价：pso_so_dtl.special_price，非产品销售单抛转的预订单且销售类型cbi_base_sale_type.no='ST05'时可维护
    //3、    促销折扣率：pso_so_dtl.promotion_discount_rate，非产品销售单抛转的预订单且销售类型cbi_base_sale_type.no='ST07'时可维护
    //4、    促销单价：pso_so_dtl.promotion_price，非产品销售单抛转的预订单且销售类型cbi_base_sale_type.no='ST07'时可维护
    $scope.refreshUI = function (saleTypeUuid) {
        $scope.specialPriceDisplay = false;
        $scope.promotionDisplay = false;
        angular.forEach($scope.saleTypes, function (saleType, index) {
            if (saleType.uuid == saleTypeUuid) {
                if (saleType.no == 'ST05') {
                    $scope.specialPriceDisplay = true;
                }

                if (saleType.no == 'ST07') {
                    $scope.promotionDisplay = true;
                }
            }
        });
    };


    //1、	成交价格折扣率：pso_so_dtl.discount_rate，非产品销售单抛转的预订单可维护，但也会受税前金额和标准金额影响，根据税前金额/标准金额计算
    //2、	订单单价：pso_so_dtl.ori_order_price，非产品销售单抛转的预订单可维护，但也会受税前金额和订单数量影响，根据税前金额/订单数量计算
    //3、	税前金额：pso_so_dtl.ori_order_amt，非产品销售单抛转的预订单可维护，但也会受订单单价和订单数量影响，根据订单单价*订单数量计算

    $scope.changeOrderPrice = function () {
        $scope.addOrderDetail.originalOrderAmount = parseFloat(($scope.addOrderDetail.originalOrderPrice * $scope.addOrderDetail.orderQuantity).toFixed(2));
        $scope.addOrderDetail.discountRate = parseFloat(($scope.addOrderDetail.originalOrderPrice / $scope.addOrderDetail.standardPrice).toFixed(4));

        $scope.addOrderDetail.originalDiscountAmount = parseFloat(($scope.addOrderDetail.originalStandardAmount - $scope.addOrderDetail.originalOrderAmount).toFixed(2));
    };

    $scope.changeOrderQuantity = function () {
        $scope.addOrderDetail.originalOrderAmount = parseFloat(($scope.addOrderDetail.originalOrderPrice * $scope.addOrderDetail.orderQuantity).toFixed(2));
        //标准金额：pso_so_mst.ori_standard_amt 为pso_so_dtl.ori_standard_amt汇总   originalStandardAmount
        //折扣金额：pso_so_mst.ori_discount_amt为pso_so_dtl.ori_discount_amt汇总   originalDiscountAmount
        //折后金额：pso_so_mst.ori_order_amt为pso_so_dtl.ori_order_amt汇总   originalOrderAmount   就是税前金额
        $scope.addOrderDetail.originalStandardAmount = parseFloat(($scope.addOrderDetail.standardPrice * $scope.addOrderDetail.orderQuantity).toFixed(2));
        $scope.addOrderDetail.originalDiscountAmount = parseFloat(($scope.addOrderDetail.originalStandardAmount - $scope.addOrderDetail.originalOrderAmount).toFixed(2));
    };

    $scope.changeOrderAmout = function () {
        $scope.addOrderDetail.originalOrderPrice = parseFloat(($scope.addOrderDetail.originalOrderAmount / $scope.addOrderDetail.orderQuantity).toFixed(2));

        $scope.addOrderDetail.originalDiscountAmount = parseFloat(($scope.addOrderDetail.originalStandardAmount - $scope.addOrderDetail.originalOrderAmount).toFixed(2));
    }
});

angular.module('IOne-Production').controller('SalesOrderExtendDetail2Controller', function ($scope, $mdDialog, allCustoms, allCustomsScopes, custom, op, ItemRelationService, itemUuid) {

    $scope.allCustoms = allCustoms.content;
    $scope.allCustomsScopes = allCustomsScopes;
    $scope.selectedCustom = custom;
    $scope.op = op;
    $scope.itemUuid = itemUuid;

    if ($scope.selectedCustom) {
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
            console.log($scope.selectedCustom.information);

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


angular.module('IOne-Production').controller('SalesOrderExtendDetailController', function ($scope, $mdDialog, selectedOrderExtendDetail) {
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

//    angular.module('IOne-Production').controller('SalesOrderDetailController', function($scope, $mdDialog, selectedOrderDetail) {
//        $scope.selectedOrderDetail = angular.copy(selectedOrderDetail);
//        $scope.hideDlg = function() {
//            $mdDialog.hide({
//                'selectedOrderDetail' : $scope.selectedOrderDetail
//            });
//        };
//        $scope.cancelDlg = function() {
//            $mdDialog.cancel();
//        };
//    });


angular.module('IOne-Production').controller('SalesOrderDetailController', function ($scope, $mdDialog, selectedOrderDetail, saleTypes) {
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


