angular.module('IOne-Production').service('Department', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.confirm == 0 ? '' : filter.confirm;
        var status = filter.status == 0 ? '' : filter.status;
        var url = 'departments?size=' + sizePerPage
            + '&page=' + page;

        if (confirm !== '') {
            url = url + '&confirm=' + confirm;
        }
        if (status !== '') {
            url = url + '&status=' + status;
        }
        if (filter.no != null) {
            url = url + '&no=' + filter.no;
        }
        if (filter.name != null) {
            url = url + '&name=' + filter.name;
        }
        if (filter.searchKeyWord != null) {
            url = url + '&searchKeyWord=' + filter.searchKeyWord;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.modify = function (uuid, departmentUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/departments/' + uuid, departmentUpdateInput);
    };

    this.add = function (departmentInput) {
        return $http.post(Constant.BACKEND_BASE + '/departments/', departmentInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/departments/' + uuid);
    };

    this.getForParent = function (parentUuid) {
        return $http.get(Constant.BACKEND_BASE + '/departments?parentUuid=' + parentUuid);
    };
});