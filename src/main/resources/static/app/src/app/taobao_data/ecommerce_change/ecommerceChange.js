angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/ecommerce-change', {
        controller: 'EcommerceChangeController',
        templateUrl: 'app/src/app/taobao_data/ecommerce_change/ecommerceChange.html'
    })
}]);

angular.module('IOne-Production').controller('EcommerceChangeController', function($scope, $q, EcommerceChangeMaster, EcommerceChangeDetail, EcommerceChangeDetailExtend, $mdDialog, $timeout, Constant) {
    $scope.ecommerceChangeListMenu = {
        selectAll : false,
        effectiveType : '2', //失效作废
        confirm : Constant.AUDIT[1].value, //审核状态
        status : Constant.STATUS[0].value, //启用状态
        transferPsoFlag : Constant.TRANSFER_PSO_FLAG[0].value,
        showQueryBar : true,
        buyerNick: '',
        orderFlag:Constant.ORDER_FLAG[0].value //订单类型
    };

    $scope.ecommerceFormMenuDisplayOption = {
        '107-change': {display: true, name: '变更', uuid: ''},
        '108-changehistory': {display: true, name: '变更记录查询', uuid: ''}
    };

    $scope.ecommerceChangeListMenuDisplayOption = {
        '400-selectAll': {display: true, name: '全选', uuid: ''},
        '401-audit': {display: true, name: '审核', uuid: '341666BA-254D-46CB-8D46-B408B363CCE7'},
        '402-return': {display: false, name: '退回', uuid: ''},
        '403-throw': {display: false, name: '抛转预订单', uuid: ''},
        '404-effective': {display: true, name: '失效作废', uuid: ''},
        '405-query': {display: true, name: '查询', uuid: ''},
        '406-revertAudit': {display: true, name: '取消审核', uuid: 'B32D6FAA-2C5E-459C-9EA0-63722D5B0D7D'}
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };


    //清单页签选中
    $scope.listTabSelected = function() {
        $scope.ecommerceChangeListMenu.showQueryBar = true;   //ecommerceChangeListMenu.html
        $scope.ecommerceChangeListMenuDisplayOption['400-selectAll'].display = true;  //全选
        $scope.queryMenuAction();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
        $scope.getMenuAuthData($scope.RES_UUID_MAP.EPS.CHANGE.LIST_PAGE.RES_UUID).success(function(data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });

    };
    //表单页签选中
    $scope.formTabSelected = function() {
        $scope.ecommerceChangeListMenu.showQueryBar = false;
        $scope.getMenuAuthData($scope.RES_UUID_MAP.EPS.CHANGE.FORM_PAGE.RES_UUID).success(function(data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    //重置已选 单据数 金额 按钮状态
    $scope.resetInitialValue = function() {
        $scope.selectedItem = null;
        $scope.selectedItemsCount = 0;
        $scope.selectedItemsTotalPrice = 0.00;
        $scope.resetButtonDisabled();
    }
    $scope.resetButtonDisabled = function() {
        $scope.effectiveType_disabled = 0;
        $scope.return_button_disabled = 0;
        $scope.audit_button_disabled = 0;
        $scope.throw_button_disabled = 0;
        $scope.revert_audit_button_disabled = 0;
    }

    //初始调用查询订单
    $scope.queryMenuAction = function() {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 100;
        $scope.pageOption.totalElements = 100;
        $scope.queryMenuActionWithPaging();
    }
    //查询订单
    $scope.queryMenuActionWithPaging = function() {
        $scope.selectedItem = null;
        $scope.selected = [];
        $scope.selectedItemsCount = 0;
        $scope.selectedItemsTotalPrice = 0.00;
        $scope.ecommerceChangeListMenu.selectAll = false;
        $scope.ecommerceChangeListMenu.effectiveType = '2';
        $scope.resetInitialValue();

        //查询条件：起始时间 截止时间 销售单号 启用状态 审核状态
        if($scope.ecommerceChangeListMenu.startDate !== undefined ) {
            if($scope.ecommerceChangeListMenu.startDate !== null){
                orderDateBegin = new Date($scope.ecommerceChangeListMenu.startDate);
                orderDateBegin = moment(orderDateBegin).format('YYYY-MM-DD');
            }else{
                orderDateBegin = null;
            }
        }else{
            orderDateBegin = null;
        }

        if($scope.ecommerceChangeListMenu.endDate !== undefined) {
            if($scope.ecommerceChangeListMenu.endDate !== null){
                orderDateEnd = new Date($scope.ecommerceChangeListMenu.endDate);
                orderDateEnd = moment(orderDateEnd).format('YYYY-MM-DD');
            }else{
                orderDateEnd = null;
            }
        }else{
            orderDateEnd = null;
        }

        if($scope.ecommerceChangeListMenu.orderId !== undefined && $scope.ecommerceChangeListMenu.orderId !== '') {
            orderMasterNo = $scope.ecommerceChangeListMenu.orderId;
        }else{
            orderMasterNo = null;
        }

        if ($scope.ecommerceChangeListMenu.buyerNick !== undefined && $scope.ecommerceChangeListMenu.buyerNick !== '') {
            buyerNick = $scope.ecommerceChangeListMenu.buyerNick;
        } else {
            buyerNick = null;
        }

        confirm = $scope.ecommerceChangeListMenu.confirm;
        status = $scope.ecommerceChangeListMenu.status;
        transferPsoFlag = $scope.ecommerceChangeListMenu.transferPsoFlag;
        orderFlag=$scope.ecommerceChangeListMenu.orderFlag;

        EcommerceChangeMaster.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, orderFlag, confirm, status, transferPsoFlag, buyerNick, orderMasterNo, orderDateBegin, orderDateEnd, RES_UUID_MAP.EPS.CHANGE.LIST_PAGE.RES_UUID)
            .success(function(data) {
                $scope.OrderMasterList = data;
                $scope.updateOrderMasterDate( $scope.OrderMasterList);//YYYY-MM-DD
                console.info($scope.OrderMasterList);
                $scope.pageOption.totalPage = data.totalPages;//页数
                $scope.pageOption.totalElements = data.totalElements;//总数
                //$scope.getOrderDetailCountByMasterUuid();
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
        $scope.ecommerceChangeListMenu.effectiveType = item.status;
        //console.info($scope.audit_button_disabled);
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
        $scope.ecommerceOrderListMenu.effectiveType = item.status;
        $scope.resetButtonDisabled();
        //$scope.changeButtonStatuOnly();
    };

    $scope.changeButtonStatusAndCalTotalPrice = function () {
        var firstLoop = true;
        angular.forEach( $scope.selected, function(orderMaster) {
            $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice + orderMaster.orderAmount;
            //initialize effectiveType
            if(firstLoop) {
                firstLoop = false;
                $scope.ecommerceChangeListMenu.effectiveType = orderMaster.status;
                //console.info($scope.ecommerceChangeListMenu.effectiveType);
                $scope.firstOrderMasterStatus = orderMaster.status;
            }else{
                if($scope.firstOrderMasterStatus !== orderMaster.status){
                    $scope.effectiveType_disabled = 1;
                }
            }
            //
            //$scope.changeButtonStatus(orderMaster);
        });
    };

    //是否选中（是否存在数组中，返回1或0）
    $scope.exists = function (item, list) {
        //console.info("ng-checked");
        return list.indexOf(item) > -1;
    };

    //全选
    $scope.selectAllMenuAction = function() {
        if($scope.ui_status==Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex==0){ //清单全选
            //console.info($scope.ecommerceChangeListMenu.selectAll);
            if($scope.ecommerceChangeListMenu.selectAll == true){
                angular.forEach( $scope.OrderMasterList.content, function(item) {
                    var idx = $scope.selected.indexOf(item);
                    if (idx < 0) {
                        $scope.selected.push(item);
                    }
                });
                $scope.resetInitialValue();
                $scope.changeButtonStatusAndCalTotalPrice();
                $scope.selectedItemsTotalPrice = $scope.selectedItemsTotalPrice.toFixed(2);
                $scope.selectedItemsCount = $scope.selected.length;
            }else if($scope.ecommerceChangeListMenu.selectAll == false){
                $scope.selected = [];
                $scope.ecommerceChangeListMenu.effectiveType = '1';
                $scope.resetInitialValue();
            }
        }
    };
    //查看详情，跳转到表单
    $scope.editItem = function(orderMaster) {
        $scope.selectedDetail = [];
        $scope.ecommerceChangeListMenu.selectAll = false;
        $scope.selectedItem = orderMaster;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        $scope.resetButtonDisabled();
        $scope.ecommerceChangeListMenu.effectiveType = orderMaster.status;

        EcommerceChangeDetail.getAll(orderMaster.uuid).success(function(data) {
            $scope.OrderDetailList = data;
            $scope.updateOrderDetailDeliverDate( $scope.OrderDetailList);//YYYY-MM-DD
            $scope.OrderExtendDetailList = [];
            angular.forEach($scope.OrderDetailList.content, function(orderDetail, index) {
                EcommerceChangeDetailExtend.getAll(orderMaster.uuid, orderDetail.uuid).success(function(data) {
                    $scope.OrderExtendDetailList = $scope.OrderExtendDetailList.concat(data.content);
                });
            });
        });
    };


    $scope.effectiveMenuAction = function() {};

    $scope.auditMenuAction = function() {
        $scope.showConfirm('确认审核吗？', '', function() {
            if( $scope.ui_status==Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex==1){
                if($scope.selectedItem.confirm == '2') {
                    $scope.showError('该单已经审核完成。');
                    return;
                }
                EcommerceChangeMaster.modify($scope.selectedItem.uuid, {confirm: '2'}).success(function() {
                    $scope.selectedItem.confirm = '2';
                    $scope.showInfo('审核成功。');
                });
            }else if($scope.ui_status==Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex==0){
                if(!$scope.selected || $scope.selected.length == 0) {
                    $scope.showError('请选择待审核变更单。');
                    return;
                }
                //update $scope.selected
                var promises = [];
                angular.forEach( $scope.selected, function(item) {
                    var response  =  EcommerceChangeMaster.modify(item.uuid, {confirm: '2', modiDate:item.modiDate}).success(function() {
                    });
                    promises.push(response);
                });
                $q.all(promises).then(function(data){
                    $scope.queryMenuActionWithPaging();
                    $scope.showInfo('审核成功。');
                });
            }
        });
    };

    $scope.revertAuditMenuAction = function() {};

    $scope.updateOrderMasterDate  = function(OrderMasterList){
        angular.forEach(OrderMasterList.content, function(orderMaster) {
            if(orderMaster.orderDate) {
                orderMaster.orderDate = new Date(orderMaster.orderDate);
            }
            if(orderMaster.predictDeliverDate) {
                orderMaster.predictDeliverDate = new Date(orderMaster.predictDeliverDate);
            }
        });
    };

    $scope.updateOrderDetailDeliverDate  = function(OrderDetailList){
        angular.forEach(OrderDetailList.content, function(orderDetail) {
            orderDetail.deliverDate = moment(orderDetail.deliverDate).format('YYYY-MM-DD');
        });
    };
});
