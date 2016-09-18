/**
 * Created by xavier on 2016/9/5.
 */
angular.module('IOne-Production').service('TaoBaoAdapterService', function ($http, $rootScope) {
    var ecAdapterUrl = $rootScope.globals.adapterInfo.ecAdapterServerUrl;

    this.syncByTids = function (tids) {
        var url = ecAdapterUrl + '/taobao/trades?';
        angular.forEach(tids, function (tid) {
            url += '&tids=' + tid;
        });

        return $http.get(url);
    };

    this.syncByDate = function (startDate, endDate) {
        var url = ecAdapterUrl + '/taobao/trades?sync=byTime';
        var obj = {
            'startTime': startDate,
            'endTime': endDate
        };

        return $http.post(url, obj);
    };

    this.updateProfile = function (updateProfileObj) {
        var url = ecAdapterUrl + '/taobao/updateProfile';
        return $http.post(url, updateProfileObj);
    };
});