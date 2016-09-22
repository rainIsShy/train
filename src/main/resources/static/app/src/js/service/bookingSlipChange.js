angular.module('IOne-Production').service('SalesOrderChangeMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.select.confirm == 0 ? '' : filter.select.confirm;
        var status = filter.select.status == 0 ? '' : filter.select.status;
        var transferPsoFlag = filter.select.transferPsoFlag == 0 ? '' : filter.select.transferPsoFlag;

        var url = '/salesOrderChanges?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&transferFlag=' + transferPsoFlag;

        if (filter.no != null) {
            url = url + '&no=' + filter.no;
        }

        if (filter.psoOrderMstNo != null) {
            url = url + '&psoOrderMstNo=' + filter.psoOrderMstNo;
        }

        if (filter.customerName != null) {
            url = url + '&customerName=' + filter.customerName;
        }

        if (filter.onlyLatest != null) {
            url = url + '&onlyLatest=' + filter.onlyLatest;
        }

        if (filter.startOrderDate != null) {
            var startOrderDate = new Date(filter.select.startOrderDate);
            startOrderDate = moment(startOrderDate).format('YYYY-MM-DD 00:00:00');
            url = url + '&orderDateBegin=' + startOrderDate;
        }

        if (filter.endOrderDate != null) {
            var endOrderDate = new Date(filter.select.endOrderDate);
            endOrderDate = moment(endOrderDate).format('YYYY-MM-DD 23:59:59');
            url = url + '&orderDateEnd=' + endOrderDate;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrderChanges/' + uuid);
    };

    this.modify = function (uuid, OrderMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrderChanges/' + uuid, OrderMasterUpdateInput);
    };

    this.add = function (OrderMasterInput) {
        return $http.post(Constant.BACKEND_BASE + '/salesOrderChanges/', OrderMasterInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/salesOrderChanges/' + uuid);
    };

    //审核
    this.confirm = function (uuids, confirmVal) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrderChanges/' + uuids, {'modifyOnly': '1', 'confirm': confirmVal});
    };

    //抛转
    this.transfer = function (arrayUuids) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrderChanges?action=sync', arrayUuids.join(','));
    };

    this.getOrderMasterCount = function (confirm, status, transferFlag, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferFlag = transferFlag == 0 ? '' : transferFlag;
        var url = '/salesOrderChanges/count?confirm=' + confirm
            + '&status=' + status
            + '&transferFlag=' + transferFlag
            + '&onlyLatest=2'
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('SalesOrderChangeDetail', function ($http, Constant) {
    this.get = function (salesOrderChangeMasterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details');
    };


    this.modify = function (salesOrderChangeMasterUuid, uuid, salesOrderChangeDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details/' + uuid, salesOrderChangeDetailUpdateInput);
    };

    //this.getAllCountByMasterUuids = function(orderMasterUuids) {
    //    var url = '/salesOrders/'+orderMasterUuids + '/count/';
    //    return $http.get(Constant.BACKEND_BASE + url );
    //};

    this.add = function (salesOrderChangeMasterUuid, salesOrderChangeDetailInput) {
        return $http.post(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details/', salesOrderChangeDetailInput);
    };

    this.delete = function (salesOrderChangeMasterUuid, salesOrderChangeDetailsUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details/' + salesOrderChangeDetailsUuid);
    }
});


angular.module('IOne-Production').service('SalesOrderChangeExtendDetail', function ($http, Constant) {
    this.get = function (salesOrderChangeMasterUuid, salesOrderChangeDetailsUuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details/' + salesOrderChangeDetailsUuid + '/extends');
    };

    this.modify = function (salesOrderChangeMasterUuid, salesOrderChangeDetailsUuid, uuid, salesOrderChangeExtendDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details/' + salesOrderChangeDetailsUuid + '/extends/' + uuid, salesOrderChangeExtendDetailUpdateInput);
    };

});

angular.module('IOne-Production').service('SalesOrderChangeExtendDetail2', function ($http, Constant) {
    this.get = function (salesOrderChangeMasterUuid, salesOrderChangeDetailsUuid, salesOrderChangeExtendDetailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details/' + salesOrderChangeDetailsUuid + '/extends/' + salesOrderChangeExtendDetailUuid + '/extend2s/');
    };

    this.modify = function (salesOrderChangeMasterUuid, salesOrderChangeDetailsUuid, salesOrderChangeExtendDetailUuid, uuid, salesOrderChangeExtendDetail2UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details/' + salesOrderChangeDetailsUuid + '/extends/' + salesOrderChangeExtendDetailUuid + '/extend2s/' + uuid, salesOrderChangeExtendDetail2UpdateInput);
    };

    this.add = function (salesOrderChangeMasterUuid, salesOrderChangeDetailsUuid, salesOrderChangeExtendDetailUuid, salesOrderChangeExtendDetail2Input) {
        return $http.post(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details/' + salesOrderChangeDetailsUuid + '/extends/' + salesOrderChangeExtendDetailUuid + '/extend2s/', salesOrderChangeExtendDetail2Input);
    };

    this.delete = function (salesOrderChangeMasterUuid, salesOrderChangeDetailsUuid, salesOrderChangeExtendDetailUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/salesOrderChanges/' + salesOrderChangeMasterUuid + '/details/' + salesOrderChangeDetailsUuid + '/extends/' + salesOrderChangeExtendDetailUuid + '/extend2s/' + uuid);
    }
});