angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/taobao-orders', {
        controller: 'TaobaoOrdersController',
        templateUrl: 'app/src/app/taobao_data/order/taobaoOrders.html'
    })
}]);

angular.module('IOne-Production').controller('TaobaoOrdersController', function ($location,$scope, $q, TaobaoOrders, TaobaoOrderDetail, TaobaoAmountMaster, TaobaoAmountDetail, TaoBaoAdapterService, $mdDialog, $timeout, Constant) {
    $scope.taobaoOrderListMenu = {
        selectAll: false,
        effectiveType: '2', //失效作废
        taobao_status: Constant.TAOBAO_STATUS['WAIT_SELLER_SEND_GOODS'].value,
        seller_flag: Constant.SELLER_FLAG[0].value, //订单旗帜
        showQueryBar: true,
        confirm: Constant.CONFIRM[1].value, //审核
        dateType: 'created',//日期类型：成交或支付
        employeeID: '', //员工号o2oGuideId
        buyerNick: '', //客户名称
        orderFlag:Constant.ORDER_FLAG[0].value,//订单类型
        orderId: '' //销售单号

    };
    $scope.taobaoFormMenuDisplayOption = {
        '107-change': {display: true, name: '变更', uuid: ''},
        '108-changehistory': {display: true, name: '变更记录查询', uuid: ''}
    };

    $scope.taobaoOrderListMenuDisplayOption = {
        '400-selectAll': {display: true, name: '全选', uuid: '402B9BF7-665E-4929-B8D8-95775ADAF0E1'},
        '403-throw': {display: true, name: '审核', uuid: '977D4805-33DD-440A-9E57-5CE9623B6603'},
        '405-query': {display: true, name: '查询', uuid: 'FEB54F9A-D4B3-432B-ACAF-78DBE0D0A49A'},
        '407-merge': {display: true, name: '合并', uuid: 'BC6C29F5-0772-4041-8CAD-EA66C60C533D'},
        '408-unConfirm': {display: true, name: '取消审核', uuid: '91E1EB8B-6094-4B75-9937-6DCB9D0ED6D4'},
        '409-delivery': {display: true, name: '发货', uuid: '91E1EB8B-6094-4B75-9937-6DCB9D0ED6D4'},
        '410-sync': {display: true, name: '同步订单', uuid: '1ec0df3f-4c38-4eaf-81c1-e46e33708f7f'}
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    //清单页签选中
    $scope.listTabSelected = function () {
        $scope.taobaoOrderListMenu.showQueryBar = true;   //taobaoOrderListMenu.html
        $scope.taobaoOrderListMenuDisplayOption['400-selectAll'].display = true;  //全选
        $scope.queryMenuAction();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
        $scope.getMenuAuthData($scope.RES_UUID_MAP.EPS.ORDERS.LIST_PAGE.RES_UUID).success(function(data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    //重置已选 单据数 金额 按钮状态
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
        $scope.throw_button_disabled = 0;
    };

    //初始调用查询订单
    $scope.queryMenuAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 100;
        $scope.pageOption.totalElements = 100;
        $scope.queryMenuActionWithPaging();
    };
    //查询订单
    $scope.queryMenuActionWithPaging = function () {
        $scope.selectedItem = null;
        $scope.selected = [];
        $scope.selectedItemsCount = 0;
        $scope.selectedItemsTotalPrice = 0.00;
        $scope.taobaoOrderListMenu.selectAll = false;
        $scope.taobaoOrderListMenu.effectiveType = '2';
        $scope.resetInitialValue();

        //查询条件：起始时间 截止时间 销售单号 启用状态 审核状态
        if ($scope.taobaoOrderListMenu.startDate !== undefined && $scope.taobaoOrderListMenu.startDate !== null) {
            if ($scope.taobaoOrderListMenu.dateType == 'created') {
                createdBegin = new Date($scope.taobaoOrderListMenu.startDate);
                createdBegin = moment(createdBegin).format('YYYY-MM-DD');
                payTimeBegin = null;
            } else {
                payTimeBegin = new Date($scope.taobaoOrderListMenu.startDate);
                payTimeBegin = moment(payTimeBegin).format('YYYY-MM-DD');
                createdBegin = null;
            }
        } else {
            createdBegin = null;
            payTimeBegin = null;
        }

        if ($scope.taobaoOrderListMenu.endDate !== undefined && $scope.taobaoOrderListMenu.endDate !== null) {
            if ($scope.taobaoOrderListMenu.dateType == 'created') {
                createdEnd = new Date($scope.taobaoOrderListMenu.endDate);
                createdEnd = moment(createdEnd).format('YYYY-MM-DD');
                payTimeEnd = null;
            } else {
                payTimeEnd = new Date($scope.taobaoOrderListMenu.endDate);
                payTimeEnd = moment(payTimeEnd).format('YYYY-MM-DD');
                createdEnd = null;
            }
        } else {
            createdEnd = null;
            payTimeEnd = null;
        }

        if ($scope.taobaoOrderListMenu.buyerNick !== undefined && $scope.taobaoOrderListMenu.buyerNick !== '') {
            buyerNick = $scope.taobaoOrderListMenu.buyerNick;
        } else {
            buyerNick = null;
        }

        if ($scope.taobaoOrderListMenu.orderId !== undefined && $scope.taobaoOrderListMenu.orderId !== '') {
            tid = $scope.taobaoOrderListMenu.orderId;
        } else {
            tid = null;
        }

        if ($scope.taobaoOrderListMenu.employeeID !== undefined && $scope.taobaoOrderListMenu.employeeID !== '') {
            employeeID = $scope.taobaoOrderListMenu.employeeID;
        } else {
            employeeID = null;
        }

        taobaoStatus = $scope.taobaoOrderListMenu.taobao_status;
        sellerFlag = $scope.taobaoOrderListMenu.seller_flag;
        confirm = $scope.taobaoOrderListMenu.confirm;
        orderFlag=$scope.taobaoOrderListMenu.orderFlag;

        TaobaoOrders.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, employeeID, buyerNick, orderFlag, tid, taobaoStatus, sellerFlag, confirm, createdBegin, createdEnd, payTimeBegin, payTimeEnd, RES_UUID_MAP.EPS.ORDERS.LIST_PAGE.RES_UUID, $scope.taobaoOrderListMenu.buyerMessage, $scope.taobaoOrderListMenu.sellerMemo)
            .success(function (data) {
                $scope.OrderMasterList = data;
                $scope.pageOption.totalPage = data.totalPages;//页数
                $scope.pageOption.totalElements = data.totalElements;//总数
                //单头笔数为空，不再查单身和账务数据
                if ($scope.OrderMasterList.content.length > 0) {
                    angular.forEach($scope.OrderMasterList.content, function (orderMaster, index) {
                        TaobaoOrderDetail.get(orderMaster.uuid).success(function (data) {
                            //$scope.OrderMasterAndDetailList = $scope.OrderMasterAndDetailList.concat(data.content);
                            $scope.OrderMasterList.content[index].orderDetailList = data.content;
                            //console.info($scope.OrderMasterList);
                        });
                        TaobaoAmountMaster.get(orderMaster.uuid).success(function (data) {
                            //console.info(data.content);
                            //$scope.OrderMasterList.content[index].amountMaster=data.content;
                            //console.info($scope.OrderMasterList);
                            //console.info(data.content[0].uuid);
                            if (data.content.length > 0) {
                                TaobaoAmountDetail.get(data.content[0].uuid).success(function (data) {
                                    //console.info(data.content);
                                    if (data.content.length > 0) {
                                        $scope.OrderMasterList.content[index].amountDetailList = data.content;
                                    }
                                    //console.info($scope.OrderMasterList);
                                });
                            }
                        });
                    });

                }
            }
        );

    };

    $scope.selected = [];
    $scope.selectedItemsCount = 0;//已选中单据数
    $scope.selectedItemsTotalPrice = 0.00;//汇总金额

    //切换选中否，往数组中增加或删除
    $scope.toggle = function (item, selected) {
        var idx = selected.indexOf(item);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(item);
        }
        //console.info(selected);
        $scope.taobaoOrderListMenu.effectiveType = item.status;
        //console.info($scope.audit_button_disabled);
        $scope.resetInitialValue();//金额置0

        $scope.changeButtonStatusAndCalTotalPrice();
        $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
        $scope.selectedItemsCount = selected.length;//单据数
    };
    $scope.changeButtonStatusAndCalTotalPrice = function () {
        angular.forEach($scope.selected, function (orderMaster) {
            $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice + orderMaster.payment;
            $scope.changeButtonStatus(orderMaster);
        });
    };

    $scope.changeButtonStatus = function (orderMaster) {
        if (orderMaster.confirm == 2) {
            $scope.audit_button_disabled = 1;
        }
        if (!(orderMaster.confirm == 2)) {
            $scope.revert_audit_button_disabled = 1;
        }
    };

    //是否选中（是否存在数组中，返回1或0）
    $scope.exists = function (item, list) {
        //console.info("ng-checked");
        return list.indexOf(item) > -1;
    };

    //全选
    $scope.selectAllMenuAction = function () {
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { //清单全选
            //console.info($scope.taobaoOrderListMenu.selectAll);
            if ($scope.taobaoOrderListMenu.selectAll == true) {
                angular.forEach($scope.OrderMasterList.content, function (item) {
                    var idx = $scope.selected.indexOf(item);
                    if (idx < 0) {
                        $scope.selected.push(item);
                    }
                });
                $scope.resetInitialValue();
                $scope.changeButtonStatusAndCalTotalPrice();
                $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
                $scope.selectedItemsCount = $scope.selected.length;
            } else if ($scope.taobaoOrderListMenu.selectAll == false) {
                $scope.selected = [];
                $scope.taobaoOrderListMenu.effectiveType = '1';
                $scope.resetInitialValue();
            }
        }
    };
    //查看详情，跳转到表单
    $scope.editItem = function (orderMaster) {
        $scope.selectedDetail = [];
        $scope.taobaoOrderListMenu.selectAll = false;
        $scope.selectedItem = orderMaster;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        $scope.resetButtonDisabled();
    };


    $scope.effectiveMenuAction = function () {
    };

    $scope.auditMenuAction = function () {
    };

    $scope.revertAuditMenuAction = function () {
    };

    $scope.getOrderDtl = function () {
    };

    /**
     * Merge menu handler.
     */
    $scope.mergeMenuAuction = function() {
        if ($scope.selected.length > 0) {
            var uuids = [];
            angular.forEach($scope.selected, function(item) {
                uuids.push(item.uuid);
            });
            TaobaoOrders.merge(uuids).success(function (returnMsgs) {
                $scope.queryMenuActionWithPaging();

                angular.forEach(returnMsgs, function (msg) {
                    $scope.showError(msg);
                });

                $scope.showInfo('合并订单成功。');
            }).error(function() {
                //$scope.showError('合并订单失败。');
                alert("合并");
                $location.path('ecommerce-orders');
            })
        } else {
            $scope.showWarn('请先选择待合并的订单。');
        }
    };

    //抛转（审核）
    $scope.throwMenuAction = function () {
        if ($scope.selected.length == 1) {   //$scope.selected.length>0
            $scope.showConfirm('确认审核吗？', '', function () {
                //清单页
                if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var orderMasterUuids = "";
                    var rtn = false;
                    angular.forEach($scope.selected, function (item) {
                        if(item.status != 'WAIT_SELLER_SEND_GOODS') {
                            $scope.showError('只有买家已付款等待卖家发货的订单才可以审核');
                            rtn = true;
                            return;
                        }
                        orderMasterUuids = orderMasterUuids + item.uuid + ",";    //选中多个逗号分隔
                    });
                    if(rtn == true){
                        return;
                    }
                    orderMasterUuids = orderMasterUuids.substr(0, orderMasterUuids.length - 1);//去掉最后的逗号
                    console.info(orderMasterUuids);
                    var OrderMasterUpdateInput = {
                        uuid: orderMasterUuids,
                        confirm: '2'
                    };
                    var response = TaobaoOrders.modify(OrderMasterUpdateInput).success(function (returnMsgs) {
                        $scope.queryMenuActionWithPaging();//刷新查询
                        angular.forEach(returnMsgs, function (msg) {
                            $scope.showError(msg);
                        });
                        $scope.showInfo('审核成功，数据已刷新');
                    }).error(function (data) {
                        //$scope.showError(data.message);
                         alert("审核");
                         $location.path('ecommerce-orders');
                    });
                } else {
                    $scope.showError('请检查');
                }
            });
        } else {
            $scope.showError('请选单笔审核。');
        }

    };

    //cancel confirm
    $scope.unConfirmMenuAction = function() {
        if($scope.selected && $scope.selected.length > 0) {
            var uuids = [];
            var hasConfirmedTrade = false;
            angular.forEach($scope.selected, function(item) {
                uuids.push(item.uuid);

                //Make sure all items are not confirmed yet.
                if(item.confirm == '1') {
                    hasConfirmedTrade = true;
                }
            });

            if(hasConfirmedTrade) {
                $scope.showError("请选择所有已审核的交易。");
                return;
            }

            TaobaoOrders.cancelConfirm(uuids).success(function(data) {
                var allSuccess = true;
                angular.forEach(Object.keys(data), function(item) {
                    if(data[item] == false) {
                        allSuccess = false;
                    }
                });

                if(allSuccess) {
                    $scope.showInfo('取消审核成功，数据已刷新');
                } else {
                    if(Object.keys(data).length == 1) {
                        $scope.showError('取消审核失败.');
                    } else {
                        $scope.showWarn('部分取消审核成功，数据已刷新.');
                    }
                }
                $scope.queryMenuActionWithPaging();//刷新查询
            }).error(function() {
                $scope.showError("取消审核失败。");
            });
        } else {
            $scope.showWarn("请选择待取消审核的交易。")
        }
    };

    $scope.deliveryMenuAction = function(){


         if($scope.selected.length > 1){
            $scope.showWarn("发货操作只允许选择一个订单");
         }else if($scope.selected.length ==1){


            $mdDialog.show({
                locals: {tid : $scope.selected[0].tid },
                controller: 'TaobaoOrdersDeliveryController',
                templateUrl: 'app/src/app/taobao_data/order/taobaoOrderDelivery.html',
                parent: angular.element(document.body),
                targetEvent: event
            }).then(function(data) {
                $scope.deliveryInput = data;
                $scope.deliveryInput.uuid = $scope.selected[0].uuid;
                TaobaoOrders.delivery($scope.deliveryInput).success(function(response){
                    if(response.success){
                         $scope.showInfo("订单发货成功");
                    }else{
                        $scope.showError("订单发货失败" + response.message);
                    }

                }).error(function(response){
                    $scope.showError("订单发货失败: " + response.message);
                });
            });

         }else{
            $scope.showWarn("请选择一个订单");
         }

    };

    $scope.syncMenuAction = function () {
        $mdDialog.show({
            controller: 'EpsSyncController',
            templateUrl: 'app/src/app/taobao_data/order/syncDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (items) {
            items = items.replace(/[\r\n\s]/g, '');
            items = items.replace(/，/g, ',');
            if (items.substr(items.length - 1, 1) === ',') {
                items = items.substr(0, items.length - 1);
            }
            var itemsArray = items.split(',');
            for (var i = itemsArray.length - 1; i > 0; i--) {
                if (itemsArray[i] == undefined || itemsArray[i] == '' || itemsArray[i] == null) {
                    itemsArray.splice(i, 1);
                }
            }
            //var syncOrdersString = 'tids=' + itemsArray.join('&tids=');
            TaoBaoAdapterService.syncByTids(itemsArray, $scope, function (response) {
                $scope.showInfo("同步成功");
                $scope.queryMenuActionWithPaging();
            });
        });
    };

    $scope.$watch('taobaoOrderListMenu.isSellerMemoEmpty', function () {
        $scope.taobaoOrderListMenu.isSellerMemoEmpty ? $scope.taobaoOrderListMenu.sellerMemo = "" : $scope.taobaoOrderListMenu.sellerMemo = null;
    }, true);
});

angular.module('IOne-Production').controller('TaobaoOrdersDeliveryController', function($scope, $mdDialog, tid) {
     $scope.deliveryInput = {
        tid : tid,
    };

    $scope.hideDlg = function() {
        if($scope.deliveryInput.companyCode == null){
            toastr["error"]("物流公司编码为空");
        }else  if($scope.deliveryInput.outSid == null){
            toastr["error"]("物流单号为空");
        }else{
            $mdDialog.hide($scope.deliveryInput);
        }
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('EpsSyncController', function ($scope, $mdDialog) {

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.syncOrders);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.formatInput = function () {
        $scope.syncOrders = $scope.syncOrders.replace(/[\r\n\s]/g, '');
        $scope.syncOrders = $scope.syncOrders.replace(/，/g, ',');
        if ($scope.syncOrders.substr($scope.syncOrders.length - 1, 1) === ',') {
            $scope.syncOrders = $scope.syncOrders.substr(0, $scope.syncOrders.length - 1);
        }
        var syncOrdersArray = $scope.syncOrders.split(',');
    };

});


