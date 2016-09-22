angular.module('IOne-Production').service('EcommerceChangeMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, orderFlag, confirm, status, transferPsoFlag, buyerNick, orderMasterNo, orderDateBegin, orderDateEnd, resUuid) {
        orderFlag = orderFlag == 0 ? '' : orderFlag;
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;

        var url = '/orderChanges?size=' + sizePerPage
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

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.modify = function (changeOrderUuid, changeOrder) {
        return $http.patch(Constant.BACKEND_BASE + "/orderChanges/" + changeOrderUuid, changeOrder);
    };

});

angular.module('IOne-Production').service('EcommerceChangeDetail', function ($http, Constant) {
    this.getAll = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orderChanges/' + masterUuid + '/details');
    };
    this.get = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orderChanges/' + masterUuid + '/details/' + detailUuid);
    };
});

angular.module('IOne-Production').service('EcommerceChangeDetailExtend', function ($http, Constant) {
    this.getAll = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orderChanges/' + masterUuid + '/details/' + detailUuid + '/extends');
    };

    this.modify = function (masterUuid, detailUuid, uuid, OrderExtendDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orderChanges/' + masterUuid + '/details/' + detailUuid + '/extends/' + uuid, OrderExtendDetailUpdateInput);
    };

});
