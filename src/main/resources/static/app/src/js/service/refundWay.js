angular.module('IOne-Production').service('RefundWayService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, no, name, keyWord,resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/refundWays?size=' + sizePerPage
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
        console.log(url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/refundWays/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/refundWays/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/refundWays/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/refundWays/', AddInput);
    };
});