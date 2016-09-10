angular.module('IOne-Production').service('SalesOrderMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, transferPsoFlag, orderMasterNo, psoOrderMstNo, customerName, employeeName, orderDateBegin, orderDateEnd, resUuid, channelUuid, allNames, onlyReceipt, contractNo) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;

        var url = '/salesOrders?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&transferPsoFlag=' + transferPsoFlag;

        if (orderMasterNo !== null && orderMasterNo != undefined) {
            url = url + '&no=' + orderMasterNo;
        }

        if (psoOrderMstNo !== null && psoOrderMstNo != undefined) {
            url = url + '&psoOrderMstNo=' + psoOrderMstNo;
        }

        if (customerName !== null) {
            url = url + '&customerName=' + customerName;
        }

        if (employeeName !== null) {
            url = url + '&employeeName=' + employeeName;
        }

        if (orderDateBegin !== null) {
            url = url + '&orderDateBegin=' + orderDateBegin;
        }

        if (orderDateEnd !== null) {
            url = url + '&orderDateEnd=' + orderDateEnd;
        }

        if (allNames !== null && allNames !== undefined) {
            url = url + '&allNames=' + allNames;
        }

        if (channelUuid != null && channelUuid != undefined) {
            url = url + '&channelUuid=' + channelUuid;
        }

        if (onlyReceipt != null && onlyReceipt != undefined) {
            url = url + '&onlyReceipt=' + onlyReceipt;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        if (contractNo !== undefined && contractNo !== null) {
            url = url + '&contractNo=' + contractNo;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getOrderMasterCount = function (confirm, status, transferPsoFlag, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;


        var url = '/salesOrders/count?confirm=' + confirm
            + '&status=' + status
            + '&transferPsoFlag=' + transferPsoFlag;

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrders/' + uuid);
    };

    this.modify = function (OrderMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + OrderMasterUpdateInput.uuid, OrderMasterUpdateInput);
    };

    this.add = function (OrderMasterInput) {
        return $http.post(Constant.BACKEND_BASE + '/salesOrders/', OrderMasterInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/salesOrders/' + uuid);
    };

});

angular.module('IOne-Production').service('SalesOrderDetail', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details');
    };


    this.modify = function (masterUuid, uuid, OrderDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details/' + uuid, OrderDetailUpdateInput);
    };

    this.getAllCountByMasterUuids = function (orderMasterUuids) {
        var url = 'salesOrders/' + orderMasterUuids + '/count/';
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.add = function (masterUuid, OrderDetailInput) {
        return $http.post(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details/', OrderDetailInput);
    };

    this.delete = function (masterUuid, detailUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details/' + detailUuid);
    }
});


angular.module('IOne-Production').service('SalesOrderExtendDetail', function ($http, Constant) {
    this.get = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details/' + detailUuid + '/extends/');
    };

    this.modify = function (masterUuid, detailUuid, uuid, OrderExtendDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details/' + detailUuid + '/extends/' + uuid, OrderExtendDetailUpdateInput);
    };

});

angular.module('IOne-Production').service('SalesOrderExtendDetail2', function ($http, Constant) {
    this.get = function (masterUuid, detailUuid, orderExtendDetailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details/' + detailUuid + '/extends/' + orderExtendDetailUuid + '/extend2s/');
    };

    this.modify = function (masterUuid, detailUuid, orderExtendDetailUuid, uuid, OrderExtendDetail2UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details/' + detailUuid + '/extends/' + orderExtendDetailUuid + '/extend2s/' + uuid, OrderExtendDetail2UpdateInput);
    };

    this.add = function (masterUuid, detailUuid, orderExtendDetailUuid, OrderExtendDetail2Input) {
        return $http.post(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details/' + detailUuid + '/extends/' + orderExtendDetailUuid + '/extend2s/', OrderExtendDetail2Input);
    };

    this.delete = function (masterUuid, detailUuid, orderExtendDetailUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/salesOrders/' + masterUuid + '/details/' + detailUuid + '/extends/' + orderExtendDetailUuid + '/extend2s/' + uuid);
    }
});

angular.module('IOne-Production').service('OrderCustomers', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, name) {
        var url = '/customers?size=' + sizePerPage + '&page=' + page;
        if (name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('OrderItems', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, channelUuid, no, name) {
        var url = '/channelPrices/' + channelUuid + '/items?size=' + sizePerPage + '&page=' + page;
        if (no !== undefined && no !== null) {
            url = url + '&no=' + no;
        }

        if (name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('OrderChannelCurrency', function ($http, Constant) {
    this.getAll = function () {
        return $http.get(Constant.BACKEND_BASE + '/channelCurrencies/');
    };
});


angular.module('IOne-Production').service('OrderChannelTax', function ($http, Constant) {
    this.getAll = function () {
        return $http.get(Constant.BACKEND_BASE + '/channelTaxes/');
    };
});

angular.module('IOne-Production').service('PSOdeliverWays', function ($http, Constant) {
    this.getAll = function () {
        return $http.get(Constant.BACKEND_BASE + '/deliverWays/');
    };
});