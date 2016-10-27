angular.module('IOne-Production').service('SynchronizationService', function ($http, Constant) {
    this.getAll = function () {
        var url = '/synchronizations';
        return $http.get(Constant.BACKEND_BASE + url);
    };
});