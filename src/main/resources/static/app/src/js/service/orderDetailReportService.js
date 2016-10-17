angular.module('IOne-Production').service('OrderDetailReportService', function ($http, $filter, Constant) {
    this.getAll = function (page, size, proName, cityName, channelName, itemNo, orderDateStart, orderDateEnd, deliverDateStart, deliverDateEnd, uuid) {
        var url = Constant.BACKEND_BASE + '/orderDetailReport'
            + '?page=' + page + '&size=' + size
            + '&proName=' + proName + '&cityName=' + cityName
            + '&channelName=' + channelName + '&itemNo=' + itemNo;
        if (orderDateStart != null && orderDateStart != '') {
            url += '&orderDateStart=' + $filter('date')(orderDateStart, 'yyyy-MM-dd');
        }
        if (orderDateEnd != null && orderDateEnd != '') {
            url += '&orderDateEnd=' + $filter('date')(orderDateEnd, 'yyyy-MM-dd');
        }
        if (deliverDateStart != null && deliverDateStart != '') {
            url += '&deliverDateStart=' + $filter('date')(deliverDateStart, 'yyyy-MM-dd');
        }
        if (deliverDateEnd != null && deliverDateEnd != '') {
            url += '&deliverDateEnd=' + $filter('date')(deliverDateEnd, 'yyyy-MM-dd');
        }
        if (null != uuid && typeof(uuid) != "undefined" && '' != uuid) {
            url += '&resUuid=' + uuid;
        }
        return $http.get(url);
    };

    this.download = function (page, size, proName, cityName, channelName, itemNo, orderDateStart, orderDateEnd, deliverDateStart, deliverDateEnd, uuid) {
        var url = Constant.BACKEND_BASE + '/orderDetailReport/download'
            + '?page=' + page + '&size=' + size
            + '&proName=' + proName + '&cityName=' + cityName
            + '&channelName=' + channelName + '&itemNo=' + itemNo;
        if (orderDateStart != null && orderDateStart != '') {
            url += '&orderDateStart=' + $filter('date')(orderDateStart, 'yyyy-MM-dd');
        }
        if (orderDateEnd != null && orderDateEnd != '') {
            url += '&orderDateEnd=' + $filter('date')(orderDateEnd, 'yyyy-MM-dd');
        }
        if (deliverDateStart != null && deliverDateStart != '') {
            url += '&deliverDateStart=' + $filter('date')(deliverDateStart, 'yyyy-MM-dd');
        }
        if (deliverDateEnd != null && deliverDateEnd != '') {
            url += '&deliverDateEnd=' + $filter('date')(deliverDateEnd, 'yyyy-MM-dd');
        }
        if (null != uuid && typeof(uuid) != "undefined" && '' != uuid) {
            url += '&resUuid=' + uuid;
        }
        return $http.get(url);
    };

    this.search = function (page, size, keyword, type, scopeData) {
        var url = Constant.BACKEND_BASE + '/orderDetailReport';
        switch (type) {
            case '1':
                url += '/searchPro?page=' + page + '&size=' + size
                    + '&name=' + keyword;
                break;
            case '2':
                url += '/searchCity?page=' + page + '&size=' + size
                    + '&name=' + keyword + '&proName=' + scopeData.proName;
                break;
            case '3':
                url += '/searchChannel?page=' + page + '&size=' + size
                    + '&proName=' + scopeData.proName + '&cityName=' + scopeData.cityName
                    + '&name=' + keyword;
                break;
            case '4':
                url += '/searchItemNo?page=' + page + '&size=' + size
                    + '&no=' + keyword;
                break;
        }
        return $http.get(url);
    }
});
