angular.module('IOne-Production').service('JdTradeMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter, resUuid) {
        var confirm = filter.confirm == 0 ? '' : filter.confirm;
        var orderFlag = filter.orderFlag == 0 ? '' : filter.orderFlag;
        var orderState = filter.orderState == 0 ? '' : filter.orderState;
        //默认参数有confirm taobaoStatus
        var url = 'jdTrades?size=' + sizePerPage
            + '&page=' + page;

        if (confirm !== '') {
            url = url + '&confirm=' + confirm;
        }
        if (orderFlag !== '') {
            url = url + '&orderFlag=' + orderFlag;
        }
        if (orderState !== '') {
            url = url + '&orderState=' + orderState;
        }
        if (filter.orderId !== null && filter.orderId !== undefined) {
            url = url + '&orderId=' + filter.orderId;
        }
        if (filter.employeeNo !== null && filter.employeeNo !== undefined) {
            url = url + '&employeeNo=' + filter.employeeNo;
        }
        if (filter.startOrderDate !== null && filter.startOrderDate !== undefined) {
            var startOrderDate = new Date(filter.startOrderDate);
            startOrderDate = moment(startOrderDate).format('YYYY-MM-DD 00:00:00');
            url = url + '&startOrderDate=' + startOrderDate;
        }
        if (filter.endOrderDate !== null && filter.endOrderDate !== undefined) {
            var endOrderDate = new Date(filter.endOrderDate);
            endOrderDate = moment(endOrderDate).format('YYYY-MM-DD 23:59:59');
            url = url + '&endOrderDate=' + endOrderDate;
        }
        if (filter.startPaymentConfirmDate !== null && filter.startPaymentConfirmDate !== undefined) {
            var startPaymentConfirmDate = new Date(filter.startPaymentConfirmDate);
            startPaymentConfirmDate = moment(startPaymentConfirmDate).format('YYYY-MM-DD 00:00:00');
            url = url + '&startPaymentConfirmDate=' + startPaymentConfirmDate;
        }
        if (filter.endPaymentConfirmDate !== null && filter.endPaymentConfirmDate !== undefined) {
            var endPaymentConfirmDate = new Date(filter.endPaymentConfirmDate);
            endPaymentConfirmDate = moment(endPaymentConfirmDate).format('YYYY-MM-DD 23:59:59');
            url = url + '&endPaymentConfirmDate=' + endPaymentConfirmDate;
        }
        if (filter.pin !== null && filter.pin !== undefined) {
            url = url + '&pin=' + filter.pin;
        }
        if (filter.venderRemark != null) {
            url = url + '&venderRemark=' + filter.venderRemark;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    //审核（抛转）
    this.confirm = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/jdTrades/' + uuids, {'action': '2'});
    };

    //合并（审核抛转）
    this.merge = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/jdTrades/' + uuids, {'action': '3'});
    };

    //取消审核（取消抛转）
    this.cancelConfirm = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/jdTrades/' + uuids, {'action': '4'});
    };
});


angular.module('IOne-Production').service('JdTradeDetail1', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/jdTrades/' + masterUuid + '/details');
    };
});

angular.module('IOne-Production').service('JdTradeDetail2', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/jdTrades/' + masterUuid + '/details2');
    };
});




