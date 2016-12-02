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

    this.getItemRelations = function(itemUuid,reference){
        return $http.get(Constant.BACKEND_BASE + '/itemRelations?itemUuid='+itemUuid+'&reference='+reference);
    }
});