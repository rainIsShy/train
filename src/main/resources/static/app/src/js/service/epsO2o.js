angular.module('IOne-Production').service('EpsO2oOrderMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.select.confirm == 0 ? '' : filter.select.confirm;
        var transferPsoFlag = filter.select.transferPsoFlag == 0 ? '' : filter.select.transferPsoFlag;
        var status = filter.select.status == 0 ? '' : filter.select.status;
        var orderFlag = filter.select.orderFlag == 0 ? '' : filter.select.orderFlag;
        //默认参数有confirm taobaoStatus
        var url = '/epsOrders?size=' + sizePerPage
            + '&page=' + page + '&onlyO2o=1';

        if (confirm !== '') {
            url = url + '&confirm=' + confirm;
        }
        if (transferPsoFlag !== '') {
            url = url + '&transferPsoFlag=' + transferPsoFlag;
        }
        if (status !== '') {
            url = url + '&status=' + status;
        }
        if (orderFlag !== '') {
            url = url + '&orderFlag=' + orderFlag;
        }
        if (filter.no != null) {
            url = url + '&no=' + filter.no;
        }
        if (filter.select.startO2oDate != null) {
            var startO2oDate = new Date(filter.select.startO2oDate);
            startO2oDate = moment(startO2oDate).format('YYYY-MM-DD 00:00:00');
            url = url + '&o2oDateBegin=' + startO2oDate;
        }
        if (filter.select.endO2oDate != null) {
            var endO2oDate = new Date(filter.select.endO2oDate);
            endO2oDate = moment(endO2oDate).format('YYYY-MM-DD 23:59:59');
            url = url + '&o2oDateEnd=' + endO2oDate;
        }
        if (filter.channelName != null) {
            url = url + '&channelName=' + filter.channelName;
        }
        if (filter.buyerNick != null) {
            url = url + '&buyerNick=' + filter.buyerNick;
        }

        //console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    //审核
    this.confirm = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + uuids + '?toConfirm=true', {});
    };

    //取消审核
    this.cancelConfirm = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + uuids + '?toCancelConfirm=true', {});
    };

    this.transfer = function (uuid) {
        return $http.post(Constant.BACKEND_BASE + '/epsOrders/' + uuid + '?toERP=true', {});
    };

    this.modify = function (uuid, orderChangeUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + uuid, orderChangeUpdateInput);
    };

    this.add = function (orderUuid, OrderChangeInput) {
        return $http.post(Constant.BACKEND_BASE + '/epsOrders?epsOrderUuid=' + orderUuid, OrderChangeInput);
    };

    //同意配送
    this.agreeDeliver = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + uuids, {'o2oFlag': '3', 'orderFlag': '5'});
    };

    //拒绝配送
    this.rejectDeliver = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + uuids, {'o2oFlag': '4', 'orderFlag': '4'});
    };
});


angular.module('IOne-Production').service('EpsO2oOrderDetail', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details');
    };

    this.modify = function (masterUuid, uuid, orderChangeDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + uuid, orderChangeDetailUpdateInput);
    };

    this.close = function (masterUuid, uuid) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + uuid + '?toClose=true', {});
    };
});

angular.module('IOne-Production').service('EpsO2oOrderExtendDetail', function ($http, Constant) {
    this.getAll = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/epsOrders/' + masterUuid + '/details/' + detailUuid + '/extends');
    };
});

angular.module('IOne-Production').service('EpsO2oOrderChannelService', function ($http, Constant) {
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