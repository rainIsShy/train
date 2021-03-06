angular.module('IOne-Production').service('InventoryDetailService', function ($http, $filter, Constant) {
    this.getAll = function (currentPage,sizePerPage, inventoryDetailQuery) {
        var query = {
            params : angular.merge({},{
                size : sizePerPage,
                page : currentPage,
                resUuid : RES_UUID_MAP.INV.INVENTORY_DETAIL.RES_UUID
            },inventoryDetailQuery)
        };
        return $http.get(Constant.BACKEND_BASE + '/inventoryDetails',query);
    };

    this.getAllProduction = function (sizePerPage, currentPage, itemQuery) {
        var query = {
            params : angular.merge({},{
                size : sizePerPage,
                page : currentPage,
            },itemQuery)
        };
        return $http.get(Constant.BACKEND_BASE + '/items' , query);
    };

    this.getAllWarehouse = function (sizePerPage, page, filter) {
            var url = '/warehouses?size=' + sizePerPage
                + '&page=' + page;
            if (filter.keyWord) {
                url = url + '&keyWord=' + filter.keyWord;
            }
            return $http.get(Constant.BACKEND_BASE + url);
        };
});