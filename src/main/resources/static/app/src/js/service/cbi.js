angular.module('IOne-Production').service('CBIEmployeeService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, theMax, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/employees?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

//        if(theMax !== undefined && theMax !== null) {
//            url = url + '&name=' + theMax;
//        }
        if (theMax !== undefined && theMax !== null) {
            url = url + '&globalQuery=' + theMax;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getByNo = function (no) {
        return $http.get(Constant.BACKEND_BASE + '/employees?no=' + no);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/employees/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/employees/' + uuid);
    };

    this.modify = function (uuid, EmployeeUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/employees/' + uuid, EmployeeUpdateInput);
    };

    this.add = function (EmployeeInput) {
        return $http.post(Constant.BACKEND_BASE + '/employees/', EmployeeInput);
    };

    this.addImage = function(employeeUuid, imageUuid) {
        return $http.post(Constant.BACKEND_BASE + '/employees/' + employeeUuid + '/images',{employeeImageFileUuid: imageUuid});
    };
});

angular.module('IOne-Production').service('CBIOrderTypeService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, productType, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;
        productType = productType == 0 ? '' : productType;

        var url = '/orderTypes?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }
        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }
        if (productType !== undefined && productType !== null && productType !== '') {
            url = url + '&productType=' + productType;
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
        return $http.get(Constant.BACKEND_BASE + '/orderTypes/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/orderTypes/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/orderTypes/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/orderTypes/', AddInput);
    };
});

angular.module('IOne-Production').service('CBIReturnReasonService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/returnReasons?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

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
        return $http.get(Constant.BACKEND_BASE + '/returnReasons/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/returnReasons/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/returnReasons/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/returnReasons/', AddInput);
    };
});

angular.module('IOne-Production').service('CBIPayWayService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/payWays?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no !== undefined && no !== null && no !== '') {
            if (typeof no == 'string') {
                no = no.replace(/\+/g, "%2B");
            }
            url = url + '&no=' + no;
        }

        if (name !== undefined && name !== null && name !== '') {
            if (typeof name == 'string') {
                name = name.replace(/\+/g, "%2B");
            }
            url = url + '&name=' + name;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }

        if (resUuid !== undefined) {
            url = url + '&resUuid=' + resUuid;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/payWays/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/payWays/' + uuid);
    };

    this.modify = function (uuid, payWayUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/payWays/' + uuid, payWayUpdateInput);
    };

    this.add = function (payWayInput) {
        return $http.post(Constant.BACKEND_BASE + '/payWays/', payWayInput);
    };
});

angular.module('IOne-Production').service('CBISaleTypeService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/saleTypes?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

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
        return $http.get(Constant.BACKEND_BASE + '/saleTypes/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/saleTypes/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/saleTypes/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/saleTypes/', AddInput);
    };
});


angular.module('IOne-Production').service('CBIItemCustomService', function($http, Constant) {
    this.getAll = function() {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms');
    };

    this.getAll = function (sizePerPage, page, confirm, status, theMax, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/itemCustoms?size=' + sizePerPage
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


    this.getCustom = function(uuid) {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms/' + uuid);
    };
    this.delete = function (uuid) {
       return $http.delete(Constant.BACKEND_BASE + '/itemCustoms/' + uuid);
   };

   this.modify = function (uuid, UpdateInput) {
       return $http.patch(Constant.BACKEND_BASE + '/itemCustoms/' + uuid, UpdateInput);
   };

   this.add = function (AddInput) {
       return $http.post(Constant.BACKEND_BASE + '/itemCustoms/', AddInput);
   };
});




angular.module('IOne-Production').service('CBIItemCustomScopeService', function($http, Constant) {
     this.getAll = function (itemCustomUuid,sizePerPage, page, confirm, status, theMax, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/itemCustoms/' + itemCustomUuid + '/scopes?size=' + sizePerPage
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


    this.getCustom = function(itemCustomUuid, scopeUuid) {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms/' + itemCustomUuid + '/scopes/' + scopeUuid);
    };
    this.delete = function (itemCustomUuid, scopeUuid) {
       return $http.delete(Constant.BACKEND_BASE + '/itemCustoms/' + itemCustomUuid + '/scopes/' + scopeUuid);
   };

   this.modify = function (itemCustomUuid, scopeUuid, UpdateInput) {
       return $http.patch(Constant.BACKEND_BASE + '/itemCustoms/' + itemCustomUuid + '/scopes/' + scopeUuid, UpdateInput);
   };

   this.add = function (itemCustomUuid,AddInput) {
       return $http.post(Constant.BACKEND_BASE + '/itemCustoms/'+ itemCustomUuid + '/scopes/', AddInput);
   };
});