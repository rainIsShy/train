angular.module('IOne-Production').service('PSOReturnSalesOrdersMasterService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filterOptions, resUuid) {
        var confirm = !filterOptions.confirm ? '' : filterOptions.confirm;
        var status = !filterOptions.status ? '' : filterOptions.status;
        var transferPsoFlag = !filterOptions.transferPsoFlag ? '' : filterOptions.transferPsoFlag;

        var url = '/salesOrders?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&transferPsoFlag=' + transferPsoFlag;

        if (filterOptions.orderMasterNo) {
            url += '&no=' + filterOptions.orderMasterNo;
        }
        if (filterOptions.orderDateBegin) {
            url += '&orderDateBegin=' + moment(new Date(filterOptions.orderDateBegin)).format('YYYY-MM-DD 00:00:00');
        }
        if (filterOptions.orderDateEnd) {
            url += '&orderDateEnd=' + moment(new Date(filterOptions.orderDateEnd)).format('YYYY-MM-DD 23:59:59');
        }
        if (filterOptions.allNames) {
            url += '&allNames=' + filterOptions.allNames;
        }
        if (filterOptions.channelUuid) {
            url += '&channelUuid=' + filterOptions.channelUuid;
        }
        if (filterOptions.onlyReturn) {
            url += '&onlyReturn=' + filterOptions.onlyReturn;
        }
        if (filterOptions.returnSalesOrderExtendDetailConfirm && filterOptions.returnSalesOrderExtendDetailConfirm !== '0') {
            url += '&returnSalesOrderExtendDetailConfirm=' + filterOptions.returnSalesOrderExtendDetailConfirm;
        }
        // if (returnSalesOrderDetailStatus) {
        //     url = url + '&returnSalesOrderDetailStatus=' + returnSalesOrderDetailStatus;
        // }
        if (filterOptions.returnSalesOrderExtendDetailTransferFlag && filterOptions.returnSalesOrderExtendDetailTransferFlag !== '0') {
            url += '&returnSalesOrderExtendDetailTransferFlag=' + filterOptions.returnSalesOrderExtendDetailTransferFlag;
        }
        if (resUuid) {
            url += '&resUuid=' + resUuid;
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

angular.module('IOne-Production').service('PSOReturnSalesOrdersExtends2Service', function ($http, Constant) {
    this.getAll = function (masterUuid) {
        var url = '/salesOrders/' + masterUuid + '/returnSalesOrdersExtends/';
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.confirm = function (masterUuid, uuids, val) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/returnSalesOrdersExtends?action=confirm', { 'uuids': uuids, 'confirm': val });
    };

    this.transfer = function (masterUuid, uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/returnSalesOrdersExtends?action=transfer', { 'uuids': uuids });
    };
});