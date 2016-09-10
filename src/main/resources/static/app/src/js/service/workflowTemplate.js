angular.module('IOne-Production').service('WorkflowTemplateMaster', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.confirm == 0 ? '' : filter.confirm;
        var status = filter.status == 0 ? '' : filter.status;
        var transferFlag = filter.transferFlag == 0 ? '' : filter.transferFlag;
        var url = 'workflowTemplates?size=' + sizePerPage
            + '&page=' + page;

        if (confirm !== '') {
            url = url + '&confirm=' + confirm;
        }
        if (status !== '') {
            url = url + '&status=' + status;
        }
        if (filter.workflowName !== null && filter.workflowName !== undefined) {
            url = url + '&workflowName=' + filter.workflowName;
        }

        console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    //审核
    this.confirm = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/workflowTemplates/' + uuids, {'action': '2', 'confirm': '2'});
    };

    this.modify = function (uuid, updateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/workflowTemplates/' + uuid, updateInput);
    };

    this.add = function (addInput) {
        return $http.post(Constant.BACKEND_BASE + '/workflowTemplates', addInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/workflowTemplates/' + uuid);
    };
});


angular.module('IOne-Production').service('WorkflowTemplateDetail', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/workflowTemplates/' + masterUuid + '/details');
    };

    this.modify = function (masterUuid, detailUuid, updateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/workflowTemplates/' + masterUuid + "/details/" + detailUuid, updateInput);
    };

    this.add = function (masterUuid, addInput) {
        return $http.post(Constant.BACKEND_BASE + '/workflowTemplates/' + masterUuid + "/details", addInput);
    };

    this.delete = function (masterUuid, detailUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/workflowTemplates/' + masterUuid + "/details/" + detailUuid);
    };
});




