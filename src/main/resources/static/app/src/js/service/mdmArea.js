angular.module('IOne-Production').service('MdmArea', function ($http, Constant) {
    this.getAll = function () {
            return $http.get(Constant.BACKEND_BASE + '/mdmAreas/');
        };
    this.modify = function (secondMdmAreaItemUuid,Input) {
            return $http.patch(Constant.BACKEND_BASE + '/mdmAreas/' + secondMdmAreaItemUuid, Input);
        };
    this.add = function (secondMdmAreaItemInput) {
            return $http.post(Constant.BACKEND_BASE + '/mdmAreas/', secondMdmAreaItemInput);
        };
});