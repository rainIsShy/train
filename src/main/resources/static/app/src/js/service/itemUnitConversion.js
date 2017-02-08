angular.module('IOne-Production').service('ItemUnitConversionService', function ($http, $filter, Constant) {
    var requestUrl = Constant.BACKEND_BASE + '/itemUnitConversions/';

    this.add = function (input) {
        return $http.post(requestUrl, input);
    };

    this.modify = function (uuid, updateInput) {
        return $http.patch(requestUrl + uuid, updateInput);
    };

    this.batchModify = function (list) {
        return $http.patch(requestUrl, list);
    };

    this.delete = function (uuid) {
        return $http.delete(requestUrl + uuid);
    };

    this.batchDelete = function (list) {
        return $http.patch(requestUrl + "batch/delete", list);
    };

    this.getAll = function (sizePerPage, currentPage, queryConditions) {
        var config = {
            params: angular.merge({}, {
                size: sizePerPage,
                page: currentPage,
                resUuid: RES_UUID_MAP.INV.UNIT_CONVERSION.RES_UUID
            }, queryConditions)
        };
        return $http.get(requestUrl, config);
    };

    this.get = function (uuid) {
        return $http.get(requestUrl + uuid);
    };
});