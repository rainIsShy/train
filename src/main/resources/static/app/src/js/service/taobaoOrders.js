angular.module('IOne-Production').service('TaobaoOrders', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, employeeID, buyerNick, orderFlag, tid, taobaoStatus, sellerFlag, confirm, createdBegin, createdEnd, payTimeBegin, payTimeEnd, resUuid, buyerMessage, sellerMemo) {
        taobaoStatus = taobaoStatus == 0 ? '' : taobaoStatus;
        sellerFlag = sellerFlag == 0 ? '' : sellerFlag;
        confirm = confirm == 0 ? '' : confirm;
        orderFlag = orderFlag == 0 ? '' : orderFlag;
        //默认参数有confirm taobaoStatus
        var url = '/taobaoTrades?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&taobaoStatus=' + taobaoStatus
            + '&orderFlag=' + orderFlag
            + '&sellerFlag=' + sellerFlag;

        if (employeeID !== null && employeeID !== '') {
            url = url + '&employeeNo=' + employeeID;
        }
        if (buyerNick !== null) {
            url = url + '&buyerNick=' + buyerNick;
        }
        if (tid !== null) {
            url = url + '&tid=' + tid;
        }
        if (createdBegin !== null) {
            url = url + '&createdBegin=' + createdBegin;
        }
        if (createdEnd !== null) {
            url = url + '&createdEnd=' + createdEnd;
        }
        if (payTimeBegin !== null) {
            url = url + '&payTimeBegin=' + payTimeBegin;
        }
        if (payTimeEnd !== null) {
            url = url + '&payTimeEnd=' + payTimeEnd;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        if (buyerMessage != null) {
            url = url + '&buyerMessage=' + buyerMessage;
        }
        if (sellerMemo != null) {
            url = url + '&sellerMemo=' + sellerMemo;
        }

        console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };
    //审核（抛转）
    this.modify = function (OrderMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/taobaoTrades/' + OrderMasterUpdateInput.uuid, OrderMasterUpdateInput);
        //return $http.patch(Constant.BACKEND_BASE + '/taobaoTrades/' + OrderMasterUpdateInput.uuid, {'confirm': '2'});
    };

    this.merge = function(uuids) {
        return $http.put(Constant.BACKEND_BASE + '/taobaoTrades/orderCombine?uuids=' + uuids);
    };
    this.cancelConfirm = function(uuids) {
        return $http.put(Constant.BACKEND_BASE + '/taobaoTrades/cancelConfirm?uuids=' + uuids);
    };

    this.delivery = function(DeliveryInput){
        return $http.patch(Constant.BACKEND_BASE + '/taobaoTrades/' + DeliveryInput.uuid + '?type=delivery', DeliveryInput);
    }

    /*  this.getOrderMasterCount = function( confirm, status,resUuid) {
     confirm = confirm == 0 ? '' : confirm;
     status = status == 0 ? '' : status;

     var url = '/ /count?confirm=' + confirm
     + '&status=' + status;

     if(resUuid !== undefined && resUuid !== null) {
     url = url + '&resUuid=' + resUuid;
     }
     return $http.get(Constant.BACKEND_BASE + url);
     };

     this.get = function(uuid) {
     return $http.get(Constant.BACKEND_BASE + '/ /' + uuid);
     };
     */


});


angular.module('IOne-Production').service('TaobaoOrderDetail', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/taobaoTrades/' + masterUuid + '/details');
    };
});

angular.module('IOne-Production').service('TaobaoAmountMaster', function ($http, Constant) {
    this.get = function (taobaoTradeMasterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/taobaoAmounts?taobaoTradeUuid=' + taobaoTradeMasterUuid);
    };
});

angular.module('IOne-Production').service('TaobaoAmountDetail', function ($http, Constant) {
    this.get = function (TaobaoAmountMasterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/taobaoAmounts/' + TaobaoAmountMasterUuid + '/details');
    };
});




