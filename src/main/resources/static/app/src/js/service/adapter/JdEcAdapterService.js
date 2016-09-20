/**
 * Created by xavier on 2016/9/5.
 */
angular.module('IOne-Production').service('JdAdapterService', function ($http, $rootScope) {

    var ecAdapterUrl = $rootScope.globals.adapterInfo.ecAdapterServerUrl;

    this.syncByOrderId = function (orderIds) {
        var url = ecAdapterUrl + '/jd/trades?sync=orderId';
        angular.forEach(orderIds, function (orderId) {
            url += '&orderIds=' + orderId;
        });

        return $http.get(url);
    };

    this.syncByDate = function (start, end) {
        var url = ecAdapterUrl + '/jd/trades?'
            + 'start=' + start
            + 'end=' + end;

        return $http.get(url, obj);
    };
});