/**
 * Created by xavier on 2016/9/5.
 */

angular.module('IOne-Production').service('ErpAdapterService', function ($http, $rootScope, $cookieStore) {

    var adapterUrl = $rootScope.globals.adapterInfo.adapterServerUrl;

    this.transferErpAdapter = function (path, transferObj, serviceScope, callBack) {
        transferObj.MODI_USER_UUID = $rootScope.globals.adapterInfo.modiUserUuid; //FIXME 待調整
        transferObj.CREATE_USER_UUID = $rootScope.globals.adapterInfo.createUserUuid; //FIXME 待調整

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