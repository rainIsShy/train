angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/orders', {
        controller: 'OrdersController',
        templateUrl: 'app/src/app/order/sales_slip/salesSlip.html'
    })
}]);

angular.module('IOne-Production').controller('OrdersController', function ($scope, $q, $window, OrderMaster, OrderDetail, OrderExtendDetail, OrderExtendDetail2,
                                                                           ReceiptDetail, OrderItemCustomDetail, OrderCustomScope,
                                                                           $mdDialog, $timeout, Constant, SaleTypes, Parameters) {
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
        'orderMasterNo': {display: true, name: '产品销售单单号'},
        showPsoOrderMstNo: false
    };

    $scope.formMenuDisplayOption = {
        '107-change': {display: true, name: '变更', uuid: '5DE0EF4C-B930-4142-A0A0-7F3CB8F613F9'},
        '108-changehistory': {display: true, name: '变更记录查询', uuid: '2DFA0414-5182-49DA-874E-6E296DA45E38'},
        '410-selectAll': {display: false, name: '全选', uuid: 'B111653E-10C8-4250-98DC-3802752641E0'},
        '411-audit': {display: true, name: '审核', uuid: '93052560-2E65-4310-8B23-B9749667D5F0'},
        '412-return': {display: true, name: '退回', uuid: '0621DC29-117D-4366-9E44-E0ADF18B83A6'},
        '413-throw': {display: true, name: '内部抛转', uuid: 'A14299FB-B094-4EE2-8D03-6605B532385F'},
        '414-effective': {display: true, name: '失效作废', uuid: '3AAA3FC1-E0B9-44B1-8E08-F646E15B61DC'},
        '416-revertAudit': {display: true, name: '取消审核', uuid: 'D7CCBC12-4B71-44A4-A269-CC4125458F02'},
        '417-print': {display: true, name: '打印', uuid: '31964B09-78B1-4C27-A2CD-DC0837E746B8'},
        '418-oneOffSync': {display: true, name: '一键抛转', uuid: '71E103D7-D859-401F-8F0C-6154234AD4F0'},
        '419-rollbackTransfer': {display: true, name: '抛转还原', uuid: 'D7A760B7-576F-41AD-938A-E4FFAD2D1012'}
    };

    $scope.orderListMenuDisplayOption = {
        '400-selectAll': {display: true, name: '全选', uuid: '8106C59A-2096-4C5D-AFD0-B6CA49B9DA6D'},
        '401-audit': {display: true, name: '审核', uuid: '29203E56-301A-4ACC-85D2-A66566839D82'},
        '402-return': {display: true, name: '退回', uuid: '919BF746-A198-46F5-8B86-113C04B3F674'},
        '403-throw': {display: true, name: '内部抛转', uuid: '85425E68-180D-4ED7-A808-A03DE95E3B31'},
        '404-effective': {display: true, name: '失效作废', uuid: 'AA2AC2B0-D88B-4F66-B07F-CCAC1765B034'},
        '405-query': {display: true, name: '查询', uuid: '30B731D9-180C-4846-BA14-9FB614DD41B9'},
        '406-revertAudit': {display: true, name: '取消审核', uuid: '6E7EABF4-69FD-4C37-91C2-7BDDCD7164A6'},
        '407-oneOffSync': {display: true, name: '一键抛转', uuid: '8ee02864-f13f-4323-bf4c-914720f325aa'},
        '409-rollbackTransfer': {display: true, name: '抛转还原', uuid: 'F00E4D66-111D-457E-AD69-F4B215A4CE5F'}
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

    $scope.printAction = function () {
        Parameters.getAll($scope.selectedItem.channel.uuid).success(function (data) {
            if (data.content && data.content.length > 0) {
                if ($scope.selectedItem.paidRate.substring(0, $scope.selectedItem.paidRate.length - 1) / 100 >= data.content[0].depositRate) {
                    OrderMaster.print('sale_order_reports', $scope.selectedItem.uuid).success(function (response) {
                        $window.open(response.content);
                    }).error(function () {
                        $scope.showError('获取打印信息失败。');
                    })
                } else {
                    $scope.showError('该订单订金不足，无法打印，请继续收款或改为意向单。');
                }
            }
        });

    };

    $scope.oneOffSync = function () {
        var mstList = [];
        var uuidList = [];
        if ($scope.selectedItem) {
            if ($scope.selectedItem.confirm != Constant.CONFIRM[2].value) {
                $scope.showWarn('产品销售单' + $scope.selectedItem.no + '未审核。');
                return;
            }
            mstList.push($scope.selectedItem);
            uuidList.push($scope.selectedItem.uuid)
        } else {
            angular.forEach($scope.selected, function (orderMaster) {
                if (orderMaster.confirm != Constant.CONFIRM[2].value) {
                    $scope.showWarn('产品销售单' + orderMaster.no + '未审核。');
                    return;
                }
                mstList.push(orderMaster);
                uuidList.push(orderMaster.uuid);
            });
        }

        if (uuidList.length > 0) {
            OrderMaster.oneOffSync(uuidList.join(','), {}).success(function (response) {
                if (response) {
                    angular.forEach(response, function (item) {
                        if (item.code == 0) {
                            $scope.showInfo('一键同步成功。');
                        } else if (item.code == 1) {
                            if (item['lastResult'] && item['lastResult']['code'] == 0) {
                                $scope.showWarn('销售单抛转成功， 预订单已经存在。');
                            }
                        } else {
                            if (item['lastResult'] && item['lastResult']['code'] == 0) {
                                $scope.showWarn('销售单抛转成功， 预订单抛转失败。');
                            }
                        }
                        $scope.queryMenuActionWithPaging();
                    });
                }
            }).error(function (response) {
                $scope.showError(response.message);
            })
        } else {
            $scope.showWarn('请选择待抛转销售单。');
        }
    };

    $scope.editItem = function (orderMaster) {
        $scope.toggle(orderMaster, $scope.selected);
        $scope.selectedDetail = [];
        $scope.orderListMenu.selectAll = false;

        $scope.selectedItem = orderMaster;
        //表单比率百分比显示
        $scope.selectedItem.discountRate = (Math.round($scope.selectedItem.discountRate * 10000) / 100).toFixed(2) + '%';
        $scope.selectedItem.orderDiscountRate = (Math.round($scope.selectedItem.orderDiscountRate * 10000) / 100).toFixed(2) + '%';
        $scope.selectedItem.paidRate = (Math.round($scope.selectedItem.paidRate * 10000) / 100).toFixed(2) + '%';

        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);

        //需要考虑灰化其他按钮
        $scope.resetButtonDisabled();

        // $scope.changeButtonStatus(orderMaster);

        $scope.item_edit_disabled = 0;
        $scope.orderListMenu.effectiveType = orderMaster.status;

        //只有在审核状态是未审核pso_order_mst.confirm='1'并且启用状态为生效pso_order_mst.status='1'时才可修改产品信息以及出货信息
        if (!(orderMaster.confirm == 1 && orderMaster.status == 1 )) {
            $scope.item_edit_disabled = 1;
        }

        OrderDetail.get(orderMaster.uuid).success(function (data) {
            $scope.OrderDetailList = data;

            angular.forEach($scope.OrderDetailList.content, function (item) {
                var idx = $scope.selectedDetail.indexOf(item);
                if (idx < 0) {
                    $scope.selectedDetail.push(item);
                }
            });
            //需要考虑灰化其他按钮
            $scope.changeButtonStatuOnly();

            $scope.updateOrderDetaiDeliverDate($scope.OrderDetailList);
            $scope.OrderExtendDetailList = [];
            angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                OrderExtendDetail.get(orderMaster.uuid, orderDetail.uuid).success(function (data) {
                    $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                });
            });
        });

        SaleTypes.getAll().success(function (data) {
            $scope.saleTypes = data;
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

        $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.ORDER.LIST_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
        //empty selected item in form
        $scope.selectedDetail = [];
        $scope.OrderDetailList = null;
    };

    $scope.formTabSelected = function () {
        $scope.orderListMenu.showQueryBar = false;
        // $scope.orderListMenuDisplayOption['400-selectAll'].display = false;
        $scope.getMenuAuthData($scope.RES_UUID_MAP.PSO.ORDER.FORM_PAGE.RES_UUID).success(function (data) {
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
        OrderDetail.get($scope.selectedItem.uuid).success(function (data) {
            $scope.OrderDetailList = data;
            $scope.updateOrderDetaiDeliverDate($scope.OrderDetailList);
        });
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
            angular.forEach($scope.ReceiptOrderDetailList.content, function (receiptOrderDetail) {
                if (null != receiptOrderDetail.payOrder) {
                    receiptOrderDetail.payOrder = $scope.getImageFullPath(receiptOrderDetail.payOrder);
                }
            });
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
            $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice + orderMaster.orderAmount;
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

        if (!(orderMaster.confirm == 2 && orderMaster.transferPsoFlag == 1 )) {
            $scope.rollback_transfer_button_disabled = 1;
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
        OrderMaster.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem = data;
            $scope.selectedItem.discountRate = (Math.round($scope.selectedItem.discountRate * 10000) / 100).toFixed(2) + '%';
            $scope.selectedItem.orderDiscountRate = (Math.round($scope.selectedItem.orderDiscountRate * 10000) / 100).toFixed(2) + '%';
            $scope.selectedItem.paidRate = (Math.round($scope.selectedItem.paidRate * 10000) / 100).toFixed(2) + '%';
//             $scope.selectedItem.deliverDate = moment($scope.selectedItem.deliverDate).format('YYYY-MM-DD');
            $scope.updateOrderMaster($scope.selectedItem);
            $scope.selectedDetail = [];
            $scope.orderListMenu.selectAll = false;

            //需要考虑灰化其他按钮
            $scope.resetButtonDisabled();
            //不支持部分操作，因此需要增加该函数重新灰显按钮
            $scope.changeButtonStatus($scope.selectedItem);

            $scope.orderListMenu.effectiveType = data.status;

            OrderDetail.get($scope.selectedItem.uuid).success(function (data) {
                $scope.OrderDetailList = data;
                angular.forEach($scope.OrderDetailList.content, function (item) {
                    var idx = $scope.selectedDetail.indexOf(item);
                    if (idx < 0) {
                        $scope.selectedDetail.push(item);
                    }
                });

                $scope.updateOrderDetaiDeliverDate($scope.OrderDetailList);
            });

        })
    };


    $scope.effectiveMenuAction = function () {
        if ($scope.selected.length > 0 || $scope.selectedDetail.length > 0) {
            $scope.showConfirm('确认修改启用状态吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    //update $scope.selectedDetail
                    var promises = [];
                    angular.forEach($scope.selectedDetail, function (item) {
                        var OrderDetailUpdateInput = {
                            status: $scope.orderListMenu.effectiveType
                        };
                        var response = OrderDetail.modify($scope.selectedItem.uuid, item.uuid, OrderDetailUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.selectedItem.status = $scope.orderListMenu.effectiveType;
                        $scope.refreshMasterAndDetail();
                        OrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                            $scope.menuList[1].subList[1].suffix = data;
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
                        var response = OrderMaster.modify(OrderMasterUpdateInput).success(function () {
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

    // Parameters.getAll().success(function (data) {
    //     if (data.content && data.content.length > 0) {
    //         $scope.depositRate = data.content[0].depositRate;
    //
    //     }
    // });


    $scope.auditMenuAction = function () {
        // if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS) {
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
            var errorNos = '';

            angular.forEach($scope.selected, function (item) {
                if (item.contractNo == '' || item.contractNo == null || item.contractNo == undefined) {
                    errorNos = errorNos + item.no + '<br>'
                }
            });
            if (errorNos != '') {
                errorNos = errorNos.substr(0, errorNos.length - 1);
                $scope.showError('以下产品销售单合同号为空：' + '<br>' + errorNos);
                return;
            }
        }
        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            if ($scope.selectedItem.contractNo == '' || $scope.selectedItem.contractNo == null || $scope.selectedItem.contractNo == undefined) {
                $scope.showError('该产品销售单合同号为空，不允许审核。');
                return;
            }
        }
        if ($scope.selected.length > 0 || $scope.selectedDetail.length > 0) {
            var mainPromises = [];
            console.log($scope.selected);
            if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                var errorInfo = "";
                angular.forEach($scope.selected, function (item) {
                    // if (item.paidRate < $scope.depositRate) {
                    //     errorInfo = errorInfo + '订单：' + item.no + '的收款比率<' + $scope.depositRate * 100 + '%<br>';
                    // }
                    console.log("before paidrate:" + item.paidRate);
                    var response = Parameters.getAll(item.channel.uuid).success(function (data) {
                        console.log(data);
                        if (data.content && data.content.length > 0) {
                            var itemDepositRate = data.content[0].depositRate;
                            if (item.paidRate < itemDepositRate) {
                                errorInfo = errorInfo + '订单：' + item.no + '的收款比率<' + itemDepositRate * 100 + '%<br>';
                            }
                        }
                    });
                    mainPromises.push(response);
                });
            } else if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                var mainPromises = [];
                var errorInfo = "";
                var paidRate = $scope.selectedItem.paidRate.substring(0, $scope.selectedItem.paidRate.length - 1);
                var response = Parameters.getAll($scope.selectedItem.channel.uuid).success(function (data) {
                    var itemDepositRate = data.content[0].depositRate * 100;

                    if (paidRate < itemDepositRate) {
                        errorInfo = errorInfo + '订单：' + $scope.selectedItem.no + '的收款比率<' + itemDepositRate + '%<br>';
                    }

                });
                mainPromises.push(response);
                console.log(mainPromises);
            }

            $q.all(mainPromises).then(function () {
                $scope.showConfirm('确认审核吗？', errorInfo, function () {
                    if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                        var promises = [];
                        angular.forEach($scope.selectedDetail, function (item) {
                            var OrderDetailUpdateInput = {
                                confirm: '2'
                            };
                            var response = OrderDetail.modify($scope.selectedItem.uuid, item.uuid, OrderDetailUpdateInput).success(function () {


                            });
                            promises.push(response);
                        });

                        $q.all(promises).then(function () {
                            var OrderMasterUpdateInput = {
                                uuid: $scope.selectedItem.uuid,
                                confirm: '2'
                            };
                            var response = OrderMaster.modify(OrderMasterUpdateInput).success(function () {
                                $scope.selectedItem.confirm = '2';
                                $scope.refreshMasterAndDetail();
                                OrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                                    $scope.menuList[1].subList[1].suffix = data;
                                });
                                 $scope.showInfo('修改数据成功。');
                            });
                        });

                    } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                        //update $scope.selected
                        var promises = [];
                        angular.forEach($scope.selected, function (item) {
                            var OrderMasterUpdateInput = {
                                uuid: item.uuid,
                                confirm: '2'
                            };
                            var response = OrderMaster.modify(OrderMasterUpdateInput).success(function () {
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

            });
        }
    };

    $scope.returnMenuAction = function () {
        if ($scope.selected.length > 0 || $scope.selectedDetail.length > 0) {
            $scope.showConfirm('确认退回吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selectedDetail, function (item) {
                        var OrderDetailUpdateInput = {
                            confirm: '4'
                        };
                        var response = OrderDetail.modify($scope.selectedItem.uuid, item.uuid, OrderDetailUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.selectedItem.confirm = '4';
                        $scope.refreshMasterAndDetail();
                        OrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                            $scope.menuList[1].subList[1].suffix = data;
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
                        var response = OrderMaster.modify(OrderMasterUpdateInput).success(function () {
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
        if ($scope.selected.length > 0 || $scope.selectedItem.length > 0) {
            $scope.showConfirm('确认抛转吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var OrderMasterUpdateInput = {
                        PSO_SO_MST_UUID: $scope.selectedItem.uuid,
                        transferPsoFlag: '1'
                    };
                    OrderMaster.modifyBatch(OrderMasterUpdateInput, $scope).success(function () {
                        $scope.selectedItem.transferPsoFlag = Constant.TRANSFER_PSO_FLAG[1].value;
                        $scope.refreshMasterAndDetail();
                        $scope.showInfo('修改数据成功。');
                    }).error(function (data) {
                        $scope.showError(data.message);
                    });

                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    //update $scope.selected
//                       var promises = [];
//                       angular.forEach( $scope.selected, function(item) {
//                            var OrderMasterUpdateInput = {
//                                uuid:item.uuid,
//                                transferPsoFlag: '1'
//                            }
//                           var response  =  OrderMaster.modify(OrderMasterUpdateInput).success(function() {
//                            });
//                            promises.push(response);
//                       });
//                        $q.all(promises).then(function(data){
//                             $scope.queryMenuActionWithPaging();
//                             $scope.showInfo('修改数据成功。');
//                        });

                    var orderMasterUuids = "";
                    angular.forEach($scope.selected, function (item) {
                        orderMasterUuids = orderMasterUuids + item.uuid + ","
                    });
                    var OrderMasterUpdateInput = {
                        PSO_SO_MST_UUID: orderMasterUuids,
                        transferPsoFlag: '1'
                    };
                    var response = OrderMaster.modifyBatch(OrderMasterUpdateInput, $scope).success(function () {
                        $scope.queryMenuActionWithPaging();
                        $scope.showInfo('修改数据成功。');
                    }).error(function (data) {
                        $scope.showError(data.message);
                    });
                }
            });
        }
    };


    $scope.rollbackTransfer = function () {
        if ($scope.selected.length > 0 || $scope.selectedItem.length > 0) {
            $scope.showConfirm('确认抛转还原吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var OrderMasterUpdateInput = {
                        uuid: $scope.selectedItem.uuid,
                        transferPsoFlag: '2'
                    };
                    OrderMaster.modifyBatch(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.transferPsoFlag = Constant.TRANSFER_PSO_FLAG[2].value;
                        $scope.refreshMasterAndDetail();
                        $scope.showInfo('修改数据成功。');
                    }).error(function (data) {
                        $scope.showError(data.message);
                    });

                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {

                    var orderMasterUuids = "";
                    angular.forEach($scope.selected, function (item) {
                        orderMasterUuids = orderMasterUuids + item.uuid + ","
                    });
                    var OrderMasterUpdateInput = {
                        uuid: orderMasterUuids,
                        transferPsoFlag: '2'
                    };
                    var response = OrderMaster.modifyBatch(OrderMasterUpdateInput).success(function () {
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
        if ($scope.selected.length > 0 || $scope.selectedDetail.length > 0) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selectedDetail, function (item) {
                        var OrderDetailUpdateInput = {
                            confirm: '1'
                        };
                        var response = OrderDetail.modify($scope.selectedItem.uuid, item.uuid, OrderDetailUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.selectedItem.confirm = '1';
                        $scope.refreshMasterAndDetail();
                        OrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                            $scope.menuList[1].subList[1].suffix = data;
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
                        var response = OrderMaster.modify(OrderMasterUpdateInput).success(function () {
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
        $scope.rollback_transfer_button_disabled = 0;
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

        OrderMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, confirm,
            status, transferPsoFlag, orderMasterNo, customerName, employeeName, orderDateBegin, orderDateEnd, RES_UUID_MAP.PSO.ORDER.LIST_PAGE.RES_UUID, null, null, null, null, null, null, contractNo)
            .success(function (data) {
                    $scope.OrderMasterList = data;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                    $scope.getOrderDetailCountByMasterUuid();
                    OrderMaster.getOrderMasterCount(Constant.AUDIT[1].value, Constant.STATUS[1].value, Constant.TRANSFER_PSO_FLAG[2].value, RES_UUID_MAP.PSO.ORDER.LIST_PAGE.RES_UUID).success(function (data) {
                        $scope.menuList[1].subList[1].suffix = data;
                    });

                $scope.selectedItem = null;
                $scope.selected = [];
                $scope.selectedItemsCount = 0;
                $scope.selectedItemsTotalPrice = 0.00;
                $scope.orderListMenu.selectAll = false;
                $scope.orderListMenu.effectiveType = '2';
                }
            );
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
//             orderMaster.deliverDate = moment(orderMaster.deliverDate).format('YYYY-MM-DD');
            $scope.updateOrderMaster(orderMaster);
            orderMasterUuids = orderMasterUuids + orderMaster.uuid + ","
        });
        OrderDetail.getAllCountByMasterUuids(orderMasterUuids).success(function (data) {
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
            OrderMaster.modify($scope.selectedItem).success(function () {
                $scope.showInfo('修改商品数据成功。');
            });
        }
    };

    $scope.cancelModifyMenuAction = function () {
        OrderMaster.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem = data;
        })
    };

    $scope.exitModifyMenuAction = function () {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.preAddMenuAction = function () {

        $scope.selectedItem = {
            stopProductionFlag: 'N',
            type: '1'
        };
        $scope.selectedItemPics = [];
        $scope.selectedItemBoms = {};
        $scope.selectedItemCustoms = {};
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
    };

    $scope.addMenuAction = function () {
        if ($scope.selectedItem) {
            OrderMaster.add($scope.selectedItem).success(function (data) {
                $scope.selectedItem = data;
                $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);

                $scope.showInfo('新增商品成功。');
            })
        }
    };

    $scope.cancelAddMenuAction = function () {
        $scope.listTabSelected();
    };

    $scope.deleteMenuAction = function () {
        $scope.showConfirm('确认删除吗？', '删除的商品不可恢复。', function () {
            if ($scope.selectedItem) {
                OrderMaster.delete($scope.selectedItem.uuid).success(function () {
                    $scope.showInfo('删除成功。');
                    $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
                });
            }
        });
    };

    $scope.itemDeleteMenuAction = function (item) {
        $scope.showConfirm('确认删除吗？', '删除的商品不可恢复。', function () {
            if ($scope.item) {
                OrderMaster.delete($scope.item.uuid1).success(function () {
                    $scope.showInfo('删除成功。');
                    $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
                });
            }
        });
    };


    $scope.changeMenuAction = function () {

    };
    $scope.changeHistoryMenuAction = function () {

    };


    //修改产品信息
    $scope.orderDetailEditMenuAction = function (orderDetail) {
        $mdDialog.show({
            controller: 'OrderDetailController',
            templateUrl: 'app/src/app/order/sales_slip/orderDetailEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedOrderDetail: orderDetail,
                saleTypes: $scope.saleTypes
            }
        }).then(function (data) {

            OrderDetail.modify(data.selectedOrderDetail.orderMaster.uuid, data.selectedOrderDetail.uuid, data.selectedOrderDetail).success(function () {
                OrderDetail.get(data.selectedOrderDetail.orderMaster.uuid).success(function (data) {
                    $scope.OrderDetailList = data;
                    $scope.updateOrderDetaiDeliverDate($scope.OrderDetailList);
                });
                $scope.showInfo('修改成功。');
            })
        });
    };

    $scope.updateOrderDetaiDeliverDate = function (OrderDetailList) {
        angular.forEach(OrderDetailList.content, function (orderDetail) {
            if (orderDetail.deliverDate != null) {
                orderDetail.deliverDate = moment(orderDetail.deliverDate).format('YYYY-MM-DD');
            }


            if (orderDetail.originalDeliverDate != null) {
                orderDetail.originalDeliverDate = moment(orderDetail.originalDeliverDate).format('YYYY-MM-DD');
            }

        });
    };

    $scope.updateOrderMaster = function (orderMaster) {
        if (orderMaster.deliverDate != null) {
            orderMaster.deliverDate = moment(orderMaster.deliverDate).format('YYYY-MM-DD');
        }


//           orderMaster.customerAddress.fullDistrict = "";
//           if(null != orderMaster.customerAddress.receiveAddress.receiveDistrict1){
//            orderMaster.customerAddress.fullDistrict = orderMaster.customerAddress.receiveDistrict1.name;
//           }
//
//           if(null != orderMaster.customerAddress.receiveDistrict2){
//               if(orderMaster.customerAddress.fullDistrict.indexOf(orderMaster.customerAddress.receiveDistrict2.name) == -1){
//                 orderMaster.customerAddress.fullDistrict += orderMaster.customerAddress.receiveDistrict2.name;
//               }
//           }
//
//           if(null != orderMaster.customerAddress.receiveDistrict3){
//               if(orderMaster.customerAddress.fullDistrict.indexOf(orderMaster.customerAddress.receiveDistrict3.name) == -1){
//                   orderMaster.customerAddress.fullDistrict += orderMaster.customerAddress.receiveDistrict3.name;
//               }
//           }
    };

    //修改出货信息
    $scope.orderExtendDetailEditMenuAction = function (orderExtendDetail) {
        $mdDialog.show({
            controller: 'OrderExtendDetailController',
            templateUrl: 'app/src/app/order/sales_slip/orderExtendDetailEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedOrderExtendDetail: orderExtendDetail
            }
        }).then(function (data) {
            OrderExtendDetail.modify(data.selectedOrderExtendDetail.orderDetail.orderMaster.uuid, data.selectedOrderExtendDetail.orderDetail.uuid, data.selectedOrderExtendDetail.uuid, data.selectedOrderExtendDetail)
                .success(function () {
                    OrderDetail.get(data.selectedOrderExtendDetail.orderDetail.orderMaster.uuid, data.selectedOrderExtendDetail.orderDetail.uuid).success(function (data) {
                        $scope.OrderDetailList = data;
                        $scope.updateOrderDetaiDeliverDate($scope.OrderDetailList);
                        $scope.OrderExtendDetailList = [];
                        angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                            OrderExtendDetail.get(orderDetail.orderMaster.uuid, orderDetail.uuid).success(function (data) {
                                $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                            });
                        });
                        $scope.showInfo('修改成功。');
                    });

//                    OrderExtendDetail.get(data.selectedOrderExtendDetail.orderDetail.orderMaster.uuid, data.selectedOrderExtendDetail.orderDetail.uuid).success(function(data) {
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

            // });
        });

        //get this particular orderExtendDetail's cutom detail which come from orderExtendDetail2
        // masterUuid, detailUuid, orderExtendDetailUuid, OrderExtendDetail2Input
        var masterUuid = $scope.selectedOrderExtendDetail.orderDetail.orderMaster.uuid;
        var detailUuid = $scope.selectedOrderExtendDetail.orderDetail.uuid;
        var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;
        OrderExtendDetail2.get(masterUuid, detailUuid, orderExtendDetailUuid).success(function (data) {
            $scope.orderExtendDetail2List = data;
            angular.forEach($scope.orderExtendDetail2List.content, function (value) {
                value.informationUuids = JSON.parse(value.information);
            })
        })
    };


    $scope.openAddCustomDlg = function () {
        $mdDialog.show({
            controller: 'OrderExtendDetail2Controller',
            templateUrl: 'app/src/app/order/sales_slip/addCustomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                allCustomsScopes: $scope.allCustomsScopes,
                custom: null,
                allCustoms: $scope.selectedItemCustoms,
                op: 'add'
            }
        }).then(function (data) {

            var OrderExtendDetail2Input = {
                orderExtendDetailUuid: $scope.selectedOrderExtendDetail.uuid,
                no: Math.random().toString(36).substring(10),
                itemUuid: $scope.selectedOrderExtendDetail.item.uuid,
                itemCustomUuid: data.selectedCustom.itemCustom.uuid,
                information: data.selectedCustom.information
            };
            // masterUuid, detailUuid, orderExtendDetailUuid, OrderExtendDetail2Input
            var masterUuid = $scope.selectedOrderExtendDetail.orderDetail.orderMaster.uuid;
            var detailUuid = $scope.selectedOrderExtendDetail.orderDetail.uuid;
            var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;

            OrderExtendDetail2.add(masterUuid, detailUuid, orderExtendDetailUuid, OrderExtendDetail2Input).success(function (response) {
                response.informationUuids = data.selectedCustom.informationUuids;
                $scope.orderExtendDetail2List.content.push(response);
                $scope.OrderExtendDetailList = [];

                angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                    OrderExtendDetail.get(orderDetail.orderMaster.uuid, orderDetail.uuid).success(function (data) {
                        $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                    });
                });
                $scope.showInfo('新增自定义信息成功。');
            })
        });
    };

    $scope.openEditCustomDlg = function (custom) {
        $mdDialog.show({
            controller: 'OrderExtendDetail2Controller',
            templateUrl: 'app/src/app/order/sales_slip/addCustomDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                allCustoms: $scope.selectedItemCustoms,
                allCustomsScopes: $scope.allCustomsScopes,
                custom: custom,
                op: 'modify'
            }
        }).then(function (data) {
            var masterUuid = $scope.selectedOrderExtendDetail.orderDetail.orderMaster.uuid;
            var detailUuid = $scope.selectedOrderExtendDetail.orderDetail.uuid;
            var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;

            var OrderExtendDetail2UpdateInput = {
                itemCustomUuid: data.selectedCustom.itemCustom.uuid,
                information: data.selectedCustom.information
            };

            OrderExtendDetail2.modify(masterUuid, detailUuid, orderExtendDetailUuid, custom.uuid, OrderExtendDetail2UpdateInput).success(function () {
                $scope.OrderExtendDetailList = [];
                angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                    OrderExtendDetail.get(orderDetail.orderMaster.uuid, orderDetail.uuid).success(function (data) {
                        $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                    });
                });

                $scope.showInfo('修改自定义信息成功。');
            })
        });
    };

    $scope.deleteItemCustom = function (deletedOrderExtendDetail2) {

        $scope.showConfirm('确认删除吗？', '删除的自定义信息不可恢复。', function () {
            if (deletedOrderExtendDetail2) {
                var masterUuid = $scope.selectedOrderExtendDetail.orderDetail.orderMaster.uuid;
                var detailUuid = $scope.selectedOrderExtendDetail.orderDetail.uuid;
                var orderExtendDetailUuid = $scope.selectedOrderExtendDetail.uuid;
                OrderExtendDetail2.delete(masterUuid, detailUuid, orderExtendDetailUuid, deletedOrderExtendDetail2.uuid).success(function () {
                    angular.forEach($scope.orderExtendDetail2List.content, function (item, index) {
                        if (deletedOrderExtendDetail2 == item) {
                            $scope.orderExtendDetail2List.content.splice(index, 1);
                        }
                    });
                    $scope.OrderExtendDetailList = [];
                    angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                        OrderExtendDetail.get(orderDetail.orderMaster.uuid, orderDetail.uuid).success(function (data) {
                            $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                        });
                    });

                    $scope.showInfo('删除成功。');
                });
            }
        });
    };
});


angular.module('IOne-Production').controller('OrderExtendDetail2Controller', function ($scope, $mdDialog, allCustoms, allCustomsScopes, custom, op) {

    $scope.allCustoms = allCustoms.content;
    $scope.allCustomsScopes = allCustomsScopes;
    $scope.selectedCustom = custom;
    $scope.op = op;

    if ($scope.selectedCustom) {
        angular.forEach($scope.selectedCustom.informationUuids, function (value, index) {
            angular.forEach($scope.allCustomsScopes[$scope.selectedCustom.itemCustom.uuid], function (item) {
                if (item.uuid == value) {
                    item.checked = true;
                }
            })
        });
    } else {
        $scope.selectedCustom = {
            informationUuids: [],
            //astrict: 2
            itemCustom: {astrict: 2}
        };
    }

    $scope.backUpCustomScopes = function (custom) {
        $scope.backUpInformationUuids = [];
        if (custom != null && custom.informationUuids != null) {
            angular.forEach(custom.informationUuids, function (value, index) {
                $scope.backUpInformationUuids.push(value);
            });
        }
    };
    $scope.backUpCustomScopes(custom);

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
    };

    $scope.selectCustomScopeHandler = function (data, selected) {
        $scope.selectedCustom.informationUuids.push(data.uuid);
    };

    $scope.clearCustomScope = function () {
        $scope.selectedCustom.informationUuids = [];
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
        $scope.selectedCustom.informationUuids = $scope.backUpInformationUuids;
        $mdDialog.cancel();
    };
});


angular.module('IOne-Production').controller('OrderExtendDetailController', function ($scope, $mdDialog, selectedOrderExtendDetail) {
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

angular.module('IOne-Production').controller('OrderDetailController', function ($scope, $mdDialog, selectedOrderDetail, saleTypes) {
    $scope.selectedOrderDetail = angular.copy(selectedOrderDetail);
    $scope.saleTypes = saleTypes.content;


    $scope.hideDlg = function () {
        $mdDialog.hide({
            'selectedOrderDetail': $scope.selectedOrderDetail
        });
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});


