angular.module('IOne-Production').service('MdmArea', function ($http, Constant) {
    var url = Constant.BACKEND_BASE + '/mdmAreas/';
    this.getAll = function () {
            return $http.get(url);
        };
    this.modify = function (secondMdmAreaItemUuid,Input) {
            return $http.patch(url + secondMdmAreaItemUuid, Input);
        };
    this.add = function (secondMdmAreaItemInput) {
            return $http.post(url, secondMdmAreaItemInput);
        };
});