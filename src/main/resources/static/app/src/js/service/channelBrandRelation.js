angular.module('IOne-Production').service('ChannelBrandRelationsService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channelBrandRelations?size=' + sizePerPage
            + '&page=' + page;


        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllWithPaging = function (sizePerPage, page, status, channelUuid, brandNo, brandName) {
        var url = '/channelBrandRelations?size=' + sizePerPage
            + '&page=' + page
            + '&status=' + status
            + '&channelUuid=' + channelUuid;

        if (brandNo) {
            url = url + '&brandNo=' + brandNo;
        }

        if (brandName) {
            url = url + '&brandName=' + brandName;
        }


        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.getAllByChannelUuid = function (channelUuid, status, resUuid) {
        var url = '/channelBrandRelations?status=' + status
            + '&channelUuid=' + channelUuid;


        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.getAllByChannelUuidAndBrandUuid = function (channelUuid, brandUuid) {
        var url = '/channelBrandRelations?channelUuid=' + channelUuid + '&brandUuid=' + brandUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/channelBrandRelations/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/channelBrandRelations/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelBrandRelations/' + uuid, UpdateInput);
    };

    this.add = function (Input) {
        return $http.post(Constant.BACKEND_BASE + '/channelBrandRelations/', Input);
    };

    this.updatePrice = function (channelUuid, brandUuids) {
        return $http.patch(Constant.BACKEND_BASE + '/channelBrandRelations?channelUuid=' + channelUuid, brandUuids);
    };

    this.deleteByChannelAndBrand = function (channelUuid, brandUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/channelBrandRelations?channelUuid=' + channelUuid + '&brandUuid=' + brandUuid);
    };

    this.getBrandUuidByChannelUuid = function (channelUuid) {
        var url = '/channelBrandRelations?action=getBrand&channelUuid=' + channelUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.findChannelUuidByBrandUuid = function (brandUuid) {
        var url = '/channelBrandRelations?action=getChannel&brandUuid=' + brandUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };
});