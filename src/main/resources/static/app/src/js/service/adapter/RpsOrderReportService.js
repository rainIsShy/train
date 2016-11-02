angular.module('IOne-Production').service('EpsOrderReportService', function ($http, $rootScope) {
    var adapterUrl = $rootScope.globals.adapterInfo.adapterServerUrl;
    this.getPlmBaseItemFile = function (orderDateFrom, orderDateTo, pageOption) {
        var config = {
            params: {
                ORDER_DATE_FROM: orderDateFrom,
                ORDER_DATE_TO: orderDateTo,
                number: pageOption.currentPage,
                size: pageOption.sizePerPage
            }
        };
        return $http.get(adapterUrl + '/epsOrderReport/plmBaseItemFile', config);
    };
    this.getPlmBaseItemFile_Csvfile = function (orderDateFrom, orderDateTo) {
        var config = {
            params: {
                ORDER_DATE_FROM: orderDateFrom,
                ORDER_DATE_TO: orderDateTo
            }
        };
        return $http.get(adapterUrl + '/epsOrderReport/plmBaseItemFile/csv', config);
    };
});
