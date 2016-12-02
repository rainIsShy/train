angular.module('IOne-Production').service('OrderMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, transferPsoFlag, orderMasterNo, customerName, employeeName, orderDateBegin, orderDateEnd, resUuid, channelUuid, orderAmount, paidAmount, unpaidAmount, paidType, paidType2, contractNo) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;

        var url = '/orders?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&transferPsoFlag=' + transferPsoFlag;

        if (orderMasterNo != null) {
            url = url + '&orderMasterNo=' + orderMasterNo;
        }

        if (customerName != null) {
            url = url + '&customerName=' + customerName;
        }

        if (employeeName != null) {
            url = url + '&employeeName=' + employeeName;
        }

        if (orderDateBegin != null) {
            url = url + '&orderDateBegin=' + orderDateBegin;
        }

        if (orderDateEnd != null) {
            url = url + '&orderDateEnd=' + orderDateEnd;
        }

        if (resUuid != null) {
            url = url + '&resUuid=' + resUuid;
        }

        if (channelUuid != null) {
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

        if (paidType !== undefined && paidType !== null) {
            url = url + '&paidType=' + paidType;
        }

        if (paidType2 !== undefined && paidType2 !== null) {
            url = url + '&paidType2=' + paidType2;
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


        var url = '/orders/count?confirm=' + confirm
            + '&status=' + status
            + '&transferPsoFlag=' + transferPsoFlag;

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/orders/' + uuid);
    };

    this.modify = function (OrderMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + OrderMasterUpdateInput.uuid, OrderMasterUpdateInput);
    };

//only for throw action
    this.modifyBatch = function (OrderMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + OrderMasterUpdateInput.uuid + '/batch/', OrderMasterUpdateInput);
    };

    this.print = function (type, uuid) {
        return $http.get(Constant.BACKEND_BASE + '/reports?action=exportPdf', {
            params: {type: type, params: uuid},
            responseType: 'arraybuffer'
        });
    };

    this.oneOffSync = function (uuid, OrderMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + uuid + '/sync', OrderMasterUpdateInput);
    };

    this.auditTransfer = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/orders?action=auditTransfer', uuids);
    };

    this.validatePossibility = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/orders?action=validatePossibility', uuids);
    };

    this.changeFlag = function (updateData) {
        return $http.patch(Constant.BACKEND_BASE + '/orders?action=changeFlag', updateData);
    }
});

angular.module('IOne-Production').service('OrderDetail', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/details');
    };


    this.modify = function (masterUuid, uuid, OrderDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/details/' + uuid, OrderDetailUpdateInput);
    };

    this.getAllCountByMasterUuids = function (orderMasterUuids) {
        var url = '/orders/' + orderMasterUuids + '/count/';
        return $http.get(Constant.BACKEND_BASE + url);
    };
});


angular.module('IOne-Production').service('OrderExtendDetail', function ($http, Constant) {
    this.get = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/details/' + detailUuid + '/extends/');
    };

    this.modify = function (masterUuid, detailUuid, uuid, OrderExtendDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/details/' + detailUuid + '/extends/' + uuid, OrderExtendDetailUpdateInput);
    };

});

angular.module('IOne-Production').service('OrderExtendDetail2', function ($http, Constant) {
    this.get = function (masterUuid, detailUuid, orderExtendDetailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/details/' + detailUuid + '/extends/' + orderExtendDetailUuid + '/extend2s/');
    };

    this.modify = function (masterUuid, detailUuid, orderExtendDetailUuid, uuid, OrderExtendDetail2UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/details/' + detailUuid + '/extends/' + orderExtendDetailUuid + '/extend2s/' + uuid, OrderExtendDetail2UpdateInput);
    };

    this.add = function (masterUuid, detailUuid, orderExtendDetailUuid, OrderExtendDetail2Input) {
        return $http.post(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/details/' + detailUuid + '/extends/' + orderExtendDetailUuid + '/extend2s/', OrderExtendDetail2Input);
    };

    this.delete = function (masterUuid, detailUuid, orderExtendDetailUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/orders/' + masterUuid + '/details/' + detailUuid + '/extends/' + orderExtendDetailUuid + '/extend2s/' + uuid);
    }
});

angular.module('IOne-Production').service('OrderItemCustomDetail', function ($http, Constant) {
    this.getCustomDetail = function (itemUuid) {
        return $http.get(Constant.BACKEND_BASE + '/items/' + itemUuid + '/customs');
    }
});

//angular.module('IOne-Production').service('ProductionItemCustom', function($http, Constant) {
//    this.get = function(productionUuid) {
//        if(productionUuid == undefined) {
//            productionUuid = '';
//        }
//        return $http.get(Constant.BACKEND_BASE + '/items/' + productionUuid + '/customs?itemUuid=' + productionUuid);
//    };
//
//    this.add = function(productionUuid, itemCustom) {
//        return $http.post(Constant.BACKEND_BASE + '/items/' + productionUuid + '/customs', itemCustom);
//    };
//
//    this.modify = function(productionUuid, itemCustomUuid, itemCustom) {
//        return $http.patch(Constant.BACKEND_BASE + '/items/' + productionUuid + '/customs/' + itemCustomUuid, itemCustom);
//    };
//
//    this.delete = function(productionUuid, itemCustomUuid) {
//        return $http.delete(Constant.BACKEND_BASE + '/items/' + productionUuid + '/customs/' + itemCustomUuid);
//    }
//});

angular.module('IOne-Production').service('OrderCustomScope', function ($http, Constant) {
    this.getAll = function () {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms');
    };

    this.getCustom = function (customUuid) {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms/' + customUuid + '/scopes');
    };

    this.getCustomScope = function (customUuid, scopeUuid) {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms/' + customUuid + '/scopes/' + scopeUuid);
    }

});


angular.module('IOne-Production').service('ReceiptDetail', function ($http, Constant) {

    this.get = function (orderUuid) {
        return $http.get(Constant.BACKEND_BASE + '/orders/' + orderUuid + '/receipts');
    }

});


angular.module('IOne-Production').service('SaleTypes', function ($http, Constant) {
    this.getAll = function () {
        return $http.get(Constant.BACKEND_BASE + '/saleTypes/');
    };
});

angular.module('IOne-Production').service('Parameters', function ($http, Constant) {
    this.getAll = function (channulUuid) {
        var url = "";
        if (channulUuid != null) {
            url = url + '?channelUuid=' + channulUuid;
        }

        return $http.get(Constant.BACKEND_BASE + '/parameters' + url);
    };
});

angular.module('IOne-Production').service('ItemRelationService', function ($http, Constant) {
    this.getAll = function (itemUuid, itemCustomUuid, informationScope) {
        var url = "";
        if (itemUuid != null) {
            url = url + '?itemUuid=' + itemUuid;
        }

        if (itemCustomUuid != null) {
            url = url + '&itemCustomUuid=' + itemCustomUuid;
        }

        if (informationScope != null) {
            url = url + '&informationScope=' + informationScope;
        }
        return $http.get(Constant.BACKEND_BASE + '/itemRelations' + url);
    };
});




