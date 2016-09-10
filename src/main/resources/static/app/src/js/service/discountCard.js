angular.module('IOne-Production').service('DiscountCardService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/discountCards?size=' + sizePerPage
            + '&page=' + page;

        if (no !== undefined && no !== null) {
            url = url + '&no=' + no;
        }

        if (name !== undefined && name !== null) {
            url = url + '&name=' + name;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        console.log(url);
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/discountCards/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/discountCards/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/discountCards/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/discountCards/', AddInput);
    };
});

angular.module('IOne-Production').service('DiscountChanService', function ($http, Constant) {
    this.get = function (discountCardUuid) {
        var url = "?";
        if (discountCardUuid !== undefined && discountCardUuid !== null) {
            url = url + 'discountCardUuid=' + discountCardUuid;
        }
        return $http.get(Constant.BACKEND_BASE + '/discountCardChannels' + url);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/discountCardChannels/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/discountCardChannels/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/discountCardChannels/', AddInput);
    };
});