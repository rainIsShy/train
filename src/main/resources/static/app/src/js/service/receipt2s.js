angular.module('IOne-Production').service('Receipt2s', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, channelUuid, no, receiptSalesOrderDetailStatus, customerName, resUuid) {
        var receiptSalesOrderDetailStatus = receiptSalesOrderDetailStatus == 0 ? '' : receiptSalesOrderDetailStatus;

        var url = '/salesOrders?size=' + sizePerPage
            + '&page=' + page
            + '&onlyReceipt=1'

        if (receiptSalesOrderDetailStatus !== '') {
            url = url + '&receiptSalesOrderDetailStatus=' + receiptSalesOrderDetailStatus;
        }

        if (no !== null && no != undefined) {
            url = url + '&no=' + no;
        }

        if (channelUuid != null && channelUuid != undefined) {
            url = url + '&channelUuid=' + channelUuid;
        }

        if (customerName !== null) {
            url = url + '&customerName=' + customerName;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getReceiptOrderMasterCount = function (receiptSalesOrderDetailStatus, resUuid) {
        var receiptSalesOrderDetailStatus = receiptSalesOrderDetailStatus == 0 ? '' : receiptSalesOrderDetailStatus;
        var url = '/salesOrders/count?'
            + '&onlyReceipt=1'
            + '&receiptSalesOrderDetailStatus=' + receiptSalesOrderDetailStatus

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (masterUuid, scope) {
        var url = '/salesOrders/' + masterUuid + '/receipts?';

        if (scope != null) {
            url = url + 'scope=' + scope;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };
    this.modify = function (masterUuid, detailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/receipts/' + detailUpdateInput.uuid, detailUpdateInput);
    };
});
