angular.module('IOne-Production').service('LogisticsDetailRelationsService', function ($http, Constant) {
    this.getAll = function (queryConditions) {
        var config = {
            params: queryConditions
        };
        return $http.get(Constant.BACKEND_BASE + '/logisticsDetailRelations', config);
    };

    this.updateShipStatus = function (logisticsDetail) {
        var url = Constant.BACKEND_BASE + '/logisticsDetailRelations/' + logisticsDetail.uuid;
        var updateInput = {
            confirm: '2'
        };
        return $http.patch(url, updateInput);
    };
});