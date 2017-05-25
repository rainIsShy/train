angular.module('IOne-Production').service('CBIGroupEmployeeChanRService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, theMax, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/groupEmployeeChannelRelations?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (theMax !== undefined && theMax !== null) {
            url = url + '&globalQuery=' + theMax;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/groupEmployeeChannelRelations/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/groupEmployeeChannelRelations/' + uuid);
    };

    this.modify = function (uuid, EmployeeUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/groupEmployeeChannelRelations/' + uuid, EmployeeUpdateInput);
    };

    this.add = function (EmployeeInput) {
        return $http.post(Constant.BACKEND_BASE + '/groupEmployeeChannelRelations/', EmployeeInput);
    };

    this.addImage = function(employeeUuid, imageUuid) {
        return $http.post(Constant.BACKEND_BASE + '/groupEmployeeChannelRelations/' + employeeUuid + '/images',{employeeImageFileUuid: imageUuid});
    };
});


angular.module('IOne-Production').service('CBIGroupEmployeeClassRService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, theMax, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/groupEmployeeClassRelations?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;


        if (theMax !== undefined && theMax !== null) {
            url = url + '&globalQuery=' + theMax;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/groupEmployeeClassRelations/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/groupEmployeeClassRelations/' + uuid);
    };

    this.modify = function (uuid, EmployeeUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/groupEmployeeClassRelations/' + uuid, EmployeeUpdateInput);
    };

    this.add = function (EmployeeInput) {
        return $http.post(Constant.BACKEND_BASE + '/groupEmployeeClassRelations/', EmployeeInput);
    };

});

angular.module('IOne-Production').service('CBIGroupEmployeeBrandRService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, theMax, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/groupEmployeeBrandRelations?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (theMax !== undefined && theMax !== null) {
            url = url + '&globalQuery=' + theMax;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getByNo = function (no) {
        return $http.get(Constant.BACKEND_BASE + '/groupEmployeeBrandRelations?no=' + no);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/groupEmployeeBrandRelations/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/groupEmployeeBrandRelations/' + uuid);
    };

    this.modify = function (uuid, EmployeeUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/groupEmployeeChannelRelations/' + uuid, EmployeeUpdateInput);
    };

    this.add = function (EmployeeInput) {
        return $http.post(Constant.BACKEND_BASE + '/groupEmployeeBrandRelations/', EmployeeInput);
    };

});