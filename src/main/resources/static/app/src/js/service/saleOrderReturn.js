angular.module('IOne-Production').service('PsoOrderReturnMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.select.confirm == 0 ? '' : filter.select.confirm;
        var transferPsoFlag = filter.select.transferPsoFlag == 0 ? '' : filter.select.transferPsoFlag;
        var status = filter.select.status == 0 ? '' : filter.select.status;
        var url = '/orders?size=' + sizePerPage
            + '&page=' + page
            + '&onlyReturn=1';

        if (confirm) {
            url = url + '&returnOrderExtendDetailConfirm=' + confirm;
        }
        if (transferPsoFlag) {
            url = url + '&returnOrderExtendDetailTransferFlag=' + transferPsoFlag;
        }
        // if (status !== '') {
        //     url = url + '&returnOrderDetailStatus=' + status;
        // }
        if (filter.no) {
            url = url + '&orderMasterNo=' + filter.no;
        }
        if (filter.employeeName) {
            url = url + '&employeeName=' + filter.employeeName;
        }
        if (filter.employeeNo) {
            url = url + '&employeeNo=' + filter.employeeNo;
        }
        if (filter.customerName) {
            url = url + '&customerName=' + filter.customerName;
        }
        if (filter.select.startOrderDate) {
            var startOrderDate = new Date(filter.select.startOrderDate);
            startOrderDate = moment(startOrderDate).format('YYYY-MM-DD 00:00:00');
            url = url + '&orderDateBegin=' + startOrderDate;
        }
        if (filter.select.endOrderDate) {
            var endOrderDate = new Date(filter.select.endOrderDate);
            endOrderDate = moment(endOrderDate).format('YYYY-MM-DD 23:59:59');
            url = url + '&orderDateEnd=' + endOrderDate;
        }

        //console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getReturnOrderMasterCount = function (confirm, status, transferPsoFlag, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;

        var url = '/orders/count?'
            + '&returnOrderDetailConfirm=' + confirm
            + '&returnOrderDetailStatus=' + status
            + '&returnOrderDetailTransferPsoFlag=' + transferPsoFlag
            + '&onlyReturn=1';

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    ////审核
    //this.confirm = function (uuids) {
    //    return $http.patch(Constant.BACKEND_BASE + '/orders/' + uuids, {'modifyOnly': '1', 'confirm': '2'});
    //};
    //
    ////抛转
    //this.transfer = function (uuids) {
    //    return $http.patch(Constant.BACKEND_BASE + '/orders/' + uuids, {
    //        'modifyOnly': '1',
    //        'transferPsoFlag': '2'
    //    });
    //};
    //
    //this.modify = function (uuid, orderChangeUpdateInput) {
    //    return $http.patch(Constant.BACKEND_BASE + '/orders/' + uuid, orderChangeUpdateInput);
    //};
});


angular.module('IOne-Production').service('PsoOrderReturnDetail', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/returnOrders');
    };

    //this.modify = function (masterUuid, uuid, orderChangeDetailUpdateInput) {
    //    return $http.patch(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/returnOrders/' + uuid, orderChangeDetailUpdateInput);
    //};

    this.confirm = function (masterUuid, uuids, val) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/returnOrders/' + uuids, {
            'modifyOnly': '1',
            'confirm': val
        });
    };

    this.transfer = function (masterUuid, uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/returnOrders/' + uuids, {
            'modifyOnly': '1',
            'transferReturnFlag': '1'
        });
    };
});

angular.module('IOne-Production').service('PsoOrderReturnExtendDetail', function ($http, Constant) {
    this.get = function (masterUuid, returnDetailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/returnOrders/' + returnDetailUuid + "/extends");
    };
});

angular.module('IOne-Production').service('PsoOrderReturnExtendDetail2', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/returnOrdersExtends');
    };

    this.confirm = function (masterUuid, returnExtendDetailUuids, val) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/returnOrdersExtends?action=confirm', {
            'uuids': returnExtendDetailUuids,
            'modifyOnly': '1',
            'confirm': val
        });
    };

    this.transfer = function (masterUuid, returnExtendDetailUuids) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/returnOrdersExtends?action=transfer', {
            'uuids': returnExtendDetailUuids,
            'modifyOnly': '1',
            'transferReturnFlag': '1'
        });
    };
});