angular.module('IOne-Production').service('SynchronizationService', function ($http, Constant) {
    this.getAll = function (syncType) {
        var url = '/synchronizations?syncType=' + syncType;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllParameter = function (sizePerPage, page, syncType,keyWord) {
        var url = '/synchronizations?size=' +sizePerPage + '&page=' + page;
        if(syncType != undefined && syncType != null && syncType != ""){
            url = url + '&syncType=' + syncType;
        }

        if(keyWord != undefined && keyWord != null && keyWord != ""){
            url = url + '&keyWord=' + keyWord;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.add = function (synchronizationTipTopInput) {
            return $http.post(Constant.BACKEND_BASE + '/synchronizations/',synchronizationTipTopInput);
        }

    this.delete = function (synchronizationTipTopUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/synchronizations/' + synchronizationTipTopUuid);
    };

    this.modify = function (synchronizationTipTopUuid, synchronizationTipTopInput) {
        return $http.patch(Constant.BACKEND_BASE + '/synchronizations/' + synchronizationTipTopUuid, synchronizationTipTopInput);
    };
});