angular.module('IOne-Production').service('EPSInterfaceConfigService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/interfaceConfigs?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }
        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/interfaceConfigs/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/interfaceConfigs/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/interfaceConfigs/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/interfaceConfigs/', AddInput);
    };
});

angular.module('IOne-Production').service('EPSWxConfigService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/weiXinConfigs?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }
        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/weiXinConfigs/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/weiXinConfigs/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        UpdateInput.newdate=moment(UpdateInput.newdate).format('YYYY-MM-DD hh:mm:ss');
        return $http.patch(Constant.BACKEND_BASE + '/weiXinConfigs/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        AddInput.newdate=moment(AddInput.newdate).format('YYYY-MM-DD hh:mm:ss');
        return $http.post(Constant.BACKEND_BASE + '/weiXinConfigs/', AddInput);
    };
});

