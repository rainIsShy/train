angular.module('IOne-Production').service('BrandFile', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, brandNo, brandName) {
        var url = '/brands?size=' + sizePerPage
            + '&page=' + page;

        if (brandNo !== undefined && brandNo !== null) {
            url = url + '&no=' + brandNo;
        }

        if (brandName !== undefined && brandName !== null) {
            url = url + '&name=' + brandName;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };
    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/brands/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/brands/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/brands/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/brands/', AddInput);
    };

    this.getUnuseBrandByChannelUuid = function (sizePerPage, page, channelUuid) {
        var url = '/brands?size=' + sizePerPage
            + '&page=' + page;


        if (channelUuid !== undefined && channelUuid !== null) {
            url = url + '&channelUuid=' + channelUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };
    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/brands/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/brands/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/brands/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/brands/', AddInput);
    };
});
angular.module('IOne-Production').service('BrandPic', function ($http, Constant) {
    this.addImage = function (brandUuid, itemPathsUuid) {
        return $http.post(Constant.BACKEND_BASE + '/brands/' + brandUuid + '/images', {imageFileUuid: itemPathsUuid});
    };

    this.deleteImage = function (brandUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/brands/' + brandUuid + '/images');
    };
});






