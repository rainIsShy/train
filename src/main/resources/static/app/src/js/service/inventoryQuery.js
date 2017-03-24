angular.module('IOne-Production').service('InventoryQueryMaster', function ($http, Constant) {
    this.getAll = function () {
        var url = '/inventoryQuery';
        console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

});