angular.module('IOne-Production').service('AllotTypeService', function ($http, $filter, Constant) {
    var requestUrl = Constant.BACKEND_BASE + '/allotTypes/';

    this.add = function (input) {
        return $http.post(requestUrl, input);
    };

    this.modify = function (uuid, updateInput) {
        return $http.patch(requestUrl + uuid, updateInput);
    };

    this.delete = function (uuid) {
        return $http.delete(requestUrl + uuid);
    };

    this.getAll = function (sizePerPage, currentPage, queryConditions) {
        var config = {
            params: angular.merge({}, {
                size: sizePerPage,
                page: currentPage,
                resUuid: RES_UUID_MAP.INV.MISCELLANEOUS_TYPE.RES_UUID
            }, queryConditions)
        };
        return $http.get(requestUrl, config);
    };
});