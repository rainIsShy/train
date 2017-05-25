/**
 * Created by user on 2017/5/25.
 */
angular.module('IOne-Production').service('BrandRelationsService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, baseClassUuid, resUuid) {


        var url = '/baseBrandRelations?size=' + sizePerPage
            + '&page=' + page;

        if (baseClassUuid !== undefined && baseClassUuid !== null) {
            url = url + '&baseClassUuid=' + baseClassUuid;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }


        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/baseBrandRelations/' + uuid);
    };


    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/baseBrandRelations/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/baseBrandRelations/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/baseBrandRelations/', AddInput);
    };
});