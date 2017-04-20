angular.module('IOne-Production').service('EpsOrderQuery', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {

        //默认参数有confirm taobaoStatus
        var url = '/epsOrders?size=' + sizePerPage
            + '&page=' + page + '&transferPsoFlag=1';

        if (filter.shopName !== '' && filter.shopName != undefined && filter.orderFlag != null) {
            url = url + '&shopName=' + filter.shopName;
        }
        if (filter.orderFlag !== '' && filter.orderFlag != undefined && filter.orderFlag != null) {
            url = url + '&orderFlag=' + filter.orderFlag;
        }

        if (filter.orderStartDate != null && filter.orderStartDate != undefined && filter.orderStartDate != "") {
            var orderStartDate = new Date(filter.orderStartDate);
            orderStartDate = moment(orderStartDate).format('yyyy-MM-dd');
            url = url + '&orderStartDate=' + orderStartDate;
        }

        if (filter.orderEndDate != null && filter.orderEndDate != undefined && filter.orderEndDate != "") {
            var orderEndDate = new Date(filter.orderEndDate);
            orderEndDate = moment(orderEndDate).format('yyyy-MM-dd');
            url = url + '&orderEndDate=' + orderEndDate;
        }

        return $http.get(Constant.BACKEND_BASE + url + "&action=isO2o");
    };

});