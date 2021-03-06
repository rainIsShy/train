angular.module('IOne-Production').service('PmmOrderMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, transferFlag, pmmOrderNo, salesOrderMasterNo, orderDateBegin, orderDateEnd, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferFlag = transferFlag == 0 ? '' : transferFlag;

        var url = '/pmmOrders?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (pmmOrderNo !== null && pmmOrderNo != undefined) {
            url = url + '&no=' + pmmOrderNo;
        }

        if (salesOrderMasterNo !== null && salesOrderMasterNo != undefined) {
            url = url + '&salesOrderMasterNo=' + salesOrderMasterNo;
        }

        if(orderDateBegin !== null) {
            url = url + '&orderDateBegin=' + orderDateBegin;
        }

        if(orderDateEnd !== null) {
            url = url + '&orderDateEnd=' + orderDateEnd;
        }

        if (transferFlag != 0) {
            url = url + '&transferFlag=' + transferFlag;
        }

        if(resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getOrderMasterCount = function (confirm, status, transferFlag, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferFlag = transferFlag == 0 ? '' : transferFlag;


        var url = '/pmmOrders/count?confirm=' + confirm
            + '&status=' + status
            + '&transferFlag=' + transferFlag;

        if(resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function(uuid) {
        return $http.get(Constant.BACKEND_BASE + '/pmmOrders/' + uuid);
    };

    this.modify = function(OrderMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/pmmOrders/' + OrderMasterUpdateInput.uuid, OrderMasterUpdateInput);
    };

    this.add = function(OrderMasterInput) {
        return $http.post(Constant.BACKEND_BASE + '/pmmOrders/', OrderMasterInput);
    };

    this.delete = function( uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/pmmOrders/' + uuid);
    };

    this.changePurchaseFlag = function (uuid, flag, data) {
        return $http.patch(Constant.BACKEND_BASE + '/pmmOrders/' + uuid + '/purchase/' + flag, data);
    };

    this.purchaseList = function (data) {
        return $http.patch(Constant.BACKEND_BASE + '/pmmOrders/purchaseList/', data);
    }
});

angular.module('IOne-Production').service('PmmOrderDetail', function ($http, Constant) {
    this.get = function(masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/pmmOrders/' + masterUuid + '/details');
    };

    this.modify = function(masterUuid, uuid, OrderDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/pmmOrders/' + masterUuid + '/details/' + uuid, OrderDetailUpdateInput);
    };

    this.getAllCountByMasterUuids = function(orderMasterUuids) {
        var url = '/pmmOrders/' + orderMasterUuids + '/count/';
        console.log(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url );
    };

    this.add = function(masterUuid, OrderDetailInput) {
        return $http.post(Constant.BACKEND_BASE + '/pmmOrders/' + masterUuid + '/details/', OrderDetailInput);
    };

    this.delete = function(masterUuid, detailUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/pmmOrders/' + masterUuid + '/details/' + detailUuid);
    };

    this.changeDtlPurchaseFlag = function (uuid, dtlUuids, flag, data) {
        return $http.patch(Constant.BACKEND_BASE + '/pmmOrders/' + uuid + '/details/' + dtlUuids + '/purchase/' + flag, data);
    };

    this.changeConfirmFlag = function (uuid, dtlUuids, flag) {
        return $http.patch(Constant.BACKEND_BASE + '/pmmOrders/' + uuid + '/details/' + dtlUuids + '/confirm/' + flag);
    };
});


angular.module('IOne-Production').service('PmmOrderExtendDetail', function ($http, Constant) {

    this.get = function (detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/pmmOrderDetails/' + detailUuid + '/extends/');
    };

    this.getAll = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/pmmOrderDetails/_useless/extends/byMstUuid/' + masterUuid);
    };

    this.modify = function (detailUuid, uuid, OrderExtendDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/pmmOrderDetails/' + detailUuid + '/extends/' + uuid, OrderExtendDetailUpdateInput);
    };

});

angular.module('IOne-Production').service('PmmOrderExtendDetail2', function ($http, Constant) {
    this.get = function (orderExtendDetailUuid) {
        console.log(Constant.BACKEND_BASE + '/pmmOrderExtendDetails/' + orderExtendDetailUuid + '/extend2s/');
        return $http.get(Constant.BACKEND_BASE + '/pmmOrderExtendDetails/' + orderExtendDetailUuid + '/extend2s/');
    };

    this.modify = function (orderExtendDetailUuid, uuid, OrderExtendDetail2UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/pmmOrderExtendDetails/' + orderExtendDetailUuid + '/extend2s/' + uuid, OrderExtendDetail2UpdateInput);
    };

    this.add = function (orderExtendDetailUuid, OrderExtendDetail2Input) {
        return $http.post(Constant.BACKEND_BASE + '/pmmOrderExtendDetails/' + orderExtendDetailUuid + '/extend2s/', OrderExtendDetail2Input);
    };

    this.delete = function (orderExtendDetailUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/pmmOrderExtendDetails/' + orderExtendDetailUuid + '/extend2s/' + uuid);
    }
});

angular.module('IOne-Production').service('OrderCustomers', function($http, Constant) {
    this.getAll = function(sizePerPage, page, name) {
        var url = '/customers?size=' + sizePerPage + '&page=' + page;
        if(name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('OrderItems', function($http, Constant) {
    this.getAll = function (sizePerPage, page, channelUuid, no, name, itemGlobalQuery, itemStandard, baseClassUuid) {
        var url = '/channelPrices/' + channelUuid + '/items?size=' + sizePerPage + '&page=' + page;
        if(no !== undefined && no !== null) {
            url = url + '&no=' + no;
        }

        if(name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }

        if (itemGlobalQuery !== undefined && itemGlobalQuery !== null) {
            url = url + '&itemGlobalQuery=' + itemGlobalQuery;
        }

        if (itemStandard !== undefined && itemStandard !== null) {
            url = url + '&itemStandard=' + itemStandard;
        }

        if (baseClassUuid) {
            url = url + '&baseClassUuid=' + baseClassUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getCustomDetail = function (itemUuid, itemCustomUuid) {
        var url = '/items/' + itemUuid + '/customs?size=100&page=0&itemCustomUuid=' + itemCustomUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getCustomScope = function (itemCustomUuid, scopeUuid) {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms/' + itemCustomUuid + '/scopes/' + scopeUuid);
    };

    this.getAllCustomScope = function (sizePerPage, page, itemCustomUuid, no, name) {
        var url = '/itemCustoms/' + itemCustomUuid + '/scopes/?size=' + sizePerPage + '&page=' + page;
        if(no !== undefined && no !== null) {
            url = url + '&no=' + no;
        }

        if(name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('OrderChannelCurrency', function($http, Constant) {
    this.getAll = function() {
        return $http.get(Constant.BACKEND_BASE + '/channelCurrencies/');
    };
});


angular.module('IOne-Production').service('OrderChannelTax', function($http, Constant) {
    this.getAll = function() {
        return $http.get(Constant.BACKEND_BASE + '/channelTaxes/');
    };
});

angular.module('IOne-Production').service('TransferTypesService', function ($http, Constant) {
    this.getAllWithNoPage = function () {
        return $http.get(Constant.BACKEND_BASE + '/transferTypes?status=1');
    };

    this.getAll = function (sizePerPage, page, no, name, keyWord, resUuid) {

        var url = '/transferTypes?size=' + sizePerPage
            + '&page=' + page;

        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }
        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/transferTypes/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/transferTypes/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/transferTypes/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/transferTypes/', AddInput);
    };
});

angular.module('IOne-Production').service('PmmOrderGroupEmployeeClassRService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, employee, baseClass, channelUuid, resUuid) {
        var url = '/groupEmployeeClassRelations?size=' + sizePerPage
            + '&page=' + page + '&channelUuid=' + channelUuid;
        if (employee !== undefined && employee !== null) {
            url = url + '&employee=' + employee;
        }
        if (baseClass !== undefined && baseClass !== null) {
            url = url + '&baseClass=' + baseClass;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

