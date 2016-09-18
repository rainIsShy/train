angular.module('IOne-Production').service('CatalogueTagService', function ($http, Constant) {
    this.getAll = function (catalogueUuid) {
        var url = '/tagRelation2s?catalogueUuid=' + catalogueUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/tagRelation2s/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/tagRelation2s/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/tagRelation2s/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/tagRelation2s/', AddInput);
    };
});