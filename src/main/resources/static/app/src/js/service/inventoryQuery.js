angular.module('IOne-Production').service('InventoryQueryMaster', function ($http, Constant) {
    this.getAll = function (suite) {
        var url = '/inventoryQuery';
        if(suite != undefined && suite != null){
            url = url + '?suite=' + suite;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getTotal = function (suite) {
        var url = '/inventoryQuery';
        if(suite != undefined && suite != null){
            url = url + '?suite=' + suite;
        }
        return $http.get(Constant.BACKEND_BASE + url + '&action=total');
    };

});