angular.module('IOne-Production').service('AssFormMasterService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.confirm == 0 ? '' : filter.confirm;
        var status = filter.status == 0 ? '' : filter.status;
        var no = filter.no == 0 ? '' : filter.no;
        var url = '/assForms?size=' + sizePerPage
            + '&page=' + page;

        if (no != '' && no != undefined) {
            url = url + '&salesOrderMasterNo=' + no;
        }
        // if (confirm != '') {
        //     url = url + '&confirm=' + confirm;
        // }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    //审核
    this.confirm = function (uuids) {
        return $http.patch(Constant.BACKEND_BASE + '/assForms/' + uuids, {'action': '2', 'confirm': '2'});
    };

    this.modify = function (uuid, updateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/assForms/' + uuid, updateInput);
    };

    this.add = function (addInput) {
        console.log(addInput);
        return $http.post(Constant.BACKEND_BASE + '/assForms', addInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/assForms/' + uuid);
    };

    this.addImage = function (uuid, imageUuid) {
        return $http.post(Constant.BACKEND_BASE + '/assForms/' + uuid + '/images', {pictureUuid: imageUuid});
    };

    this.deleteImage = function (uuid, picture) {
        return $http.delete(Constant.BACKEND_BASE + '/assForms/' + uuid + '/images?pictureNo=' + picture);
    };

});

angular.module('IOne-Production').service('AssFormDetailService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, filter) {
        var confirm = filter.confirm == 0 ? '' : filter.confirm;
        var status = filter.status == 0 ? '' : filter.status;
        var transferFlag = filter.transferFlag == 0 ? '' : filter.transferFlag;
        var url = '/assForms/{assFormUuid}/details?size=' + sizePerPage
            + '&page=' + page;

        // if (confirm != '') {
        //     url = url + '&confirm=' + confirm;
        // }
        // if (status != '') {
        //     url = url + '&status=' + status;
        // }


        console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (masterUuid) {
        var url = '/assForms/' + masterUuid + '/details';
        return $http.get(Constant.BACKEND_BASE + url);
    };

    // //审核
    // this.confirm = function (uuids) {
    //     return $http.patch(Constant.BACKEND_BASE + '/assForms/' + uuids, {'action': '2', 'confirm': '2'});
    // };
    //
    // this.modify = function (uuid, updateInput) {
    //     return $http.patch(Constant.BACKEND_BASE + '/assForms/' + uuid, updateInput);
    // };
    //
    // this.add = function (addInput) {
    //     return $http.post(Constant.BACKEND_BASE + '/assForms', addInput);
    // };

    this.delete = function (materUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/assForms/' + materUuid + '/details/' + uuid);
    };
});

angular.module('IOne-Production').service('AssFormFlowService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, isShowCurrentEmpl, flowStatus, filter) {
        var confirm = filter.confirm == 0 ? '' : filter.confirm;
        var status = filter.status == 0 ? '' : filter.status;
        var no = filter.no;
        var url = '/assFormFlows?size=' + sizePerPage + '&page=' + page;


        if (no != undefined && no != '') {
            url = url + '&salesOrderMasterNo=' + no;
        }
        if (isShowCurrentEmpl != '') {
            url = url + '&isShowCurrentEmpl=Y';
        }

        if (flowStatus != '') {
            url = url + '&flowStatus=' + flowStatus;
        }


        console.info(Constant.BACKEND_BASE + url);
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.get = function (assFormUuid) {
        var url = '/assFormFlows';
        if (assFormUuid !== '') {
            url = url + '?assFormUuid=' + assFormUuid;
        }
        url = url + '&sort=flwo';
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.modify = function (uuid, updateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/assFormFlows/' + uuid, updateInput);
    };


});