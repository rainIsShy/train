angular.module('IOne-Production').service('TagClassificationService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyWord, sortField, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/tagClassifications?size=' + sizePerPage
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

    this.getAll = function () {
        return $http.get(Constant.BACKEND_BASE + "/tagClassifications");
    };;;;;

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/tagClassifications/' + uuid);
    };

    this.getByNo = function (no) {
        return $http.get(Constant.BACKEND_BASE + '/tagClassifications?no=' + no);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/tagClassifications/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/tagClassifications/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/tagClassifications/', AddInput);
    };
});