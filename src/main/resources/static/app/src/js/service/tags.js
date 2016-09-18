angular.module('IOne-Production').service('TagService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyWord, sortField, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/tags?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no !== undefined && no !== null) {
            url = url + '&no=' + no;
        }

        if (name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        if (sortField !== undefined && sortField !== null) {
            url = url + '&sort=' + sortField;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/tags/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/tags/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/tags/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/tags/', AddInput);
    };
});