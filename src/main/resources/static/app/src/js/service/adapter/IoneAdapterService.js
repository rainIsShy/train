/**
 * Created by xavier on 2016/9/5..
 * Clone from ErpAdapterService.js by ruka on 2016/9/25..
 */
angular.module('IOne-Production').service('ErpAdapterService', function ($http, $rootScope, $cookieStore) {

    var adapterUrl = $rootScope.globals.adapterInfo.adapterServerUrl;

    this.transferIoneAdapter = function (path, transferObj, serviceScope, callBack) {

        $http.post(adapterUrl + '/adapter/tasks' + path, transferObj).success(function (response, status) {
            if (status == 201) {
                callBack(response);
            } else {
                serviceScope.showError('抛转失败！');
            }
        }).error(function (response, status) {
            if (response == null) {
                serviceScope.showError("[" + (status + '') + "]Connect Server Fail");
            } else {
                serviceScope.showError("[" + (status + '') + "]" + response.message);
            }
        });
    };
});