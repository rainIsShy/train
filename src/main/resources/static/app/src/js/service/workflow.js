angular.module('IOne-Production').service('WorkflowService', function($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, workflowName, resUuid) {
        var url = '/workflows?size=' + sizePerPage + '&page=' + page;
        if (confirm !== undefined && confirm !== '0') {
            url = url + '&confirm=' + confirm;
        }

        if (workflowName !== undefined && workflowName !== null) {
            url = url + '&workflowName=' + workflowName;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/workflows/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/workflows/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/workflows/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/workflows/', AddInput);
    };

    this.getByCurrentUser = function () {
        return $http.get(Constant.BACKEND_BASE + '/workflows?currentUser=Y');
    };

});


angular.module('IOne-Production').service('WorkflowDetailService', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/workflows/' + masterUuid + '/details?sort=flwoNo');
    };

    this.add = function (masterUuid, AddInput) {
        console.log("masterUuid[" + masterUuid + "], url:" + Constant.BACKEND_BASE + '/workflows/' + masterUuid + '/details', AddInput);
        return $http.post(Constant.BACKEND_BASE + '/workflows/' + masterUuid + '/details', AddInput);
    };

    this.modify = function (masterUuid, detailUuid, updateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/workflows/' + masterUuid + "/details/" + detailUuid, updateInput);
    };

    this.delete = function (masterUuid, detailUuid) {
        console.log(Constant.BACKEND_BASE + '/workflows/' + masterUuid + "/details/" + detailUuid);
        return $http.delete(Constant.BACKEND_BASE + '/workflows/' + masterUuid + "/details/" + detailUuid);
    };
});