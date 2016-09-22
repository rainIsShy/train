angular.module('IOne-Production').service('AliPayService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.confirm == 0 ? '' : filter.confirm;
        var orderStatus = filter.orderStatus == 0 ? '' : filter.orderStatus;
        //默认参数有confirm taobaoStatus
        var url = '/aliPays?size=' + sizePerPage
            + '&page=' + page;

        if (confirm !== '') {
            url = url + '&confirm=' + confirm;
        }
        if (orderStatus !== '') {
            url = url + '&orderStatus=' + orderStatus;
        }
        if (filter.tid != null) {
            url = url + '&tid=' + filter.tid;
        }
        if (filter.startModifiedTime != null) {
            var startModifiedTime = new Date(filter.startModifiedTime);
            startModifiedTime = moment(startModifiedTime).format('YYYY-MM-DD 00:00:00');
            url = url + '&startModifiedTime=' + startModifiedTime;
        }
        if (filter.endModifiedTime != null) {
            var endModifiedTime = new Date(filter.endModifiedTime);
            endModifiedTime = moment(endModifiedTime).format('YYYY-MM-DD 23:59:59');
            url = url + '&endModifiedTime=' + endModifiedTime;
        }

        console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    //审核（抛转）
    this.confirm = function (uuids) {
        return $http.post(Constant.BACKEND_BASE + '/aliPays/' + uuids + '?confirm=true', {});
    };

    //取消审核（取消抛转）
    this.cancelConfirm = function (uuids) {
        return $http.post(Constant.BACKEND_BASE + '/aliPays/' + uuids + '?cancelConfirm=true', {});
    };
});