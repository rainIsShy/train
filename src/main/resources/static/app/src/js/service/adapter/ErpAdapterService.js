/**
 * Created by xavier on 2016/9/5..
 */
angular.module('IOne-Production').service('ErpAdapterService', function ($http, $rootScope, $cookieStore) {

    var adapterUrl = $rootScope.globals.adapterInfo.tiptopAdapterServerUrl;

    this.transferErpAdapter = function (path, transferObj, serviceScope, successCallBack, errorCallBack) {

        $http.post(adapterUrl + '/adapter/tasks' + path, transferObj).success(function (response, status) {
            if (status == 201) {
                successCallBack(response);
            } else {
                serviceScope.showError('抛转失败！');
            }
        }).error(function (response, status) {
            if (response == null) {
                serviceScope.showError("[" + (status + '') + "]Connect Server Fail");
            } else {
                serviceScope.showError("[" + (status + '') + "]" + response.message);
            }
            if (angular.isDefined(errorCallBack)) {
                errorCallBack();
            }
        });
    };
});