angular.module('IOne-Production').service('SynchronizationService', function ($http, Constant) {
    this.getAll = function (syncType) {
        var url = '/synchronizations?syncType=' + syncType;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllParameter = function (sizePerPage, page, syncType) {
        var url = '/synchronizations?size=' +sizePerPage + '&page=' + page;
        if(syncType != undefined && syncType != null){
            url = url + '&syncType=' + syncType;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };
});