angular.module('IOne-Production').service('FAMDiscountCartTypeService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, theMax, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/discountCartTypes?size=' + sizePerPage
            + '&page=' + page;

        if (theMax !== undefined && theMax !== null) {
            url = url + '&no=' + theMax;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/discountCartTypes/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/discountCartTypes/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/discountCartTypes/' + uuid, UpdateInput);
    };

    this.add = function (Input) {
        return $http.post(Constant.BACKEND_BASE + '/discountCartTypes/', Input);
    };
});


angular.module('IOne-Production').service('FAMIncomePurposeService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, theMax, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/incomePurposes?size=' + sizePerPage
            + '&page=' + page;

        if (theMax !== undefined && theMax !== null) {
            url = url + '&no=' + theMax;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/incomePurposes/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/incomePurposes/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/incomePurposes/' + uuid, UpdateInput);
    };

    this.add = function (Input) {
        return $http.post(Constant.BACKEND_BASE + '/incomePurposes/', Input);
    };
});

angular.module('IOne-Production').service('FAMBankCardService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, no, name, keyWord, resUuid) {

        var url = '/bankCards?size=' + sizePerPage
            + '&page=' + page;

        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }
        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/bankCards/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/bankCards/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/bankCards/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/bankCards/', AddInput);
    };
});

angular.module('IOne-Production').service('FAMBankService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, no, name, keyWord, resUuid) {

        var url = '/banks?size=' + sizePerPage
            + '&page=' + page;

        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }
        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/banks/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/banks/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/banks/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/banks/', AddInput);
    };
});

