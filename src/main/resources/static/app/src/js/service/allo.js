angular.module('IOne-Production').service('AlloMasterService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, transferFlag, no, applyDateBegin, applyDateEnd, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        transferFlag = transferFlag == 0 ? '' : transferFlag;

        var url = '/allotMasters?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no !== null && no != undefined) {
            url = url + '&no=' + no;
        }


        if (applyDateBegin != null && applyDateBegin != '') {
            url = url + '&applyDateBegin=' + applyDateBegin;
        }

        if (applyDateEnd != null && applyDateEnd != '') {
            url = url + '&applyDateEnd=' + applyDateEnd;
        }

        if (transferFlag != 0) {
            url = url + '&transferFlag=' + transferFlag;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/allotMasters/' + uuid);
    };

    this.modify = function (uuid, alloMasterUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/allotMasters/' + uuid, alloMasterUpdateInput);
    };

    this.add = function (alloMasterInput) {
        return $http.post(Constant.BACKEND_BASE + '/allotMasters/', alloMasterInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/allotMasters/' + uuid);
    };

    this.batchUpdate = function (uuids, alloMasterUpdateInput) {
        console.log('/allotMasters?action=batchUpdate&uuids=' + uuids);
        return $http.patch(Constant.BACKEND_BASE + '/allotMasters?action=batchUpdate&uuids=' + uuids, alloMasterUpdateInput);
    };

});

angular.module('IOne-Production').service('AlloDetailService', function ($http, Constant) {
    this.get = function (masterUuid) {
        return $http.get(Constant.BACKEND_BASE + '/allotMasters/' + masterUuid + '/details');

    };

    this.modify = function (masterUuid, uuid, OrderDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/allotMasters/' + masterUuid + '/details/' + uuid, OrderDetailUpdateInput);
    };


    this.add = function (masterUuid, OrderDetailInput) {
        return $http.post(Constant.BACKEND_BASE + '/allotMasters/' + masterUuid + '/details/', OrderDetailInput);
    };

    this.delete = function (masterUuid, detailUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/allotMasters/' + masterUuid + '/details/' + detailUuid);
    };
});


angular.module('IOne-Production').service('AllotExtendDetailService', function ($http, Constant) {
    this.get = function (detailUuid) {
        console.log(Constant.BACKEND_BASE + '/allotDetails/' + detailUuid + '/extends');
        return $http.get(Constant.BACKEND_BASE + '/allotDetails/' + detailUuid + '/extends');
    };

    this.modify = function (detailUuid, uuid, alloExtendDetailUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/allotDetails/' + detailUuid + '/extends/' + uuid, alloExtendDetailUpdateInput);
    };


});


angular.module('IOne-Production').service('AllotExtendDetail2Service', function ($http, Constant) {
    this.get = function (extendUuid) {
        return $http.get(Constant.BACKEND_BASE + '/allotExtendDetails/' + extendUuid + '/extend2s/');
    };

    this.modify = function (extendUuid, uuid, extend2UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/allotExtendDetails/' + extendUuid + '/extend2s/' + uuid, extend2UpdateInput);
    };

    this.add = function (extendUuid, OrderExtendDetail2Input) {
        return $http.post(Constant.BACKEND_BASE + '/allotExtendDetails/' + extendUuid + '/extend2s/', OrderExtendDetail2Input);
    };

    this.delete = function (extendUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/allotExtendDetails/' + extendUuid + '/extend2s/' + uuid);
    }
});


