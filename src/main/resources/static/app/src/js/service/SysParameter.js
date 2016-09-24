angular.module('IOne-Production').service('SysParameter', function ($http, Constant) {
    this.get = function (uuid) {
        var url = '/sysParameters?uuid=' + uuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };
});