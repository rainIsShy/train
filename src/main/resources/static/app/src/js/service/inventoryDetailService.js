angular.module('IOne-Production').service('InventoryDetailService', function ($http, $filter, Constant) {
    this.getAll = function (page, size, warehouseNO, warehouseName, itemFileNo, itemFileName, itemFileStandard) {
        var url = Constant.BACKEND_BASE + '/inventoryDetails'
            + '?page=' + page + '&size=' + size;
        if (warehouseNO != null && warehouseNO != '') {
            url += '&warehouseNO=' + warehouseNO;
        }
        if (warehouseName != null && warehouseName != '') {
            url += '&warehouseName=' + warehouseName;
        }
        if (itemFileNo != null && itemFileNo != '') {
            url += '&itemFileNo=' + itemFileNo;
        }
        if (itemFileName != null && itemFileName != '') {
            url += '&itemFileName=' + itemFileName;
        }
        if (itemFileStandard != null && itemFileStandard != '') {
            url += '&itemFileStandard=' + itemFileStandard;
        }
        return $http.get(url);
    };

    this.getItemRelations = function(itemUuid,reference){
        return $http.get(Constant.BACKEND_BASE + '/itemRelations?itemUuid='+itemUuid+'&reference='+reference);
    }
});