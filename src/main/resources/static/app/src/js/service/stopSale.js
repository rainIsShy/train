angular.module('IOne-Production').service('SynchronizationService', function ($http, Constant) {
    this.getAll = function (syncType) {
        var url = '/synchronizations?syncType=' + syncType;
        return $http.get(Constant.BACKEND_BASE + url);
    };
});