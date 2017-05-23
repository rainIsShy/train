angular.module('IOne-Production').service('Production', function($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, release, status, prodType, stopProd, no, name, resUuid, eshopType, assemblingFlag, orderByName) {
        confirm = confirm == 0 ? '' : confirm;
        release = release == 0 ? '' : release;
        status = status == 0 ? '' : status;
        prodType = prodType == 0 ? '' : prodType;
        stopProd = stopProd == 0 ? '' : stopProd;

        if(no == undefined) {
            no = '';
        } else {
            no = no.replace(/\+/g, "%2B");
        }

        if(name == undefined) {
            name = '';
        } else {
            name = name.replace(/\+/g, "%2B");
        }
        if(resUuid == undefined) {
            resUuid = '';
        }
        if(assemblingFlag == undefined) {
            assemblingFlag = '';
        }
        if(eshopType == undefined || eshopType == 0) {
            eshopType = '';
        }
        if (orderByName == undefined || orderByName == null) {
            orderByName = '2';
        }

        return $http.get(Constant.BACKEND_BASE + '/items?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&release=' + release
            + '&type=' + prodType
            + '&stopProd=' + stopProd
            + '&no=' + no
            + '&name=' + name
            + '&eshopType=' + eshopType
            + '&assemblingFlag=' + assemblingFlag
            + '&resUuid=' + resUuid
            + '&orderByName=' + orderByName);
    };

    this.getNo = function(name,no) {
        return $http.get(Constant.BACKEND_BASE + '/items/' + '?name=' +  name + '&no=' + no + '&action=getItemName');
    };

    this.get = function(productionUuid, resUuid) {
        return $http.get(Constant.BACKEND_BASE + '/items/' + productionUuid + '?resUuid=' + resUuid);
    };

    this.modify = function(production) {
        return $http.patch(Constant.BACKEND_BASE + '/items/' + production.uuid, production);
    };

    this.add = function(production) {
        return $http.post(Constant.BACKEND_BASE + '/items/', production);
    };

    this.delete = function(productionUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/items/' + productionUuid);
    };

    this.addImage = function(productionUuid, imageUuid) {
        return $http.post(Constant.BACKEND_BASE + '/items/' + productionUuid + '/images',{itemImageFileUuid: imageUuid});
    };

    this.deleteImage = function(productionUuid, type) {
        return $http.delete(Constant.BACKEND_BASE + '/items/' + productionUuid + '/images?imageTypes=' + type);
    };

    this.getInventory = function (sizePerPage, currentPage, productionUuid) {
        var query = {
            params: angular.merge({}, {
                size: sizePerPage,
                page: currentPage
            })
        };
        return $http.get(Constant.BACKEND_BASE + '/items/' + productionUuid + '/inventory', query);
    };

    this.getDeliveryDate = function (itemUuid, channelUuid) {
        return $http.get(Constant.BACKEND_BASE + '/items/' + itemUuid + '?action=queryDeliverDate&channelUuid=' + channelUuid);
    }
});

angular.module('IOne-Production').service('ProductionBom', function($http, Constant) {
    this.getAll = function(productionUuid) {
        return $http.get(Constant.BACKEND_BASE + '/items/' + productionUuid + '/boms');
    };

    this.add = function(productionUuid, bom) {
        return $http.post(Constant.BACKEND_BASE + '/items/' + productionUuid + '/boms', bom);
    };

    this.modify = function(productionUuid, bom) {
        return $http.patch(Constant.BACKEND_BASE + '/items/' + productionUuid + '/boms/' + bom.uuid, bom);
    };

    this.delete = function(productionUuid, bomUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/items/' + productionUuid + '/boms/' + bomUuid);
    };
});

angular.module('IOne-Production').service('ProductionPic', function($http, Constant) {
    this.getAll = function(productionUuid) {
        return $http.get(Constant.BACKEND_BASE + '/items/' + productionUuid + '/paths');
    };

    this.add = function(production) {
        return $http.post(Constant.BACKEND_BASE + '/items/' + production.uuid + '/paths', {
            itemUuid : production.uuid,
            no : Math.random().toString(36).substring(10)
        });
    };

    this.addImage = function(productionUuid, itemPathsUuid, fileUuid) {
        return $http.post(Constant.BACKEND_BASE + '/items/' + productionUuid + '/paths/' + itemPathsUuid + '/images', {imageFileUuid: fileUuid});
    };

    this.deleteImage = function(productionUuid, itemPathsUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/items/' + productionUuid + '/paths/' + itemPathsUuid);
    };
});

angular.module('IOne-Production').service('ProductionCustom', function($http, Constant) {
    this.getAll = function() {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms');
    };

    this.getCustom = function(customUuid) {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms/' + customUuid + '/scopes');
    };

    this.getInformationByCustom = function (itemUuid, customUuid) {
        return $http.get(Constant.BACKEND_BASE + '/itemCustoms/' + customUuid + '/scopes?action=getInformation&itemUuid=' + itemUuid);
    }
});

angular.module('IOne-Production').service('ProductionItemCustom', function($http, Constant) {
    this.get = function(productionUuid) {
        if(productionUuid == undefined) {
            productionUuid = '';
        }
        return $http.get(Constant.BACKEND_BASE + '/items/' + productionUuid + '/customs?itemUuid=' + productionUuid);
    };

    this.getByItemCustomUuid = function (productionUuid, itemCustomUuid) {
        return $http.get(Constant.BACKEND_BASE + '/items/' + productionUuid + '/customs?itemCustomUuid=' + itemCustomUuid);
    };

    this.add = function(productionUuid, itemCustom) {
        return $http.post(Constant.BACKEND_BASE + '/items/' + productionUuid + '/customs', itemCustom);
    };

    this.modify = function(productionUuid, itemCustomUuid, itemCustom) {
        return $http.patch(Constant.BACKEND_BASE + '/items/' + productionUuid + '/customs/' + itemCustomUuid, itemCustom);
    };

    this.delete = function(productionUuid, itemCustomUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/items/' + productionUuid + '/customs/' + itemCustomUuid);
    }
});

angular.module('IOne-Production').service('ProductionArea', function($http, Constant) {
    this.getAll = function() {
        return $http.get(Constant.BACKEND_BASE + '/areas');
    };

    this.get = function(productionUuid) {
        return $http.get(Constant.BACKEND_BASE + '/areas?itemUuid=' + productionUuid);
    };
});

angular.module('IOne-Production').service('ProductionBrand', function($http, Constant) {
    this.getAll = function(resUuid) {
        if(resUuid == undefined) {
            resUuid = '';
        }

        return $http.get(Constant.BACKEND_BASE + '/brands?'
        + 'resUuid=' + resUuid);
    };

    this.get = function(productionUuid) {
        return $http.get(Constant.BACKEND_BASE + '/areas?itemUuid=' + productionUuid);
    };

    this.addImage = function(brandUuid, fileUuid) {
        return $http.patch(Constant.BACKEND_BASE + '/brands/' + brandUuid + '?fileUuid=' + fileUuid, {});
    };
});

angular.module('IOne-Production').service('ProductionCatalogueDetails', function($http, Constant) {
    this.getByCatalogue = function(catalogueUuid, sizePerPage, page, no, name, resUuid) {
        if(no == undefined) {
            no = '';
        } else {
            no = no.replace(/\+/g, "%2B");
        }

        if(name == undefined) {
            name = '';
        } else {
            name = name.replace(/\+/g, "%2B");
        }

        if(resUuid == undefined) {
            resUuid = '';
        }

        return $http.get(Constant.BACKEND_BASE + '/itemCatalogueDetails?catalogueUuid=' + catalogueUuid +
            '&size=' + sizePerPage +
            '&page=' + page +
            '&itemNo=' + no +
            '&itemName=' + name +
            '&resUuid=' + resUuid);
    };

    this.getByCatalogueAndChannel = function(catalogueUuid, channelUuid,resUuid) {
        var url = '/itemCatalogueDetails/channel/' + channelUuid + '?catalogueUuid=' + catalogueUuid + '&filterWithChannelPrice=0';
       if(resUuid !== undefined && resUuid !== null) {
           url = url + '&resUuid=' + resUuid;
       }
       return $http.get(Constant.BACKEND_BASE + url);

    };

    this.postByCatalogueAndChannel = function(catalogueUuid, channelUuid,resUuid) {
        var url = '/itemCatalogueDetails/channel/' + channelUuid + '?catalogueUuid=' + catalogueUuid + '&filterWithChannelPrice=0';
       if(resUuid !== undefined && resUuid !== null) {
           url = url + '&resUuid=' + resUuid;
       }
        console.log(url);
       return $http.post(Constant.BACKEND_BASE + url);

    };

    this.getByProduction = function(productionUuid, sizePerPage, page) {
        return $http.get(Constant.BACKEND_BASE + '/itemCatalogueDetails?itemUuid=' + productionUuid + '&size=' + sizePerPage + '&page=' + page);
    };

    this.addLink = function(catalogueUuid, itemUuid) {
        return $http.post(Constant.BACKEND_BASE + '/itemCatalogueDetails', {
            catalogueUuid: catalogueUuid,
            itemUuid: itemUuid
        });
    };

    this.delete = function(uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/itemCatalogueDetails/' + uuid);
    };

    this.modify = function(uuid, item) {
        return $http.patch(Constant.BACKEND_BASE + '/itemCatalogueDetails/' + uuid, item);
    };

    this.autoRelate = function (catalogueUuid) {
        var url = '/itemCatalogueDetails?action=autoRelate&catalogueUuid=' + catalogueUuid;
        console.log(url);
        return $http.post(Constant.BACKEND_BASE + url);

    };

    this.getAllByAppCatalogue = function (sizePerPage, page, channelUuid, endModifyDate, no, name, standard) {
        var url = '/itemCatalogueDetails?size=' + sizePerPage +
            '&page=' + page +
            '&channelUuid=' + channelUuid;
            '&endModifyDate=' + endModifyDate;

        if (no != undefined && no != null) {
            url = url + '&itemNo=' + no;
        }


        if (name != undefined && name != null) {
            url = url + '&itemName=' + name;
        }

        if (standard != undefined && standard != null && standard != '') {
            url = url + '&itemStandard=' + standard;
        }
        console.log(url);
        return $http.get(Constant.BACKEND_BASE + url);
    };
});

angular.module('IOne-Production').service('ProductionUnit', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, itemUuid) {
        return $http.get(Constant.BACKEND_BASE + '/plmUnits?itemUuid=' + itemUuid + '&size=' + sizePerPage + '&page=' + page);
    };

    this.add = function (unitInput) {
        return $http.post(Constant.BACKEND_BASE + '/plmUnits', unitInput);
    };

    this.modify = function (unitInput) {
        return $http.patch(Constant.BACKEND_BASE + '/plmUnits/' + unitInput.uuid, unitInput);
    };

    this.delete = function (unitUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/plmUnits/' + unitUuid);
    }
});

