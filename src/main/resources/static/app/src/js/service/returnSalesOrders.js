angular.module('IOne-Production').service('PSOReturnSalesOrdersMasterService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, transferPsoFlag, orderMasterNo, orderDateBegin, orderDateEnd, channelUuid, allNames, onlyReturn, returnSalesOrderDetailConfirm, returnSalesOrderDetailStatus, returnSalesOrderDetailTransfer, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;

        var url = '/salesOrders?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&transferPsoFlag=' + transferPsoFlag;

        if (orderMasterNo !== null) {
            url = url + '&no=' + orderMasterNo;
        }
        if (orderDateBegin !== null && orderDateBegin !== undefined) {
            var orderDateBegin = new Date(orderDateBegin);
            orderDateBegin = moment(orderDateBegin).format('YYYY-MM-DD 00:00:00');
            url = url + '&orderDateBegin=' + orderDateBegin;
        }
        if (orderDateEnd !== null && orderDateEnd !== undefined) {
            var orderDateEnd = new Date(orderDateEnd);
            orderDateEnd = moment(orderDateEnd).format('YYYY-MM-DD 23:59:59');
            url = url + '&orderDateEnd=' + orderDateEnd;
        }
        if (allNames !== null && allNames !== undefined) {
            url = url + '&allNames=' + allNames;
        }
        if (channelUuid != null && channelUuid != undefined) {
            url = url + '&channelUuid=' + channelUuid;
        }
        if (onlyReturn != null && onlyReturn != undefined) {
            url = url + '&onlyReturn=' + onlyReturn;
        }
        if (returnSalesOrderDetailConfirm !== undefined && returnSalesOrderDetailConfirm !== null && returnSalesOrderDetailConfirm !=0) {
            url = url + '&returnSalesOrderDetailConfirm=' + returnSalesOrderDetailConfirm;
        }
        if (returnSalesOrderDetailStatus !== undefined && returnSalesOrderDetailStatus !== null  && returnSalesOrderDetailStatus !=0) {
            url = url + '&returnSalesOrderDetailStatus=' + returnSalesOrderDetailStatus;
        }
        if (returnSalesOrderDetailTransfer !== undefined && returnSalesOrderDetailTransfer !== null  && returnSalesOrderDetailTransfer !=0) {
            url = url + '&returnSalesOrderDetailTransferPsoFlag=' + returnSalesOrderDetailTransfer;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getReturnOrderMasterCount = function (confirm, status, transferPsoFlag, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;

        var url = '/salesOrders/count?'
            + '&returnSalesOrderDetailConfirm=' + confirm
            + '&returnSalesOrderDetailStatus=' + status
            + '&returnSalesOrderDetailTransferPsoFlag=' + transferPsoFlag
            + '&onlyReturn=1';

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('PSOReturnSalesOrdersDetailsService', function ($http, Constant) {
    this.getAll = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/returnSalesOrders');
    };
    this.get = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/returnSalesOrders/' + detailUuid);
    };
    this.modify = function (masterUuid, detailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/returnSalesOrders/' + detailUpdateInput.uuid, detailUpdateInput);
    };
    this.confirm = function (masterUuid, uuids, val) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/returnSalesOrders/' + uuids, {
            'modifyOnly': '1',
            'confirm': val
        });
    };
    this.transfer = function (masterUuid, uuids) {
        return $http.post(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/returnSalesOrders?toERP=true', {
            'returnSalesOrderDetailUuids': uuids.split(',')
        });
    };
});

angular.module('IOne-Production').service('PSOReturnSalesOrdersExtendsService', function ($http, Constant) {
    this.getAll = function (masterUuid, detailUuid) {
        var url = '/salesOrders/' + masterUuid + '/returnSalesOrders/' + detailUuid + '/extends/';
        return $http.get(Constant.BACKEND_BASE + url);
    };
    this.modify = function (masterUuid, detailUuid, extendUuid, extendUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/returnSalesOrders/' + detailUuid + '/extends/' + extendUuid, extendUpdateInput);
    };
});