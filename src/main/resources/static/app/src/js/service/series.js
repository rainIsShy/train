angular.module('IOne-Production').service('SeriesService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, no, name, keyWord, sortField, resUuid) {
        var url = '/series?size=' + sizePerPage
            + '&page=' + page;

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
        return $http.get(Constant.BACKEND_BASE + '/series/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/series/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/series/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/series/', AddInput);
    };
});