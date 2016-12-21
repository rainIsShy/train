angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ecommerce-orders', {
        controller: 'EcommerceOrdersController',
        templateUrl: 'app/src/app/taobao_data/ecommerce_orders/ecommerceOrders.html'
    })
}]);

angular.module('IOne-Production').controller('EcommerceOrdersController', function ($scope, $q, $window, EcommerceOrdersMaster, EcommerceOrderDetail, EcommerceOrderDetailExtend, EdelivWayService, SaleTypes, $mdDialog, $timeout, Constant) {

    $scope.ecommerceOrderListMenu = {
        selectAll: false,
        effectiveType: '2', //失效作废
        confirm: Constant.CONFIRM[1].value, //审核状态
        status: Constant.STATUS[0].value, //启用状态
        transferPsoFlag: Constant.TRANSFER_PSO_FLAG[2].value,
        showQueryBar: true,
        buyerNick: '',
        orderFlag: Constant.ORDER_FLAG[0].value //订单类型
    };

    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: '283A96EC-616E-4CD6-B666-97D9EBE689D0'},
        '101-delete': {display: true, name: '删除', uuid: 'AB3E5248-4FD5-4A3B-94AA-5AFF61BCF68E'},
        '102-edit': {display: true, name: '变更', uuid: 'DE283761-5374-4B31-935D-FAFB6AF29881'},
        '200-cancel': {display: true, name: '取消新增', uuid: '7C7F408E-8A35-4A09-9829-AAEB6BF0FD70'},
        '201-save': {display: true, name: '保存', uuid: '0F1BE865-1271-432D-B481-6879DE58979A'},
        '302-save': {display: true, name: '保存', uuid: '10F9A22C-F792-4AA3-975E-88173A33D083'},
        '303-cancel': {display: true, name: '取消修改', uuid: '1C4E0C9F-BD78-4454-88A9-BD9CDD517B5A'},
        '304-quit': {display: true, name: '退出编辑', uuid: '9FAFE39F-A71B-45DD-A773-BE422FBDCEA3'}
    };

    $scope.ecommerceOrderListMenuDisplayOption = {
        '400-selectAll': {display: true, name: '全选', uuid: 'AC0B75FE-46BB-4BCB-B5AE-1B6DC564E165'},
        '401-audit': {display: true, name: '审核', uuid: '7C160BC4-CBC5-47CE-8F4E-412295E61E9A'},
        '403-throw': {display: true, name: '抛转预订单', uuid: 'D334B659-2C65-4601-8C06-9EA7924C1830'},
        '408-cancelthrow': {display: true, name: '取消抛转预订单', uuid: '098F60EE-A590-11E5-BF7F-FEFF819CDC9F'},
        '405-query': {display: true, name: '查询', uuid: 'D08679EA-E52D-4667-A080-7E6A74523D7F'},
        '406-revertAudit': {display: true, name: '取消审核', uuid: 'CE277D5B-EF09-4648-8706-E4A44766E745'},
        '407-add': {display: true, name: '新增', uuid: '6A8F9438-C2FF-4BF3-8797-7B680AAA068E'},
        '408-supervisorAudit': {display: true, name: '主管审核', uuid: 'C515BAEB-758F-4265-AD6A-50FBDD614DD3'},
        '409-o2oOverdue': {display: true, name: '逾期拒绝配送', uuid: 'ADAA19C6-424B-4BE7-B2E2-F8D5B9ECCFC9'},
        '410-rollbackTransfer': {display: true, name: '抛转还原', uuid: '324a85e8-6f5b-46bf-a42d-3e8926276a0d'}
    };

    $scope.ecommerceFormMenuDisplayOption = {
        '411-audit': {display: true, name: '审核', uuid: 'F34FF037-23D6-4033-8516-67FF51C270FC'},
        '413-throw': {display: true, name: '抛转预订单', uuid: '82D08295-F14B-446F-A265-1B3E453F17FD'},
        '416-revertAudit': {display: true, name: '取消审核', uuid: '543C075A-3E18-491F-9726-F063D589D084'},
        '417-cancelthrow': {display: true, name: '取消抛转预订单', uuid: 'AE4CF2E4-4CCE-40DA-B060-0D00FCDA76C8'},
        '418-print': {display: true, name: '打印', uuid: '753C7E95-FC29-40DA-8296-DA858325FCF0'},
        '419-supervisorAudit': {display: true, name: '主管审核', uuid: 'F97D8B53-AF71-448F-AB73-63BAFB83F77F'},
        '420-rollbackTransfer': {display: true, name: '抛转还原', uuid: 'fb882032-4d7f-4998-854e-6217a5089a25'}
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.printAction = function () {
        EcommerceOrdersMaster.print('e_sale_order_reports', $scope.selectedItem.uuid).success(function (data) {
            var file = new Blob([data], {type: 'application/pdf'});
            var fileURL = URL.createObjectURL(file);
            $window.open(fileURL);
        }).error(function () {
            $scope.showError('获取打印信息失败。');
        })
    };

    //清单页签选中
    $scope.listTabSelected = function () {
        $scope.ecommerceOrderListMenu.showQueryBar = true;
        $scope.queryMenuAction();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
        $scope.getMenuAuthData($scope.RES_UUID_MAP.EPS.ECOMMERCE.LIST_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });

    };
    //表单页签选中
    $scope.formTabSelected = function () {
        $scope.ecommerceOrderListMenu.showQueryBar = false;
        $scope.getMenuAuthData($scope.RES_UUID_MAP.EPS.ECOMMERCE.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    //重置单据数 金额 按钮状态
    $scope.resetInitialValue = function () {
        $scope.selectedItem = null;
        $scope.selectedItemsCount = 0;
        $scope.selectedItemsTotalPrice = 0.00;
        $scope.resetButtonDisabled();
    };
    $scope.resetButtonDisabled = function () {
        $scope.throw_button_disabled = 0;
        $scope.revert_throw_button_disabled = 0;
        $scope.audit_button_disabled = 0;
        $scope.revert_audit_button_disabled = 0;
        $scope.supervisorAudit_button_disabled = 0;
        $scope.o2o_overdue_button_disabled = 0;
        $scope.rollback_transfer_button_disabled = 0;
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
        $scope.ecommerceOrderListMenu.selectAll = false;
        $scope.resetInitialValue();//审核 抛转重刷后 清除选中单据

        //查询条件：起始时间 截止时间 销售单号 启用状态 审核状态
        if ($scope.ecommerceOrderListMenu.startDate !== undefined) {
            if ($scope.ecommerceOrderListMenu.startDate !== null) {
                orderDateBegin = new Date($scope.ecommerceOrderListMenu.startDate);
                orderDateBegin = moment(orderDateBegin).format('YYYY-MM-DD');
            } else {
                orderDateBegin = null;
            }
        } else {
            orderDateBegin = null;
        }

        if ($scope.ecommerceOrderListMenu.endDate !== undefined) {
            if ($scope.ecommerceOrderListMenu.endDate !== null) {
                orderDateEnd = new Date($scope.ecommerceOrderListMenu.endDate);
                orderDateEnd = moment(orderDateEnd).format('YYYY-MM-DD');
            } else {
                orderDateEnd = null;
            }
        } else {
            orderDateEnd = null;
        }

        if ($scope.ecommerceOrderListMenu.orderId !== undefined && $scope.ecommerceOrderListMenu.orderId !== '') {
            orderMasterNo = $scope.ecommerceOrderListMenu.orderId;
        } else {
            orderMasterNo = null;
        }

        if ($scope.ecommerceOrderListMenu.buyerNick !== undefined && $scope.ecommerceOrderListMenu.buyerNick !== '') {
            buyerNick = $scope.ecommerceOrderListMenu.buyerNick;
        } else {
            buyerNick = null;
        }

        if ($scope.ecommerceOrderListMenu.o2oChannelName !== undefined && $scope.ecommerceOrderListMenu.o2oChannelName !== '') {
            o2oChannelName = $scope.ecommerceOrderListMenu.o2oChannelName;
        } else {
            o2oChannelName = null;
        }

        confirm = $scope.ecommerceOrderListMenu.confirm;
        status = $scope.ecommerceOrderListMenu.status;
        transferPsoFlag = $scope.ecommerceOrderListMenu.transferPsoFlag;
        orderFlag = $scope.ecommerceOrderListMenu.orderFlag;

        EcommerceOrdersMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, orderFlag, confirm, status, transferPsoFlag, buyerNick, orderMasterNo, orderDateBegin, orderDateEnd, o2oChannelName, RES_UUID_MAP.EPS.ECOMMERCE.LIST_PAGE.RES_UUID)
            .success(function (data) {
                    $scope.OrderMasterList = data;
                    $scope.updateOrderMasterDate($scope.OrderMasterList);//YYYY-MM-DD
                    $scope.pageOption.totalPage = data.totalPages;//页数
                    $scope.pageOption.totalElements = data.totalElements;//总数
                    //清单显示产品单身
                    if ($scope.OrderMasterList.content.length > 0) {
                        angular.forEach($scope.OrderMasterList.content, function (orderMaster, index) {
                            EcommerceOrderDetail.getAll(orderMaster.uuid).success(function (data) {
                                $scope.OrderMasterList.content[index].detailList = data.content;
                                //console.info($scope.OrderMasterList);
                            });
                        });
                    }

                }
            );

    };

    $scope.selected = [];
    $scope.selectedDetail = [];
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
        $scope.resetInitialValue();//金额置0
        $scope.changeButtonStatusAndCalTotalPrice();
        $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
        $scope.selectedItemsCount = selected.length;//单据数
    };

    $scope.toggleDetail = function (item, selectedDetail) {
        var idx = selectedDetail.indexOf(item);
        if (idx > -1) {
            selectedDetail.splice(idx, 1);
        }
        else {
            selectedDetail.push(item);
        }
        $scope.resetButtonDisabled();
    };

    $scope.changeButtonStatus = function (orderMaster) {
        //confirm:1=未审核/2=已审核  transferPsoFlag:"1=是/2=否",
        //是已审核的不允许审核
        if (orderMaster.confirm == 2) {
            $scope.audit_button_disabled = 1;
            $scope.supervisorAudit_button_disabled = 1;
        } else if (orderMaster.confirm == 1) {
            if (orderMaster.orderChangeFlag == 1 || orderMaster.orderChangeFlag == null) {
                $scope.supervisorAudit_button_disabled = 1;
            } else if (orderMaster.orderChangeFlag == 2) {
                $scope.audit_button_disabled = 1;
            }
        }
        //已审核并且尚未抛转的单据可取消审核
        if (!(orderMaster.confirm == 2 && orderMaster.transferPsoFlag != 1 )) {
            $scope.revert_audit_button_disabled = 1;
        }
        //已审核且尚未抛转的单子可以抛转
        if (!(orderMaster.confirm == 2 && orderMaster.transferPsoFlag != 1 )) {
            $scope.throw_button_disabled = 1;
        }
        //已审核抛转的可以取消抛转
        if (!(orderMaster.confirm == 2 && orderMaster.transferPsoFlag == 1 )) {
            $scope.revert_throw_button_disabled = 1;
        }
        //已审核并且尚未抛转的单据可逾期拒绝配送
        if (!(orderMaster.confirm == 2 && orderMaster.transferPsoFlag != 1 )) {
            $scope.o2o_overdue_button_disabled = 1;
        }

        if (!(orderMaster.confirm == 2 && orderMaster.transferPsoFlag == 1 )) {
            $scope.rollback_transfer_button_disabled = 1;
        }
    };

    $scope.changeButtonStatusAndCalTotalPrice = function () {
        angular.forEach($scope.selected, function (orderMaster) {
            $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice + orderMaster.orderAmount;
            $scope.changeButtonStatus(orderMaster);
        });
    };

    //是否选中（是否存在数组中，返回1或0）
    $scope.exists = function (item, list) {
        //console.info("ng-checked");
        return list.indexOf(item) > -1;
    };

    //全选
    $scope.selectAllMenuAction = function () {
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { //清单全选
            if ($scope.ecommerceOrderListMenu.selectAll == true) {
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
            } else if ($scope.ecommerceOrderListMenu.selectAll == false) {
                $scope.selected = [];
                $scope.resetInitialValue();
            }
        } else if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            if ($scope.ecommerceOrderListMenu.selectAll == true) {
                angular.forEach($scope.OrderDetailList.content, function (item) {
                    var idx = $scope.selectedDetail.indexOf(item);
                    if (idx < 0) {
                        $scope.selectedDetail.push(item);
                    }
                });
                $scope.resetButtonDisabled();
            } else if ($scope.ecommerceOrderListMenu.selectAll == false) {
                $scope.selectedDetail = [];
                $scope.resetButtonDisabled();
            }
        }


    };

    //查看详情，跳转到表单 选中的是selectedItem
    $scope.editItem = function (orderMaster) {
        $scope.selectedDetail = [];
        $scope.ecommerceOrderListMenu.selectAll = false;
        $scope.selectedItem = orderMaster;

        if ($scope.selectedItem.orderDate) {
            $scope.selectedItem.orderDate = new Date($scope.selectedItem.orderDate);
        }

        if ($scope.selectedItem.predictDeliverDate) {
            $scope.selectedItem.predictDeliverDate = new Date($scope.selectedItem.predictDeliverDate);
        }

        if (orderMaster.o2oChannel != null) {
            $scope.selectedItem.o2oChannelUuid = orderMaster.o2oChannel.uuid;
        }

        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        $scope.resetButtonDisabled();
        $scope.changeButtonStatus(orderMaster);
        EcommerceOrderDetail.getAll(orderMaster.uuid).success(function (data) {
            $scope.OrderDetailList = data;
            $scope.updateOrderDetailDeliverDate($scope.OrderDetailList);//YYYY-MM-DD
            $scope.OrderExtendDetailList = [];
            angular.forEach($scope.OrderDetailList.content, function (orderDetail) {
                EcommerceOrderDetailExtend.getAll(orderMaster.uuid, orderDetail.uuid).success(function (data) {
                    $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                });
            });
        });
    };


    $scope.GetQueryString = function (name){
        var url = window.location.href;
        var index = url.indexOf("?");
        if(index>0){
            uuid = url.substring(index+name.length+2,url.length);
            return uuid;
        }else{
            return null;
        }
    }

    $scope.getUrl = function(){
        var orderMasterNo = $scope.GetQueryString('uuid');
        $scope.initMenu();
        if(orderMasterNo != null){
            EcommerceOrdersMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, null, '', status, 0, null, orderMasterNo, null, null, null, null).success(function(data){
                $scope.editItem(data.content[0]);
            }).error(function(){
                //TODO 未找到该笔单据
            });
        }
    }
    $scope.getUrl();

    //日期格式
    //orderDate和predictDeliverDate：
    $scope.updateOrderMasterDate = function (OrderMasterList) {
        angular.forEach(OrderMasterList.content, function (orderMaster) {
            if (orderMaster.orderDate) {
                //input type="text"时moment可以 但是"date"不行,需要Date类型
                //orderMaster.orderDate = moment(orderMaster.orderDate).format('YYYY-MM-DD');
                orderMaster.orderDate = new Date(orderMaster.orderDate);
            }
            if (orderMaster.predictDeliverDate) {
                //orderMaster.predictDeliverDate = moment(orderMaster.predictDeliverDate).format('YYYY-MM-DD');
                orderMaster.predictDeliverDate = new Date(orderMaster.predictDeliverDate);
            }
            /*            else {
             //为空的话在orderDate上加两天
             //orderMaster.predictDeliverDate =  moment(orderMaster.orderDate).add(2,'days').format('YYYY-MM-DD');
             //orderMaster.predictDeliverDate = new Date(orderMaster.orderDate.valueOf() + 2*24*60*60*1000);
             }*/
        });
    };

    $scope.updateOrderDetailDeliverDate = function (OrderDetailList) {
        angular.forEach(OrderDetailList.content, function (orderDetail) {
            if (orderDetail.deliverDate) {
                orderDetail.deliverDate = moment(orderDetail.deliverDate).format('YYYY-MM-DD');
            }
        });
    };

    $scope.getImageFullPath = function (path) {
        if (path == null) {
            return Constant.BACKEND_BASE + '/app/img/item.jpeg';
        }
        if (path && path.indexOf('IMAGE') == 0) {
            return Constant.BACKEND_BASE + '/app/assets/' + path;
        } else {
            return Constant.BACKEND_BASE + '/app/assets/IMAGE/' + path;
        }
    };

    //新增 100-add 初始化所有栏位
    $scope.preAddMenuAction = function () {
        //选中的清空
        $scope.selectedItem = EcommerceOrdersMaster.createDefault();
        EdelivWayService.getAll(1, 0, null, 'DW02').success(function (data) {
            $scope.selectedItem.deliverWay = data.content[0];
            $scope.selectedItem.deliverWayUuid = $scope.selectedItem.deliverWay.uuid;
        });
        //新定义 清空选中的子项 先放着
        $scope.selectedItemDetail = null;
        $scope.OrderDetailList = null;
        $scope.OrderExtendDetailList = null;
        //显示 保存和取消新增 的菜单
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);
    };

    //删除 101-delete
    $scope.deleteMenuAction = function () {
        if ($scope.selectedItem.confirm == 1) {
            $scope.showConfirm('确认删除吗？', '删除的订单不可恢复。', function () {
                if ($scope.selectedItem) {
                    EcommerceOrdersMaster.delete($scope.selectedItem.uuid).success(function () {
                        $scope.showInfo('删除成功。');
                        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
                    }).error(function (response) {
                        $scope.showError($scope.getError(response));
                    });
                }
            });
        } else {
            $scope.showInfo('已审核订单不可删除。');
        }
    };

    //变更 102-edit $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);

    //取消新增 200-cancel 回到清单
    $scope.cancelAddMenuAction = function () {
        $scope.listTabSelected();
    };

    //保存新增 201-save
    $scope.addMenuAction = function () {
        if ($scope.selectedItem && (angular.isUndefined($scope.selectedItem.uuid) || $scope.selectedItem.uuid == null)) {
            //手动录入默认单身已变更
            $scope.selectedItem.orderChangeFlag='2';
            //console.info("准备新增：");
            //console.info($scope.selectedItem);

            if ($scope.selectedItem.orderDate) {
                $scope.selectedItem.orderDate = new Date($scope.selectedItem.orderDate);
                // var dateTime = new Date($scope.selectedItem.orderDate);
                // $scope.selectedItem.orderDate  = moment($scope.selectedItem.orderDate).format("YYYY-MM-DD hh:mm:ss");
            }

            EcommerceOrdersMaster.add($scope.selectedItem).success(function (data) {
                $scope.selectedItem = data;
                //console.info("新增后返回：");
                //console.info($scope.selectedItem);
                //更新返回时间格式：
                if ($scope.selectedItem.orderDate) {
                    $scope.selectedItem.orderDate = new Date($scope.selectedItem.orderDate);
                }
                if ($scope.selectedItem.predictDeliverDate) {
                    $scope.selectedItem.predictDeliverDate = new Date($scope.selectedItem.predictDeliverDate);
                }
                $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
                $scope.resetButtonDisabled();
                $scope.changeButtonStatus($scope.selectedItem);
                $scope.showInfo('新增成功');
            }).error(function (data) {
                $scope.showError($scope.getAllError(data));
                $scope.showError(data.message);
            });
        }
    };

    //保存修改 302-save
    $scope.modifyMenuAction = function () {
        //修改单头
        if ($scope.selectedItem) {
            if ($scope.selectedItem.transferPsoFlag == '1') {
                $scope.showError('已抛转的销售单不能修改。');
                return;
            }
            if ($scope.selectedItem.confirm == '2' || $scope.selectedItem.confirm == '3') {
                $scope.showError('已审核和正在审核中的销售单不能修改。');
                return;
            }

            if ($scope.selectedItem.o2oChannel != null) {
                $scope.selectedItem.o2oChannelUuid = $scope.selectedItem.o2oChannel.uuid;
            }


            EcommerceOrdersMaster.modify($scope.selectedItem).success(function (data) {
                $scope.selectedItem = data[0];
                $scope.editItem($scope.selectedItem);
                console.log($scope.selectedItem);
                //重取单身
                EcommerceOrderDetail.getAll($scope.selectedItem.uuid).success(function (data) {
                    $scope.selectedItem.detailList = data.content;
                });

                /*EcommerceOrderDetail.getAll($scope.selectedItem.uuid).success(function (data) {
                 $scope.OrderDetailList = data;
                 $scope.updateOrderDetailDeliverDate($scope.OrderDetailList);//YYYY-MM-DD
                 $scope.OrderExtendDetailList = [];
                 angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                 EcommerceOrderDetailExtend.getAll($scope.selectedItem.uuid, orderDetail.uuid).success(function (data) {
                 $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                 });
                 });
                 });*/
                $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
                $scope.showInfo('修改成功。');
            }).error(function (data) {
                $scope.showError(data.message);
                $scope.cancelModifyMenuAction();
            });
        }
    };

    //取消修改 303-cancel  重抓单头
    $scope.cancelModifyMenuAction = function () {
        EcommerceOrdersMaster.get($scope.selectedItem.uuid).success(function (data) {
            $scope.selectedItem = data;
            if ($scope.selectedItem.orderDate) {
                $scope.selectedItem.orderDate = new Date($scope.selectedItem.orderDate);
            }
            if ($scope.selectedItem.predictDeliverDate) {
                $scope.selectedItem.predictDeliverDate = new Date($scope.selectedItem.predictDeliverDate);
            }

            //重取单身
            EcommerceOrderDetail.getAll($scope.selectedItem.uuid).success(function (data) {
                $scope.selectedItem.detailList = data.content;
            });

            /*            else {
             $scope.selectedItem.predictDeliverDate = new Date($scope.selectedItem.orderDate.valueOf() + 2*24*60*60*1000);
             }*/
            //$scope.selectedTemplateNode = null;
        })
    };

    //退出编辑 304-quit
    $scope.exitModifyMenuAction = function () {
        $scope.cancelModifyMenuAction();
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };


    $scope.effectiveMenuAction = function () {
    };

    //审核
    $scope.auditMenuAction = function () {
        if ((!$scope.selected || $scope.selected.length == 0) && $scope.selectedTabIndex == 0) { // list
            $scope.showError('请选择待审核销售单。');
            return;
        }

        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { // list
            var emptyDetails = '';
            angular.forEach($scope.selected, function (item) {

                if (angular.isUndefined(item.detailList) || item.detailList.length == 0) {
                    emptyDetails = emptyDetails + item.no + ","
                }
            });
            if (emptyDetails != '') {
                emptyDetails = emptyDetails.substr(0, emptyDetails.length - 1);
                $scope.showError('存在无单身明细的销售单，不允许审核：' + emptyDetails);
                return;
            }
        }

        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { // list
            var zeroNos = '';
            angular.forEach($scope.selected, function (item) {
                if (item.orderAmount == '0') {
                    zeroNos = zeroNos + item.no + ","
                }
            });

            //在 ISSUE #239 取消檢核
            // if (zeroNos != '') {
            //     zeroNos = zeroNos.substr(0, zeroNos.length - 1);
            //     $scope.showError('存在金额为0的销售单，不允许审核：' + zeroNos);
            //     return;
            // }
        }
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { // list
            var groupUserNos = '';
            //add by xavier on 20160606
            var buyerNick = '';            //客户昵称为
            var deliverWayName = '';       //送货方式
            var receiveDistrictName = '';  //送货区域
            var receiveAddress = '';       //送货地址
            var receiveName = '';          //收货人
            var receivePhone = '';         //联系电话
            var orderNo = '';              //交易订单号
            var predictDeliverDate = '';   //预计送货日期

            angular.forEach($scope.selected, function (head) {
                if (angular.isUndefined(head.groupUser) || head.groupUser == null) {
                    groupUserNos = groupUserNos + head.no + "\n\r";
                }

                //add by xavier on 20160606
                if (angular.isUndefined(head.buyerNick) || head.buyerNick == null) {
                    buyerNick = buyerNick + head.no + "\n\r";
                }
                if (angular.isUndefined(head.deliverWay) || head.deliverWay == null) {
                    deliverWayName = deliverWayName + head.no + "\n\r";
                }
                if (angular.isUndefined(head.receiveDistrict) || head.receiveDistrict == null) {
                    receiveDistrictName = receiveDistrictName + head.no + "\n\r";
                }
                if (angular.isUndefined(head.receiveAddress) || head.receiveAddress == null) {
                    receiveAddress = receiveAddress + head.no + "\n\r";
                }
                if (angular.isUndefined(head.receiveName) || head.receiveName == null) {
                    receiveName = receiveName + head.no + "\n\r";
                }
                if (angular.isUndefined(head.receivePhone) || head.receivePhone == null) {
                    receivePhone = receivePhone + head.no + "\n\r";
                }
                if (angular.isUndefined(head.no) || head.no == null) {
                    orderNo = orderNo + head.no + "\n\r";
                }
                if (angular.isUndefined(head.predictDeliverDate) || head.predictDeliverDate == null) {
                    predictDeliverDate = predictDeliverDate + head.no + "\n\r";
                }
            });
            if (groupUserNos != '') {
                groupUserNos = groupUserNos.substr(0, groupUserNos.length - 1);
                $scope.showError('存在客服人员为空的销售单，不允许审核：' + groupUserNos);
                return;
            }
            if (buyerNick != '') {
                buyerNick = buyerNick.substr(0, buyerNick.length - 1);
                $scope.showError('存在客户昵称为为空的销售单，不允许审核：' + buyerNick);
                return;
            }
            if (deliverWayName != '') {
                deliverWayName = deliverWayName.substr(0, deliverWayName.length - 1);
                $scope.showError('存在送货方式为空的销售单，不允许审核：' + deliverWayName);
                return;
            }
            if (receiveDistrictName != '') {
                receiveDistrictName = receiveDistrictName.substr(0, receiveDistrictName.length - 1);
                $scope.showError('存在送货区域为空的销售单，不允许审核：' + receiveDistrictName);
                return;
            }
            if (receiveAddress != '') {
                receiveAddress = receiveAddress.substr(0, groupUserNos.length - 1);
                $scope.showError('存在送货地址为空的销售单，不允许审核：' + receiveAddress);
                return;
            }
            if (receiveName != '') {
                receiveName = receiveName.substr(0, receiveName.length - 1);
                $scope.showError('存在收货人为空的销售单，不允许审核：' + receiveName);
                return;
            }
            if (receivePhone != '') {
                receivePhone = receivePhone.substr(0, receivePhone.length - 1);
                $scope.showError('存在联系电话为空的销售单，不允许审核：' + receivePhone);
                return;
            }
            if (orderNo != '') {
                orderNo = orderNo.substr(0, orderNo.length - 1);
                $scope.showError('存在交易订单号为空的销售单，不允许审核：' + orderNo);
                return;
            }
            if (predictDeliverDate != '') {
                predictDeliverDate = predictDeliverDate.substr(0, predictDeliverDate.length - 1);
                $scope.showError('存在预计送货日期为空的销售单，不允许审核：' + predictDeliverDate);
                return;
            }

            if (needSelectO2oChannel != '') {
                needSelectO2oChannel = needSelectO2oChannel.substr(0, needSelectO2oChannel.length - 1);
                $scope.showError('存在需选择O2O门店/经销商的销售单!');
                return;
            }

            if (unNeedSelectO2oChannel != '') {
                unNeedSelectO2oChannel = unNeedSelectO2oChannel.substr(0, unNeedSelectO2oChannel.length - 1);
                $scope.showError('存在当销售类型为网销订单时不需选择O2O门店/经销商的销售单!');
                return;
            }
        }

        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) { // form
            if (angular.isUndefined($scope.selectedItem.detailList) || $scope.selectedItem.detailList == null || $scope.selectedItem.detailList.length == '0') {
               $scope.showError('该单无单身明细不能审核。');
               return;
            }
            if ($scope.selectedItem.confirm == '2') {
                $scope.showError('该单已经审核完成。');
                return;
            }
            if ($scope.selectedItem.orderAmount == '0' && $scope.selectedItem.orderFlag != Constant.ORDER_FLAG[6].value) {
                $scope.showError('该单单头金额为0不能审核。');
                return;
            }
            if (angular.isUndefined($scope.selectedItem.groupUser) || $scope.selectedItem.groupUser == null) {
                $scope.showError('该单客服人员为空不允许审核。');
                return;
            }
        }
        $scope.showConfirm('确认审核吗？', '', function () {
            var orderMasterUpdateInput = {
                uuid: '',
                modifyOnly: '1',
                confirm: '2'
            };
            if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) { // form
                orderMasterUpdateInput.uuid = $scope.selectedItem.uuid;

                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function (data) {
                    $scope.selectedItem.confirm = '2';
                    $scope.selectedItem.userId = data[0].userId;
                    $scope.selectedItem.buyerNick = data[0].buyerNick;
                    $scope.selectedItem.receiveName = data[0].receiveName;
                    $scope.selectedItem.receivePhone = data[0].receivePhone;
                    $scope.resetButtonDisabled();
                    $scope.changeButtonStatus($scope.selectedItem);
                    $scope.showInfo('审核成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { // list
                //update $scope.selected
                angular.forEach($scope.selected, function (item) {
                    orderMasterUpdateInput.uuid += (orderMasterUpdateInput.uuid ? ',' : '') + item.uuid;
                });
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.queryMenuActionWithPaging();
                    $scope.showInfo('审核成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            }
        });
    };

    //未审核
    $scope.revertAuditMenuAction = function () {
        if ((!$scope.selected || $scope.selected.length == 0) && $scope.selectedTabIndex == 0) {
            $scope.showError('请选择待取消审核销售单。');
            return;
        }
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
            var threwNos = '';
            angular.forEach($scope.selected, function (item) {
                if (item.transferPsoFlag == '1') {
                    threwNos = threwNos + item.no + ","
                }
            });
            if (threwNos != '') {
                threwNos = threwNos.substr(0, threwNos.length - 1);
                $scope.showError('存在已抛转的销售单，不允许取消审核：' + threwNos);
                return;
            }
        }

        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            if ($scope.selectedItem.confirm == '1') {
                $scope.showError('该单已是未审核。');
                return;
            }
            if ($scope.selectedItem.transferPsoFlag == '1') {
                $scope.showError('已抛转的销售单不允许取消审核。');
                return;
            }
        }

        $scope.showConfirm('确认取消审核吗？', '', function () {
            var orderMasterUpdateInput = {
                uuid: '',
                modifyOnly: '1',
                confirm: '1'
            };
            if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) { // form
                orderMasterUpdateInput.uuid = $scope.selectedItem.uuid;
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.selectedItem.confirm = '1';
                    $scope.resetButtonDisabled();
                    $scope.changeButtonStatus($scope.selectedItem);
                    $scope.showInfo('取消审核成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { // list
                //update $scope.selected
                angular.forEach($scope.selected, function (item) {
                    orderMasterUpdateInput.uuid += (orderMasterUpdateInput.uuid ? ',' : '') + item.uuid;
                });
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.queryMenuActionWithPaging();
                    $scope.showInfo('取消审核成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            }
        });
    };

    //抛转
    $scope.throwMenuAction = function () {
        if ((!$scope.selected || $scope.selected.length == 0) && $scope.selectedTabIndex == 0) {
            $scope.showError('请选择待抛转销售单。');
            return;
        }
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
            var unConfirmNos = '';
            angular.forEach($scope.selected, function (item) {
                if (item.confirm == '1') {
                    unConfirmNos = unConfirmNos + item.no + ","
                }
            });
            if (unConfirmNos != '') {
                unConfirmNos = unConfirmNos.substr(0, unConfirmNos.length - 1);
                $scope.showError('存在未审核的销售单，不允许抛转：' + unConfirmNos);
                return;
            }
        }
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
            var zcNos = '';
            angular.forEach($scope.selected, function (item) {
                if (item.orderFlag == '1' || item.orderFlag == '2' || item.orderFlag == '' || item.orderFlag == '0' || item.orderFlag == null) {  //1:网销种菜 2:o2o种菜
                    zcNos = zcNos + item.no + ","
                }
            });
            if (zcNos != '') {
                zcNos = zcNos.substr(0, zcNos.length - 1);
                $scope.showError('存在种菜或未定义类型的销售单，不允许抛转：' + zcNos);
                return;
            }
        }
        //表单判断
        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            if ($scope.selectedItem.confirm == '1') {
                $scope.showError('该单尚未审核，审核后才允许抛转。');
                return;
            }
            if ($scope.selectedItem.orderFlag == '1' || $scope.selectedItem.orderFlag == '2' || $scope.selectedItem.orderFlag == '' || $scope.selectedItem.orderFlag == '0' || $scope.selectedItem.orderFlag == null) {
                $scope.showError('该单是种菜或未定义类型的销售单，不允许抛转。');
                return;
            }
            if ($scope.selectedItem.transferPsoFlag == '1') {
                $scope.showError('该单已经抛转完成。');
                return;
            }
        }
        $scope.showConfirm('确认抛转吗？', '', function () {
            var orderMasterUpdateInput = {
                modifyOnly: '1',
                uuid: '',
                transferPsoFlag: '1'
            };
            if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { // list
                angular.forEach($scope.selected, function (item) {
                    orderMasterUpdateInput.uuid += (orderMasterUpdateInput.uuid ? ',' : '') + item.uuid;
                });
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.queryMenuActionWithPaging();//刷新查询
                    $scope.showInfo('抛转成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            } else if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) { // form
                orderMasterUpdateInput.uuid = $scope.selectedItem.uuid;
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.selectedItem.transferPsoFlag = '1';
                    $scope.resetButtonDisabled();
                    $scope.changeButtonStatus($scope.selectedItem);
                    $scope.showInfo('抛转成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            }
        });
    };

    //取消抛转
    $scope.cancelThrowMenuAction = function () {
        if ((!$scope.selected || $scope.selected.length == 0) && $scope.selectedTabIndex == 0) {
            $scope.showError('请选择待抛转销售单。');
            return;
        }
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
            var unConfirmNos = '';
            angular.forEach($scope.selected, function (item) {
                if (item.transferPsoFlag == '2') {
                    unConfirmNos = unConfirmNos + item.no + ","
                }
            });
            if (unConfirmNos != '') {
                unConfirmNos = unConfirmNos.substr(0, unConfirmNos.length - 1);
                $scope.showError('存在未抛转的销售单，不允许取消抛转：' + unConfirmNos);
                return;
            }
        }
//        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
//            var zcNos='';
//            angular.forEach($scope.selected, function (item) {
//                if(item.orderFlag == '1'||item.orderFlag == '2'||item.orderFlag==''||item.orderFlag=='0'||item.orderFlag==null){  //1:网销种菜 2:o2o种菜
//                    zcNos = zcNos + item.no + ","
//                }
//            });
//            if(zcNos!=''){
//                zcNos = zcNos.substr(0, zcNos.length - 1);
//                $scope.showError('存在种菜或未定义类型的销售单，不允许抛转：'+zcNos);
//                return;
//            }
//        }
        //表单判断
//        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
//            if ($scope.selectedItem.confirm == '1') {
//                $scope.showError('该单尚未审核，审核后才允许抛转。');
//                return;
//            }
//            if ($scope.selectedItem.orderFlag == '1'||$scope.selectedItem.orderFlag == '2'||$scope.selectedItem.orderFlag == ''||$scope.selectedItem.orderFlag == '0'||$scope.selectedItem.orderFlag == null) {
//                $scope.showError('该单是种菜或未定义类型的销售单，不允许抛转。');
//                return;
//            }
//            if ($scope.selectedItem.transferPsoFlag == '1') {
//                $scope.showError('该单已经抛转完成。');
//                return;
//            }
//        }
        $scope.showConfirm('确认取消抛转吗？', '', function () {
            var orderMasterUpdateInput = {
                modifyOnly: '1',
                uuid: '',
                transferPsoFlag: '2'
            };
            if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { // list
                angular.forEach($scope.selected, function (item) {
                    orderMasterUpdateInput.uuid += (orderMasterUpdateInput.uuid ? ',' : '') + item.uuid;
                });
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.queryMenuActionWithPaging();//刷新查询
                    $scope.showInfo('取消抛转成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            } else if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) { // form
                orderMasterUpdateInput.uuid = $scope.selectedItem.uuid;
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.selectedItem.transferPsoFlag = '2';
                    $scope.resetButtonDisabled();
                    $scope.changeButtonStatus($scope.selectedItem);
                    $scope.showInfo('取消抛转成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            }
        });
    };

    // 逾期拒绝配送
    $scope.o2oOverdueMenuAction = function () {
        if ((!$scope.selected || $scope.selected.length == 0) && $scope.selectedTabIndex == 0) {
            $scope.showError('请选择待逾期拒绝配送操作销售单。');
            return;
        }
        if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
            var threwNos = '';
            angular.forEach($scope.selected, function (item) {
                if (item.transferPsoFlag == '1') {
                    threwNos = threwNos + item.no + ","
                }
            });
            if (threwNos != '') {
                threwNos = threwNos.substr(0, threwNos.length - 1);
                $scope.showError('存在已抛转的销售单，不允许逾期拒绝配送操作：' + threwNos);
                return;
            }
        }

        if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
            if ($scope.selectedItem.o2oFlag == '5') {
                $scope.showError('该单已是逾期拒绝配送。');
                return;
            }
            if ($scope.selectedItem.o2oFlag != '2') {
                $scope.showError('该单配送状态不是确认中，不允许逾期拒绝配送操作。');
                return;
            }
            if ($scope.selectedItem.transferPsoFlag == '1') {
                $scope.showError('已抛转的销售单不允许逾期拒绝配送操作。');
                return;
            }
        }

        $scope.showConfirm('确认逾期拒绝配送操作吗？', '', function () {
            var orderMasterUpdateInput = {
                uuid: '',
                o2oFlag: '5'
            };
            if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) { // form
                orderMasterUpdateInput.uuid = $scope.selectedItem.uuid;
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.selectedItem.confirm = '1';
                    $scope.resetButtonDisabled();
                    $scope.changeButtonStatus($scope.selectedItem);
                    $scope.showInfo('逾期拒绝配送成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { // list
                //update $scope.selected
                angular.forEach($scope.selected, function (item) {
                    orderMasterUpdateInput.uuid += (orderMasterUpdateInput.uuid ? ',' : '') + item.uuid;
                });
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.queryMenuActionWithPaging();
                    $scope.showInfo('逾期拒绝配送成功。');
                }).error(function (resp) {
                    $scope.showError(resp.message);
                });
            }
        });
    };

    SaleTypes.getAll().success(function (data) {
        $scope.saleTypes = data;
    });

    //修改产品信息(单身)
    $scope.orderDetailEditMenuAction = function (orderDetail) {
        if ($scope.selectedItem.transferPsoFlag == '1') {
            $scope.showError('已抛转的销售单不能修改。');
            return;
        }
        $mdDialog.show({
            controller: 'EOrderDetailController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/orderDetailEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedOrderDetail: orderDetail,
                saleTypes: $scope.saleTypes
            }
        }).then(function (data) {
            EcommerceOrderDetail.modify($scope.selectedItem.uuid, data.selectedOrderDetail).success(function () {
                var orderMasterUpdateInput = {
                    uuid: $scope.selectedItem.uuid,
                    orderChangeFlag: '2'
                };
                EcommerceOrdersMaster.modify(orderMasterUpdateInput).success(function () {
                    $scope.selectedItem.orderChangeFlag = '2';
                    $scope.resetButtonDisabled();
                    $scope.changeButtonStatus($scope.selectedItem);
                    EcommerceOrderDetail.getAll($scope.selectedItem.uuid).success(function (data) {
                        $scope.OrderDetailList = data;
                        $scope.updateOrderDetailDeliverDate($scope.OrderDetailList);//YYYY-MM-DD
                        $scope.OrderExtendDetailList = [];
                        angular.forEach($scope.OrderDetailList.content, function (orderDetail) {
                            EcommerceOrderDetailExtend.getAll($scope.selectedItem.uuid, orderDetail.uuid).success(function (data) {
                                $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                            });
                        });
                    });
                    $scope.showInfo('修改成功，正在刷新。');
                });
            })
        });
    };

    //删除产品信息(单身)
    $scope.orderDetailDeleteMenuAction = function (orderDetail) {
        if ($scope.selectedItem.transferPsoFlag == '1') {
            $scope.showError('已抛转的销售单不能再删除。');
            return;
        }
        $scope.showConfirm('确认删除吗？', '删除的产品不可恢复。', function () {
            if ($scope.selectedItem && orderDetail) {
                EcommerceOrderDetail.delete($scope.selectedItem.uuid, orderDetail.uuid).success(function () {
                    var OrderMasterUpdateInput = {
                        uuid: $scope.selectedItem.uuid,
                        orderChangeFlag: '2'
                    };
                    EcommerceOrdersMaster.modify(OrderMasterUpdateInput).success(function () {
                        $scope.selectedItem.orderChangeFlag = '2';
                        $scope.resetButtonDisabled();
                        $scope.changeButtonStatus($scope.selectedItem);
                        EcommerceOrderDetail.getAll($scope.selectedItem.uuid).success(function (data) {
                            $scope.OrderDetailList = data;
                            $scope.updateOrderDetailDeliverDate($scope.OrderDetailList);
                            $scope.OrderExtendDetailList = [];
                            angular.forEach($scope.OrderDetailList.content, function (orderDetail) {
                                EcommerceOrderDetailExtend.getAll($scope.selectedItem.uuid, orderDetail.uuid).success(function (data) {
                                    $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                                });
                            });
                        });
                        $scope.showInfo('删除成功,正在刷新。');
                    });
                }).error(function (response) {
                    $scope.showError($scope.getError(response));
                });
            }
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
            $scope.selectedItem.mallUuid = data.mall.uuid;
        });
    };

    $scope.openO2oChannelDlg = function () {
        $mdDialog.show({
            controller: 'Eo2oChannelSearchController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.o2oChannel = data;
            $scope.selectedItem.o2oChannel.name = data.name;
            $scope.selectedItem.o2oChannel.uuid = data.uuid;
            $scope.selectedItem.o2oChannelUuid = data.uuid;
        });
    };

    $scope.openTaobaoClientDlg = function () {
        $mdDialog.show({
            controller: 'ETaobaoClientController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/selectTaobaoClient.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.taobaoCustomer = data;
            $scope.selectedItem.taobaoCustomerUuid = data.uuid;
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
    //选择平台
    $scope.openMallDlg = function () {
        $mdDialog.show({
            controller: 'EMallSearchController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/selectMall.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            console.info($scope.selectedItem);
            if (angular.isUndefined($scope.selectedItem.channel) || $scope.selectedItem.channel == null) {
                $scope.selectedItem.channel = [];
            } else {
            }
            $scope.selectedItem.mallUuid = data.uuid;
            $scope.selectedItem.channel.mall = data;
        });
    };
    //选择客服
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
    //选择区域
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

    //新增单身产品的弹窗
    $scope.openAddDetailDlg = function () {
        if (angular.isUndefined($scope.selectedItem.uuid) || $scope.selectedItem.uuid == null) {
            $scope.showError('请保存单头后再新增产品单身。');
            return;
        }
        $mdDialog.show({
            controller: 'EAddDetailController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/orderDetailAddDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                saleTypes: $scope.saleTypes,
                OrderDetailList: $scope.OrderDetailList
            }
        }).then(function (data) {
            //console.info(data.addOrderDetail);
            //console.info($scope.selectedItem);
            var orderMasterUuid = $scope.selectedItem.uuid;
            var orderDetailInput = {
                no: data.addOrderDetail.no,  //项次
                itemUuid: data.addOrderDetail.itemUuid,  //商品UUID
                itemAttribute: data.addOrderDetail.itemAttribute,    //商品属性
                saleTypeUuid: data.addOrderDetail.saleTypeUuid,      //销售类型
                orderQuantity: data.addOrderDetail.orderQuantity,    //数量
                orderPrice: data.addOrderDetail.orderPrice,      //订单价
                originalOrderAmount: data.addOrderDetail.originalOrderAmount,    //税前金额
                originalOrderAmountTax: data.addOrderDetail.originalOrderAmountTax,    //含税价
                remark: data.addOrderDetail.remark,    //备注

                itemName: data.addOrderDetail.item.name,
                standard: data.addOrderDetail.item.standard,
                suggestPrice: data.addOrderDetail.item.suggestPrice
            };
            EcommerceOrderDetail.add(orderMasterUuid, orderDetailInput).success(function (data) {
                var OrderMasterUpdateInput = {
                    uuid: $scope.selectedItem.uuid,
                    orderChangeFlag: '2'
                };
                EcommerceOrdersMaster.modify(OrderMasterUpdateInput).success(function () {
                    $scope.selectedItem.orderChangeFlag = '2';
                    $scope.resetButtonDisabled();
                    $scope.changeButtonStatus($scope.selectedItem);
                    EcommerceOrderDetail.getAll(orderMasterUuid).success(function (data) {
                        $scope.OrderDetailList = data;
                        $scope.updateOrderDetailDeliverDate($scope.OrderDetailList);
                        $scope.OrderExtendDetailList = [];
                        angular.forEach($scope.OrderDetailList.content, function (orderDetail) {
                            EcommerceOrderDetailExtend.getAll(orderMasterUuid, orderDetail.uuid).success(function (data) {
                                $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                            });
                        });
                    }).error(function (response) {
                        $scope.showError($scope.getAllError(response));
                        $scope.showError(response);
                    });
                    $scope.showInfo('新增成功,正在刷新。');
                }).error(function (response) {
                    $scope.showError($scope.getAllError(response));
                    $scope.showError(response);
                });
            }).error(function (response) {
                $scope.showError($scope.getAllError(response));
                $scope.showError(response.content);
            });

        });
    };

    //修改出货子单身
    $scope.orderExtendDetailEditMenuAction = function (orderDetailExtend) {
        $mdDialog.show({
            controller: 'EeditOrderExtendDetailController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/orderDetailExtendEditDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedOrderDetailExtend: orderDetailExtend,
                saleTypes: $scope.saleTypes
            }
        }).then(function (data) {
            console.info('准备修改出货子单身-data:');
            console.info(data.selectedOrderDetailExtend);
            EcommerceOrderDetailExtend.modify($scope.selectedItem.uuid, data.selectedOrderDetailExtend.epsOrderDetail.uuid, data.selectedOrderDetailExtend.uuid, data.selectedOrderDetailExtend)
                .success(function () {
                    EcommerceOrderDetail.getAll($scope.selectedItem.uuid).success(function (data) {
                        $scope.OrderDetailList = data;
                        $scope.updateOrderDetailDeliverDate($scope.OrderDetailList);//YYYY-MM-DD
                        $scope.OrderExtendDetailList = [];
                        angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                            EcommerceOrderDetailExtend.getAll($scope.selectedItem.uuid, orderDetail.uuid).success(function (data) {
                                $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                            });
                        });
                    });
                    $scope.showInfo('修改成功,正在刷新。');
                });
        });
    };

    //新增出货子单身
    $scope.openAddDetailExtendDlg = function () {
        if (angular.isUndefined($scope.selectedItem.uuid) || $scope.selectedItem.uuid == null) {
            $scope.showError('请保存单头后再新增出货子单身。');
            return;
        }
        console.info("$scope.OrderDetailList");
        console.info($scope.OrderDetailList);
        if (angular.isUndefined($scope.OrderDetailList) || $scope.OrderDetailList == null) {
            $scope.showError('请新增产品单身后再新增出货子单身。');
            return;
        }
        if ($scope.OrderDetailList.content == 0) {
            $scope.showError('请新增产品单身后再新增出货子单身。');
            return;
        }
        $mdDialog.show({
            controller: 'EaddOrderDetailExtendController',
            templateUrl: 'app/src/app/taobao_data/ecommerce_orders/orderDetailExtendAddDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                saleTypes: $scope.saleTypes,
                selectedItem: $scope.selectedItem

            }
        }).then(function (data) {
            console.info('选择完毕准备新增出货子单身-data:');
            console.info(data.addOrderDetailExtend);
            var orderMasterUuid = $scope.selectedItem.uuid;
            var orderDetailExtendInput = {
                selectedOrderDetailUuid: data.addOrderDetailExtend.selectedOrderDetailUuid,
                epsOrderDetailUuid: data.addOrderDetailExtend.epsOrderDetailUuid,
                parentItemUuid: data.addOrderDetailExtend.parentItemUuid,
                no: data.addOrderDetailExtend.selectedBom.no,  //项次
                itemUuid: data.addOrderDetailExtend.selectedBomUuid,  //商品UUID
                itemAttribute: data.addOrderDetailExtend.itemAttribute,    //商品属性
                orderQuantity: data.addOrderDetailExtend.orderQuantity,    //数量
                orderPrice: data.addOrderDetailExtend.orderPrice,    //订单金额
                originalOrderAmount: data.addOrderDetailExtend.originalOrderAmount,      //税前金额
                originalOrderAmountTax: data.addOrderDetailExtend.originalOrderAmountTax,      //税后金额
                standardAmount: data.addOrderDetailExtend.standardAmount,      //标准金额
                remark: data.addOrderDetailExtend.remark,    //备注
            };
            EcommerceOrderDetailExtend.add(orderMasterUuid, data.addOrderDetailExtend.selectedOrderDetailUuid, orderDetailExtendInput).success(function (data) {
                EcommerceOrderDetail.getAll($scope.selectedItem.uuid).success(function (data) {
                    $scope.OrderDetailList = data;
                    $scope.updateOrderDetailDeliverDate($scope.OrderDetailList);//YYYY-MM-DD
                    $scope.OrderExtendDetailList = [];
                    angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                        EcommerceOrderDetailExtend.getAll($scope.selectedItem.uuid, orderDetail.uuid).success(function (data) {
                            $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                        });
                    });
                });
                $scope.showInfo('新增成功,正在刷新。');
            }).error(function (response) {
                $scope.showError($scope.getAllError(response));
            });
        });
    };

    //删除出货子单身
    $scope.orderDetailExtendDeleteMenuAction = function (orderDetailExtend) {
        if ($scope.selectedItem.transferPsoFlag == '1') {
            $scope.showError('已抛转的销售单不能再删除。');
            return;
        }
        $scope.showConfirm('确认删除吗？', '删除的产品不可恢复。', function () {
            //console.info($scope.selectedItem);
            //console.info(orderDetailExtend);
            if ($scope.selectedItem && orderDetailExtend) {
                EcommerceOrderDetailExtend.delete($scope.selectedItem.uuid, orderDetailExtend.epsOrderDetail.uuid, orderDetailExtend.uuid).success(function () {
                    EcommerceOrderDetail.getAll($scope.selectedItem.uuid).success(function (data) {
                        $scope.OrderDetailList = data;
                        $scope.updateOrderDetailDeliverDate($scope.OrderDetailList);//YYYY-MM-DD
                        $scope.OrderExtendDetailList = [];
                        angular.forEach($scope.OrderDetailList.content, function (orderDetail, index) {
                            EcommerceOrderDetailExtend.getAll($scope.selectedItem.uuid, orderDetail.uuid).success(function (data) {
                                $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                            });
                        });
                    });
                    $scope.showInfo('删除成功,正在刷新。');
                }).error(function (response) {
                    $scope.showError($scope.getError(response));
                });
            }
        });

    };

    $scope.rollbackTransfer = function () {
        $scope.showConfirm('确认抛转还原吗？', '', function () {
            if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) { // form

                EcommerceOrdersMaster.rollback([ $scope.selectedItem.uuid ]).success(function () {
                    $scope.selectedItem.transferPsoFlag = Constant.TRANSFER_PSO_FLAG[2].value;
                    $scope.queryMenuActionWithPaging();
                    $scope.showInfo('还原成功！');
                }).error(function (data) {
                    $scope.showError(data.message);
                });
            } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) { // list
                var uuids = [];
                angular.forEach($scope.selected, function (item) {
                    uuids.push(item.uuid);
                });

                EcommerceOrdersMaster.rollback(uuids).success(function () {
                    $scope.queryMenuActionWithPaging();
                    $scope.showInfo('还原成功！');
                }).error(function (data) {
                    $scope.showError(data.message);
                });
            }
        });
    };

});

angular.module('IOne-Production').controller('EOrderDetailController', function ($scope, $mdDialog, selectedOrderDetail, saleTypes) {
    $scope.selectedOrderDetail = angular.copy(selectedOrderDetail);
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
            $scope.selectedOrderDetail.orderPrice = 0;
            $scope.disableOrderPrice = true;
        } else {
            $scope.disableOrderPrice = false;
        }
    };
    $scope.selectBom = function (production) {
        if (production) {
            $scope.selectedOrderDetail.item = production;
            $scope.selectedOrderDetail.itemUuid = production.uuid;
            $scope.isChangingProduction = false;
        }
    };

    $scope.hideDlg = function () {
        $mdDialog.hide({
            'selectedOrderDetail': $scope.selectedOrderDetail
        });
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('EChannelSearchController', function ($scope, $mdDialog, EchannelService) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };
    //查询按钮重查时，翻页到第一页
    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshChannel();
    };

    $scope.refreshChannel = function () {
        EchannelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword, 5).success(function (data) {
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

angular.module('IOne-Production').controller('Eo2oChannelSearchController', function ($scope, $mdDialog, EchannelService) {
    $scope.isO2o = true;
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };
    //查询按钮重查时，翻页到第一页 //
    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshChannel();
    };

    $scope.refreshChannel = function () {
        EchannelService.getO2oChannel($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword, "").success(function (data) {
            $scope.allChannel = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
            console.log(data);
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

angular.module('IOne-Production').controller('ETaobaoClientController', function ($scope, $mdDialog, EtaobaoCustomers) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.refreshData = function () {
        EtaobaoCustomers.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.searchKeyword).success(function (data) {
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

angular.module('IOne-Production').controller('EDelivWaySearchController', function ($scope, $mdDialog, EdelivWayService) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshDelivWay();
    };

    $scope.refreshDelivWay = function () {
        EdelivWayService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.searchKeyword).success(function (data) {
            $scope.allDelivWay = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshDelivWay();

    $scope.selectDelivWay = function (delivWay) {
        //$scope.deliverWay = delivWay;
        $scope.delivWay = delivWay;
        $mdDialog.hide($scope.delivWay);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.delivWay);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('EGroupUserSearchController', function ($scope, $mdDialog, EgroupUserService) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshGroupUser();
    };

    $scope.refreshGroupUser = function () {
        EgroupUserService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.searchKeyword).success(function (data) {
            $scope.allGroupUser = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshGroupUser();

    $scope.selectGroupUser = function (groupUser) {
        $scope.groupUser = groupUser;
        $mdDialog.hide($scope.groupUser);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.groupUser);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('EMallSearchController', function ($scope, $mdDialog, EmallService) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    $scope.refreshMall = function () {
        EmallService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.searchKeyword).success(function (data) {
            $scope.allMall = data;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshMall();

    $scope.selectMall = function (mall) {
        $scope.mall = mall;
        $mdDialog.hide($scope.mall);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.mall);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('EAreaSearchController', function ($scope, $mdToast, $mdDialog, EareaService, SYSMapsService) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0,
        displayModel: 0
    };

    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.refreshArea();
    };

    $scope.refreshArea = function () {
        //edit by xavier on 20160608
        //EareaService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword).success(function (data) {
        EareaService.getAllForEcommerceOrders($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, 0, 0, $scope.searchKeyword).success(function (data) {
            $scope.allArea = data;
            angular.forEach($scope.allArea.content, function (area) {
                if (area.fullPath) {
                    area.path = "";
                    for (var i = 2, l = area.fullPath.length; i < l; i++) {
                        area.path = area.path + area.fullPath[i] + "-"
                    }
                    area.path = area.path.substr(0, area.path.length - 1);
                }
            });
            //console.info( $scope.allArea);
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.refreshArea();

    $scope.selectArea = function (area) {
        SYSMapsService.getAll(100, 0, 'TIPTOP', '电商城区编码', area.uuid).success(function (data) {
            if (data.totalElements > 0 && data.content.length > 0) {
                $scope.area = area;
                $mdDialog.hide($scope.area);
            } else {
                toastr["error"]("该区域没有对应的电商城区编码,请检查或重新选择");
            }
        });
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.area);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

//新增产品单身(参照修改)
angular.module('IOne-Production').controller('EAddDetailController', function ($scope, $mdDialog, saleTypes, OrderDetailList) {
    $scope.OrderDetailList = angular.copy(OrderDetailList);
    $scope.addOrderDetail = [];

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
            $scope.addOrderDetail.saleTypeUuid = saleType.uuid; //默认值：常规 ST01
        }
        if (saleType.no == 'ST04') {
            eSaleType[i++] = saleType;
        }
    });

    $scope.saleTypes = eSaleType;

    $scope.disableOrderPrice = false;
    //是否显示选择商品窗口
    $scope.isChangingProduction = false;
    $scope.showChangingProductionPanel = function () {
        $scope.isChangingProduction = true;
    };
    $scope.hideChangingProductionPanel = function () {
        $scope.isChangingProduction = false;
    };
    //console.info(OrderDetailList);
    var maxNo = 0;
    $scope.findMaxNo = function (OrderDetailList) {
        if ($scope.OrderDetailList !== undefined && $scope.OrderDetailList !== '' && $scope.OrderDetailList !== null) {
            maxNo = 0;
            angular.forEach(OrderDetailList.content, function (orderDetail) {
                if (Number(orderDetail.no) > Number(maxNo)) {
                    maxNo = Number(orderDetail.no)
                }
            });
        }
    };
    $scope.findMaxNo(OrderDetailList);
    //赠送类型的单价设置为0
    $scope.setZero = function (saleType) {
        if (saleType.name == '赠送') {
            $scope.addOrderDetail.orderPrice = 0;
            $scope.disableOrderPrice = true;
        } else {
            $scope.disableOrderPrice = false;
        }
    };

    //选中商品
    $scope.selectBom = function (production) {
        if (production) {
            $scope.addOrderDetail.no = Number(maxNo) + Number(1);
            $scope.addOrderDetail.item = production;
            $scope.addOrderDetail.itemUuid = production.uuid;
            $scope.addOrderDetail.orderQuantity = 1;    //新增时默认数量设置为1
            $scope.isChangingProduction = false;
            //console.info($scope.addOrderDetail)
        }
    };

    $scope.hideDlg = function () {
        $mdDialog.hide({'addOrderDetail': $scope.addOrderDetail});
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

//新增出货子单身
angular.module('IOne-Production').controller('EaddOrderDetailExtendController', function ($scope, $mdDialog, EcommerceOrderDetail, selectedItem, Constant) {
    $scope.itemSearchParam = {
        confirm: 2,
        release: 2,
        status: 1,
        eshopType: 2,
        assemblingFlag: 1
    };
    console.info('在EaddOrderDetailExtendController的selectedItem');
    $scope.selectedItem = angular.copy(selectedItem);
    console.info($scope.selectedItem);
    $scope.addOrderDetailExtend = [];
    $scope.addOrderDetailExtend.selectedOrderDetail = [];
    $scope.addOrderDetailExtend.selectedBom = [];
    $scope.isChangingProduction = false;
    $scope.showChangingProductionPanel = function () {
        $scope.isChangingProduction = true;
    };
    $scope.hideChangingProductionPanel = function () {
        $scope.isChangingProduction = false;
    };

    $scope.refreshOrderDetail = function () {
        EcommerceOrderDetail.getAll($scope.selectedItem.uuid).success(function (data) {
            $scope.allOrderDetail = data;
        });
    };
    $scope.refreshOrderDetail();

    $scope.selectedOrderDetail = function (epsOrderDetailUuid, parentItemUuid) {
        if (epsOrderDetailUuid && parentItemUuid) {
            $scope.addOrderDetailExtend.epsOrderDetailUuid = epsOrderDetailUuid;
            $scope.addOrderDetailExtend.parentItemUuid = parentItemUuid
        }
    };

    $scope.selectBom = function (production) {
        if (production) {
            $scope.addOrderDetailExtend.selectedBom = production;
            $scope.addOrderDetailExtend.selectedBomUuid = production.uuid;
            $scope.addOrderDetailExtend.orderQuantity = 1;    //新增时默认数量设置为1
            $scope.isChangingProduction = false;
        }
    };

    $scope.hideDlg = function () {
        $mdDialog.hide({
            'addOrderDetailExtend': $scope.addOrderDetailExtend
        });
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});

//修改出货子单身
angular.module('IOne-Production').controller('EeditOrderExtendDetailController', function ($scope, $mdDialog, selectedOrderDetailExtend, saleTypes) {
    $scope.itemSearchParam = {
        confirm: 2,
        release: 2,
        status: 1,
        eshopType: 2,
        assemblingFlag: 1
    };

    $scope.selectedOrderDetailExtend = angular.copy(selectedOrderDetailExtend);
    console.info('修改出货子单身，原始值：');
    console.info($scope.selectedOrderDetailExtend);
    $scope.isChangingProduction = false;
    $scope.showChangingProductionPanel = function () {
        $scope.isChangingProduction = true;
    };
    $scope.hideChangingProductionPanel = function () {
        $scope.isChangingProduction = false;
    };
    $scope.selectedOrderDetailExtend.parentItemUuid = $scope.selectedOrderDetailExtend.parentItem.uuid;
    $scope.selectedOrderDetailExtend.epsOrderDetailUuid = $scope.selectedOrderDetailExtend.epsOrderDetail.uuid;
    $scope.selectedOrderDetailExtend.itemUuid = $scope.selectedOrderDetailExtend.item.uuid;//未修改商品取原来uuid
    $scope.selectBom = function (production) {
        if (production) {
            $scope.selectedOrderDetailExtend.item = production;
            $scope.selectedOrderDetailExtend.itemUuid = production.uuid;
            $scope.isChangingProduction = false;
        }
    };
    $scope.hideDlg = function () {
        $mdDialog.hide({
            'selectedOrderDetailExtend': $scope.selectedOrderDetailExtend
        });
    };
    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});




