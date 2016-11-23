angular.module('IOne-Production').service('PsoOrderChangeMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter, sort) {
        var confirm = filter.select.confirm == 0 ? '' : filter.select.confirm;
        var transferPsoFlag = filter.select.transferPsoFlag == 0 ? '' : filter.select.transferPsoFlag;
        var status = filter.select.status == 0 ? '' : filter.select.status;
        //默认参数有confirm taobaoStatus
        var url = '/orderChanges?size=' + sizePerPage
            + '&page=' + page + '&onlyLatest=2';

        if (confirm !== '') {
            url = url + '&confirm=' + confirm;
        }
        if (transferPsoFlag !== '') {
            url = url + '&transferPsoFlag=' + transferPsoFlag;
        }
        if (status !== '') {
            url = url + '&status=' + status;
        }
        if (filter.no !== null && filter.no !== undefined) {
            url = url + '&no=' + filter.no;
        }
        if (filter.employeeName !== null && filter.employeeName !== undefined) {
            url = url + '&employeeName=' + filter.employeeName;
        }
        if (filter.employeeNo !== null && filter.employeeNo !== undefined) {
            url = url + '&employeeNo=' + filter.employeeNo;
        }
        if (filter.customerName !== null && filter.customerName !== undefined) {
            url = url + '&customerName=' + filter.customerName;
        }
        if (filter.select.startOrderDate !== null && filter.select.startOrderDate !== undefined) {
            var startOrderDate = new Date(filter.select.startOrderDate);
            startOrderDate = moment(startOrderDate).format('YYYY-MM-DD 00:00:00');
            url = url + '&orderDateBegin=' + startOrderDate;
        }
        if (filter.select.endOrderDate !== null && filter.select.endOrderDate !== undefined) {
            var endOrderDate = new Date(filter.select.endOrderDate);
            endOrderDate = moment(endOrderDate).format('YYYY-MM-DD 23:59:59');
            url = url + '&orderDateEnd=' + endOrderDate;
        }
        if (sort) {
            url += '&sort=' + sort;
        }

        //console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    //审核
    this.confirm = function (uuids, confirmVal) {
        return $http.patch(Constant.BACKEND_BASE + '/orderChanges/' + uuids, {'modifyOnly': '1', 'confirm': confirmVal});
    };

    //抛转
    //this.transfer = function (arrayUuids) {
    //    return $http.patch(Constant.BACKEND_BASE + '/orderChanges?action=sync', arrayUuids.join(','));
    //};

    this.transfer = function (uuid) {
        return $http.patch(Constant.BACKEND_BASE + '/orderChanges/' + uuid, {'modifyOnly': '1', 'transferPsoFlag': '1'});
    };

    this.modify = function (uuid,  orderChangeUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orderChanges/' + uuid, orderChangeUpdateInput);
    };

    this.add = function (orderUuid, OrderChangeInput) {
        return $http.post(Constant.BACKEND_BASE + '/orderChanges?orderUuid=' + orderUuid, OrderChangeInput);
    };

    this.oneOffSync = function(uuid) {
        return $http.patch(Constant.BACKEND_BASE + '/orderChanges/' + uuid + '/sync');
    };

    this.getOrderMasterCount = function (confirm, status, transferPsoFlag, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;
        var url = '/orderChanges/count?confirm=' + confirm
            + '&status=' + status
            + '&transferPsoFlag=' + transferPsoFlag
            + '&onlyLatest=2';
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});


angular.module('IOne-Production').service('PsoOrderChangeDetail', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orderChanges/' + masterUuid + '/details');
    };

    this.modify = function (masterUuid, uuid, orderChangeDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orderChanges/' + masterUuid + '/details/' + uuid, orderChangeDetailUpdateInput);
    };
});

angular.module('IOne-Production').service('PsoOrderChangeExtendDetail', function ($http, Constant) {
    this.get = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orderChanges/' + masterUuid + '/details/' + detailUuid + '/extends');
    };
});

angular.module('IOne-Production').service('PsoOrderChangeExtendDetail2', function ($http, Constant) {
    this.get = function (orderChangeUuid, orderChangeDetailUuid, orderChangeExtendUuid) {
        //return $http.get(Constant.BACKEND_BASE + '/orderChangeExtends/' + extendDetailUuid + '/extend2s');
        return $http.get(Constant.BACKEND_BASE + '/orderChanges/' + orderChangeUuid + '/details/' + orderChangeDetailUuid + '/extends/' + orderChangeExtendUuid + '/extend2s');
    };
});