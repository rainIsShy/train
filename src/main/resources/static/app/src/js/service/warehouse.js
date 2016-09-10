angular.module('IOne-Production').service('Warehouse', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.select.confirm == 0 ? '' : filter.select.confirm;
        var status = filter.select.status == 0 ? '' : filter.select.status;
        var url = 'warehouses?size=' + sizePerPage
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
        if (filter.keyWord != null) {
            url = url + '&keyWord=' + filter.keyWord;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.modify = function (uuid, warehouseUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/warehouses/' + uuid, warehouseUpdateInput);
    };

    this.add = function (warehouseInput) {
        return $http.post(Constant.BACKEND_BASE + '/warehouses/', warehouseInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/warehouses/' + uuid);
    };
});