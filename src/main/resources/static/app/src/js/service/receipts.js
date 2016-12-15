angular.module('IOne-Production').service('Receipts', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, channelUuid, no, orderReceiptDetailStatus, orderAmount, paidAmount, unpaidAmount, resUuid) {
        var orderReceiptDetailStatus = orderReceiptDetailStatus == 0 ? '' : orderReceiptDetailStatus;
        var url = '/orders?size=' + sizePerPage
            + '&page=' + page
            + '&paidType=0';

        if (orderReceiptDetailStatus !== '') {
            url = url + '&orderReceiptDetailStatus=' + orderReceiptDetailStatus;
        }

        if (no !== undefined && no !== null) {
            url = url + '&orderMasterNo=' + no;
        }

        if (channelUuid !== undefined && channelUuid != null) {
            url = url + '&channelUuid=' + channelUuid;
        }

        if (orderAmount !== undefined && orderAmount !== null) {
            url = url + '&orderAmount=' + orderAmount;
        }

        if (paidAmount !== undefined && paidAmount !== null) {
            url = url + '&paidAmount=' + paidAmount;
        }

        if (unpaidAmount !== undefined && unpaidAmount !== null) {
            url = url + '&unpaidAmount=' + unpaidAmount;
        }

        if (resUuid != null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getReceiptOrderMasterCount = function (orderReceiptDetailStatus, resUuid) {
        var orderReceiptDetailStatus = orderReceiptDetailStatus == 0 ? '' : orderReceiptDetailStatus;
        var url = '/orders/count?'
            + '&paidType=0'
            + '&orderReceiptDetailStatus=' + orderReceiptDetailStatus;;;;;;

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (masterUuid, scope) {
        var url = '/orders/' + masterUuid + '/receipts?';

        if (scope != null) {
            url = url + 'scope=' + scope;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };
    this.modify = function (masterUuid, detailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/receipts/' + detailUpdateInput.uuid, detailUpdateInput);
    };

    this.oneOffSync = function (uuid, detailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + uuid + '/receipts/' + detailUpdateInput.uuid + '/sync', detailUpdateInput);
    };

    this.auditTransfer = function (orderUuid, uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + orderUuid + '/receipts?action=auditTransfer', uuids);
    };

});




