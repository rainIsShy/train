angular.module('IOne-Production').service('EpsOrderChangeMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.select.confirm == 0 ? '' : filter.select.confirm;
        var transferPsoFlag = filter.select.transferPsoFlag == 0 ? '' : filter.select.transferPsoFlag;
        var status = filter.select.status == 0 ? '' : filter.select.status;
        //默认参数有confirm taobaoStatus
        var url = 'epsOrderChanges?size=' + sizePerPage
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
        if (filter.no != null) {
            url = url + '&no=' + filter.no;
        }
        if (filter.select.startOrderDate != null) {
            var startOrderDate = new Date(filter.select.startOrderDate);
            startOrderDate = moment(startOrderDate).format('YYYY-MM-DD 00:00:00');
            url = url + '&startOrderDate=' + startOrderDate;
        }
        if (filter.select.endOrderDate != null) {
            var endOrderDate = new Date(filter.select.endOrderDate);
            endOrderDate = moment(endOrderDate).format('YYYY-MM-DD 23:59:59');
            url = url + '&endOrderDate=' + endOrderDate;
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
        return $http.patch(Constant.BACKEND_BASE + '/epsOrderChanges/' + uuids + '?toConfirm=true', {});
    };

    //取消审核
    this.cancelConfirm = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrderChanges/' + uuids + '?toCancelConfirm=true', {});
    };

    this.transfer = function (uuid) {
        return $http.post(Constant.BACKEND_BASE + '/epsOrderChanges/' + uuid + '?toERP=true', {});
    };

    this.modify = function (uuid, orderChangeUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrderChanges/' + uuid, orderChangeUpdateInput);
    };

    this.add = function (orderUuid, OrderChangeInput) {
        return $http.post(Constant.BACKEND_BASE + '/epsOrderChanges?epsOrderUuid=' + orderUuid, OrderChangeInput);
    };
});


angular.module('IOne-Production').service('EpsOrderChangeDetail', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/epsOrderChanges/' + masterUuid + '/details');
    };

    this.modify = function (masterUuid, uuid, orderChangeDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrderChanges/' + masterUuid + '/details/' + uuid, orderChangeDetailUpdateInput);
    };

    this.close = function (masterUuid, uuid) {
        return $http.patch(Constant.BACKEND_BASE + '/epsOrderChanges/' + masterUuid + '/details/' + uuid + '?toClose=true', {});
    };
});

angular.module('IOne-Production').service('EpsOrderChangeExtendDetail', function ($http, Constant) {
    this.get = function (detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/espOrderChangeDetails/' + detailUuid + '/extendDetails');
    };
});

angular.module('IOne-Production').service('EpsOrderChangeChannelService', function ($http, Constant) {
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