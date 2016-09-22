angular.module('IOne-Production').service('EcommerceOrdersMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, orderFlag, confirm, status, transferPsoFlag, buyerNick, orderMasterNo, orderDateBegin, orderDateEnd, o2oChannelName, resUuid) {
        orderFlag = orderFlag == 0 ? '' : orderFlag;
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferPsoFlag = transferPsoFlag == 0 ? '' : transferPsoFlag;

        var url = '/epsOrders?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&transferPsoFlag=' + transferPsoFlag;

        if (orderFlag != null) {
            url = url + '&orderFlag=' + orderFlag;
        }

        if (buyerNick != null) {
            url = url + '&buyerNick=' + buyerNick;
        }

        if (orderMasterNo != null) {
            url = url + '&no=' + orderMasterNo;
        }

        if (orderDateBegin != null) {
            url = url + '&orderDateBegin=' + orderDateBegin;
        }

        if (orderDateEnd != null) {
            url = url + '&orderDateEnd=' + orderDateEnd;
        }

        if (o2oChannelName != null) {
            url = url + '&o2oChannelName=' + o2oChannelName;
        }

        if (resUuid != null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/epsOrders/' + uuid);
    };

    this.add = function (order) {
        return $http.post(Constant.BACKEND_BASE + '/epsOrders/', order);
    };

    this.modify = function (OrderMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + OrderMasterUpdateInput.uuid, OrderMasterUpdateInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/epsOrders/' + uuid);
    };

    this.print = function (type, uuid) {
        return $http.get(Constant.BACKEND_BASE + '/reports', {
            params: {type: type, params: uuid}
        });
    };

    //新增时初始化所有栏位
    this.createDefault = function () {
        orderDate = new Date();
        predictDeliverDate = new Date(orderDate.valueOf() + 2 * 24 * 60 * 60 * 1000);
        order = {
            "no": "",
            "userId": "",
            "buyerNick": "",
            "receiveName": "",
            "receivePhone": "",
            "receiveAddress": "",
            "receiveDistrict": "",
            "remark": "",
            "orderFlag": "4",
            "orderAmount": "",
            "assembleAmount": "",
            "orderDate": orderDate,
            'predictDeliverDate': predictDeliverDate,
            "channel": "",
            "details": "",
            "deliverWay": ""
        };
        return order;
    };

});

angular.module('IOne-Production').service('EcommerceOrderDetail', function ($http, Constant) {
    this.getAll = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details');
    };
    this.get = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + detailUuid);
    };
    this.modify = function (masterUuid, orderDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + orderDetailUpdateInput.uuid, orderDetailUpdateInput);
    };
    this.add = function (masterUuid, detailInput) {
        return $http.post(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details', detailInput);
    };
    this.delete = function (masterUuid, detailUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + detailUuid);
    };
});

angular.module('IOne-Production').service('EcommerceOrderDetailExtend', function ($http, Constant) {
    this.getAll = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + detailUuid + '/extends');
    };

    this.modify = function (masterUuid, detailUuid, uuid, extendUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + detailUuid + '/extends/' + uuid, extendUpdateInput);
    };

    this.delete = function (masterUuid, detailUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + detailUuid + '/extends/' + uuid);
    };

    this.add = function (masterUuid, detailUuid, extendUpdateInput) {
        return $http.post(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + detailUuid + '/extends', extendUpdateInput);
    };


});


angular.module('IOne-Production').service('EtaobaoCustomers', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, clientName) {
        var url = '/taobaoCustomers?size=' + sizePerPage + '&page=' + page;
        if (clientName !== undefined && clientName !== null) {
            url = url + '&name=' + clientName;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('EmallService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, mallName) {
        var url = '/malls?size=' + sizePerPage + '&page=' + page;
        if (mallName !== undefined && mallName !== null) {
            url = url + '&name=' + mallName;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('EdelivWayService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, delivWayName, delivWayNo) {
        var url = '/deliverWays?size=' + sizePerPage + '&page=' + page;
        if (delivWayName !== undefined && delivWayName !== null) {
            url = url + '&name=' + delivWayName;
        }
        if (delivWayNo !== undefined && delivWayNo !== null) {
            url = url + '&no=' + delivWayNo;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('EgroupUserService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, no) {
        var url = '/groupUsers?size=' + sizePerPage + '&page=' + page;
        if (no !== undefined && no !== null) {
            url = url + '&no=' + no;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('EchannelService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, channelName, channelFlag, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channels?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;
        if (channelName !== undefined && channelName !== null) {
            url = url + '&name=' + channelName;
        }
        if (channelFlag !== undefined && channelFlag !== null) {
            url = url + '&channelFlag=' + channelFlag;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('EareaService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, name, grade, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/areas?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;
        if (name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }
        if (grade !== undefined && grade !== null) {
            url = url + '&grade=' + grade;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    //add by xavier on 20160608
    this.getAllForEcommerceOrders = function (sizePerPage, page, confirm, status, name, grade, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/areas?type=ecommerceOrder&size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;
        if (name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }
        if (grade !== undefined && grade !== null) {
            url = url + '&grade=' + grade;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});




