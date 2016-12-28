angular.module('IOne-Production').service('LogisticsDetailRelationsService', function ($http, Constant) {
    this.getAll = function (queryConditions) {
        var config = {
            params: queryConditions
        };
        return $http.get(Constant.BACKEND_BASE + '/logisticsDetailRelations', config);
    };
});