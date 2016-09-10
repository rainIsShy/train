angular.module('IOne-Production').service('EPSReceipts', function ($http, Constant) {

    this.get = function (masterUuid, scope) {
        var url = '/epsOrders/' + masterUuid + '/receipts?';

        if (scope != null) {
            url = url + 'scope=' + scope;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };
    this.modify = function (masterUuid, detailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/receipts/' + detailUpdateInput.uuid, detailUpdateInput);
    };
});

angular.module('IOne-Production').service('EPSMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, orderFlag, confirm, status, transferPsoFlag, buyerNick, orderMasterNo, orderDateBegin, orderDateEnd, resUuid,channelUuid) {
        orderFlag = orderFlag == 0 ? '' : orderFlag;
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;

        var url = 'epsOrders?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&transferPsoFlag=' + transferPsoFlag;

        if (orderFlag !== null) {
            url = url + '&orderFlag=' + orderFlag;
        }

        if (buyerNick !== null) {
            url = url + '&buyerNick=' + buyerNick;
        }

        if (orderMasterNo !== null) {
            url = url + '&no=' + orderMasterNo;
        }

        if (orderDateBegin !== null) {
            url = url + '&orderDateBegin=' + orderDateBegin;
        }

        if (orderDateEnd !== null) {
            url = url + '&orderDateEnd=' + orderDateEnd;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

         if (channelUuid !== null) {
             url = url + '&channelUuid=' + channelUuid;
         }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/epsOrders/' + uuid);
    };

    this.add = function (order) {
        return $http.post(Constant.BACKEND_BASE + '/epsOrders/', order);
    };

    this.modify = function (OrderMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + OrderMasterUpdateInput.uuid, OrderMasterUpdateInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/epsOrders/' + uuid);
    };

    this.print = function (type, uuid) {
        return $http.get(Constant.BACKEND_BASE + '/reports', {
            params: {type: type, params: uuid}
        });
    };

    //新增时初始化所有栏位
    this.createDefault = function () {
        orderDate = new Date();
        predictDeliverDate = new Date(orderDate.valueOf() + 2 * 24 * 60 * 60 * 1000);
        order = {
            "no": "",
            "userId": "",
            "buyerNick": "",
            "receiveName": "",
            "receivePhone": "",
            "receiveAddress": "",
            "receiveDistrict": "",
            "remark": "",
            "orderFlag": "4",
            "orderAmount": "",
            "assembleAmount": "",
            "orderDate": orderDate,
            'predictDeliverDate': predictDeliverDate,
            "channel": "",
            "details": "",
            "deliverWay": ""
        };
        return order;
    };

});



