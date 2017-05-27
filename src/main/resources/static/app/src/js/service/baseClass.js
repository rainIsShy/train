angular.module('IOne-Production').service('BaseClassService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, no, name, keyword, sortField, resUuid) {


        var url = '/baseClasses?size=' + sizePerPage
            + '&page=' + page;

        if (no !== undefined && no !== null) {
            url = url + '&no=' + no;
        }

        if (name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }

        if (keyword !== undefined && keyword !== null && keyword !== '') {
            url = url + '&keyword=' + keyword;
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
        return $http.get(Constant.BACKEND_BASE + '/baseClasses/' + uuid);
    };


    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/baseClasses/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/baseClasses/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/baseClasses/', AddInput);
    };

    this.checkDelete = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/baseClasses/' + uuid + '?action=checkDelete');
    };


});