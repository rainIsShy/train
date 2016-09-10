angular.module('IOne-Production').service('JdAccountService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, theMax, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/jdAccounts?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

//        if(theMax !== undefined && theMax !== null) {
//            url = url + '&name=' + theMax;
//        }
        if (theMax !== undefined && theMax !== null) {
            url = url + '&globalQuery=' + theMax;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/jdAccounts/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/jdAccounts/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/jdAccounts/' + uuid, UpdateInput);
    };

    this.add = function (Input) {
        return $http.post(Constant.BACKEND_BASE + '/jdAccounts/', Input);
    };

    this.importFile = function (fileName) {
        return $http.post(Constant.BACKEND_BASE + '/jdAccounts/' + 'files/' + fileName + '/');
    };
});