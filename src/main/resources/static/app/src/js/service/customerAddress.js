angular.module('IOne-Production').service('CustomerAddress', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, customerUuid) {
        return $http.get(Constant.BACKEND_BASE + "/customers/" + customerUuid + "/addresses?"
            + "size=" + sizePerPage
            + '&page=' + page
        );
    };
});