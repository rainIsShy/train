/**
 * Created by xavier on 2016/9/5.
 */

angular.module('IOne-Production').service('ErpAdapterService', function ($http, $rootScope) {

    this.transferErpAdapter = function (path, transferObj, serviceScope, callBack) {

        var adapterUrl = $rootScope.globals.adapterInfo.adapterServerUrl;
        transferObj.MODI_USER_UUID = $rootScope.globals.adapterInfo.modiUserUuid;
        transferObj.CREATE_USER_UUID = $rootScope.globals.adapterInfo.createUserUuid;

        $http.post(adapterUrl + '/adapter/tasks' + path, transferObj).success(function (response, status) {
            if (status == 201) {
                callBack(response);
            } else {
                serviceScope.showError('抛转失败！');
            }
        }).error(function (response) {
            if (response == null) {
                serviceScope.showError("[" + (status + '') + "]Connect Server Fail");
            } else {
                serviceScope.showError("[" + (status + '') + "]" + response.message);
            }
        });
    };
});