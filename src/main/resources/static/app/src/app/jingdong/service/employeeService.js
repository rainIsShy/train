angular.module('IOne-Production').service('EmployeeService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, keyword) {
        var url = '/groupUsers?size=' + sizePerPage
            + '&page=' + page;

        if (keyword !== null && keyword !== undefined && keyword !== "") {
            url = url + '&keyword=' + keyword;
        }

        console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };
});