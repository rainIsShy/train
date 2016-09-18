angular.module('IOne-Production').service('ProductionTagService', function ($http, Constant) {
    this.getAll = function (itemUuid) {
        var url = '/tagRelation1s?itemUuid=' + itemUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/tagRelation1s/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/tagRelation1s/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/tagRelation1s/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/tagRelation1s/', AddInput);
    };
});