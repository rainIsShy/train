angular.module('IOne-Production').service('WalkThroughMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.select.confirm == 0 ? '' : filter.select.confirm;
        var confStatus = filter.select.confStatus == 0 ? '' : filter.select.confStatus;
        var transferFlag = filter.select.transferFlag == 0 ? '' : filter.select.transferFlag;
        var orderType = filter.select.orderType == 0 ? '' : filter.select.orderType;

        var url = '/walkThroughs?size=' + sizePerPage
            + '&page=' + page;

        if (confirm !== '') {
            url = url + '&confirm=' + confirm;
        }
        if (confStatus !== '') {
            url = url + '&confStatus=' + confStatus;
        }
        if (transferFlag !== '') {
            url = url + '&transferFlag=' + transferFlag;
        }
        if (orderType !== '') {
            url = url + '&orderType=' + orderType;
        }
        if (filter.select.startWalkThroughDate != null) {
            var startWalkThroughDate = new Date(filter.select.startWalkThroughDate);
            startWalkThroughDate = moment(startWalkThroughDate).format('YYYY-MM-DD 00:00:00');
            url = url + '&startWalkThroughDate=' + startWalkThroughDate;
        }
        if (filter.select.endWalkThroughDate !== null && filter.select.endWalkThroughDate !== undefined) {
            var endWalkThroughDate = new Date(filter.select.endWalkThroughDate);
            endWalkThroughDate = moment(endWalkThroughDate).format('YYYY-MM-DD 23:59:59');
            url = url + '&endWalkThroughDate=' + endWalkThroughDate;
        }
        if (filter.buyerNick !== null && filter.buyerNick !== undefined) {
            url = url + '&buyerNick=' + filter.buyerNick;
        }
        if (filter.epsOrderNo !== null && filter.epsOrderNo !== undefined) {
            url = url + '&epsOrderNo=' + filter.epsOrderNo;
        }
        if (filter.select.channelName != null) {
            url = url + '&ocmBaseChanName=' + filter.select.channelName;
        }

        console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    //审核
    this.confirm = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/walkThroughs/' + uuids, {'action': '2', 'confirm': '2'});
    };

    this.modify = function (uuid, updateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/walkThroughs/' + uuid, updateInput);
    };

    this.syc = function () {
        return $http.post(Constant.BACKEND_BASE + '/walkThroughs?fromERP=true');
    };

    // 抛转
    this.transfer = function (uuids) {
        return $http.post(Constant.BACKEND_BASE + '/walkThroughs?toERP=true', {
            'walkThroughMasterUuids': uuids.split(','),
            'confirm': '2'
        });
    };
});


angular.module('IOne-Production').service('WalkThroughDetail', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/details');
    };

    this.modify = function (masterUuid, detailUuid, updateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + "/details/" + detailUuid, updateInput);
    };
});

angular.module('IOne-Production').service('WalkThroughLogistic', function ($http, Constant) {
    this.getAll = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/logistics');
    };
    this.get = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/logistics/' + detailUuid);
    };
    this.modify = function (masterUuid, detailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/logistics/' + detailUpdateInput.uuid, detailUpdateInput);
    };
    this.add = function (masterUuid, detailInput) {
        return $http.post(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/logistics', detailInput);
    };
    this.delete = function (masterUuid, detailUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/logistics/' + detailUuid);
    };
});

angular.module('IOne-Production').service('WalkThroughInstallation', function ($http, Constant) {
    this.getAll = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/installations');
    };
    this.get = function (masterUuid, detailUuid) {
        return $http.get(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/installations/' + detailUuid);
    };
    this.modify = function (masterUuid, detailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/installations/' + detailUpdateInput.uuid, detailUpdateInput);
    };
    this.add = function (masterUuid, detailInput) {
        return $http.post(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/installations', detailInput);
    };
    this.delete = function (masterUuid, detailUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/walkThroughs/' + masterUuid + '/installations/' + detailUuid);
    };
});