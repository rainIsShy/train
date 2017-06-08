angular.module('IOne-Production').service('ChannelService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, channelName, channelNo, resUuid, groupEmployeeUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channels?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;
        if (channelName !== undefined && channelName !== null) {
            url = url + '&name=' + channelName;
        }

        if (channelNo !== undefined && channelNo !== null) {
            url = url + '&no=' + channelNo;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        if (groupEmployeeUuid !== undefined && groupEmployeeUuid !== null) {
            url = url + '&groupEmployeeUuid=' + groupEmployeeUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllGlobalQuery = function (sizePerPage, page, confirm, status, searchKeyword, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channels?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;
        if (searchKeyword !== undefined && searchKeyword !== null) {
            url = url + '&keyWord=' + searchKeyword;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/channels/' + uuid);
    };

    this.getWithNoChannelLevel = function (sizePerPage, page, confirm, status, searchKeyword, parentOcmBaseChanUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channels?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&isSetLevel=N';

        if (searchKeyword !== undefined && searchKeyword !== null) {
            url = url + '&keyWord=' + searchKeyword;
        }

        if (parentOcmBaseChanUuid !== undefined && parentOcmBaseChanUuid !== null) {
            url = url + '&parentOcmBaseChanUuid=' + parentOcmBaseChanUuid;
            return $http.get(Constant.BACKEND_BASE + url + '&action=lower')
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.syncChannelPrice = function (uuid) {
        return $http.patch(Constant.BACKEND_BASE + '/channels/' + uuid + '?action=syncChannelPrice');
    };

    this.modify = function (channelUuid, channelUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channels/' + channelUuid, channelUpdateInput);
    };
    this.getNotLowerChannel = function (sizePerPage, page, confirm, status, searchKeyword, resUuid, channelUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channels?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;
        if (searchKeyword !== undefined && searchKeyword !== null) {
            url = url + '&keyWord=' + searchKeyword;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        if (channelUuid !== undefined && channelUuid !== null) {
            url = url + '&channelUuid=' + channelUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url + '&action=lower');
    };

    this.getAllParent = function (sizePerPage, page, confirm, status, searchKeyword, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channels?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status
            + '&isShowParentChannel=Y';

        if (searchKeyword !== undefined && searchKeyword !== null) {
            url = url + '&keyWord=' + searchKeyword;
        }
        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

});

angular.module('IOne-Production').service('ChannelPriceService', function ($http, Constant) {
    this.getAll = function (channelUuid, resUuid) {
        var url = '/channelPrices?channelUuid=' + channelUuid + '&resUuid=' + resUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllWithPaging = function (sizePerPage, page, channelUuid, catalogueName, itemName, warehouseQueryUuid) {
        var url = '/channelPrices?size=' + sizePerPage
            + '&page=' + page
            + '&channelUuid=' + channelUuid;

        if (catalogueName !== undefined && catalogueName !== null) {
            url = url + '&catalogueName=' + catalogueName;
        }

        if (itemName !== undefined && itemName !== null) {
            url = url + '&itemName=' + itemName;
        }

        if (warehouseQueryUuid !== undefined && warehouseQueryUuid !== null) {
            url = url + '&warehouseUuid=' + warehouseQueryUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getByChannelUuidAndItemUuid = function (channelUuid, itemUuid) {
        var url = '/channelPrices?channelUuid=' + channelUuid + "&itemUuid=" + itemUuid + "&action=getValidateChannel";
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllCount = function (channelUuid) {
        var ChannelPriceQuery = {
            channelUuid: channelUuid
        };
        var url = '/channelPrices/' + channelUuid + '/count/';
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllCountByChannelUuid = function (channelUuid) {
        var ChannelPriceQuery = {
            channelUuid: channelUuid
        };
        var url = '/channels/' + channelUuid + '/count/';
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (ChannelPriceUuid) {
        return $http.get(Constant.BACKEND_BASE + '/channelPrices/' + ChannelPriceUuid);
    };

    this.add = function (ChannelPriceInput) {
        return $http.post(Constant.BACKEND_BASE + '/channelPrices/', ChannelPriceInput);
    };

    this.modify = function (ChannelPriceUuid, ChannelPriceUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelPrices/' + ChannelPriceUuid, ChannelPriceUpdateInput);
    };

    this.modifyAll = function (ChannelPriceUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelPrices/', ChannelPriceUpdateInput);
    };

    this.delete = function (ChannelPriceUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/channelPrices/' + ChannelPriceUuid);
    };


    this.copy = function (sourceChannelUuid, destChannelUuid) {
        return $http.post(Constant.BACKEND_BASE + '/channelPrices/' + sourceChannelUuid + '?replicateTo=' + destChannelUuid);
    };


    this.updateStandardPriceInBatch = function (channelUuid, catalogueName, itemName, warehouseUuid, standardPriceDiscountRate) {
        var url = '/channelPrices/batch?';
        var ChannelPriceBatchUpdateInput = {channelUuid: channelUuid};

        if (catalogueName !== undefined && catalogueName !== null) {
            ChannelPriceBatchUpdateInput.catalogueName = catalogueName;
        }

        if (itemName !== undefined && itemName !== null) {
            ChannelPriceBatchUpdateInput.itemName = itemName;
        }
        if (warehouseUuid !== undefined && warehouseUuid !== null) {
            ChannelPriceBatchUpdateInput.warehouseUuid = warehouseUuid;
        }
        if (standardPriceDiscountRate !== undefined && standardPriceDiscountRate !== null) {
            ChannelPriceBatchUpdateInput.standardPriceDiscountRate = standardPriceDiscountRate;
            return $http.patch(Constant.BACKEND_BASE + url, ChannelPriceBatchUpdateInput);
        }
    };

    this.updateSalePriceInBatch = function (channelUuid, catalogueName, itemName, warehouseUuid, saleDiscountRate) {
        var url = '/channelPrices/batch?';
        var ChannelPriceBatchUpdateInput = {channelUuid: channelUuid};

        if (catalogueName !== undefined && catalogueName !== null) {
            ChannelPriceBatchUpdateInput.catalogueName = catalogueName;
        }

        if (itemName !== undefined && itemName !== null) {
            ChannelPriceBatchUpdateInput.itemName = itemName;
        }
        if (warehouseUuid !== undefined && warehouseUuid !== null) {
            ChannelPriceBatchUpdateInput.warehouseUuid = warehouseUuid;
        }
        if (saleDiscountRate !== undefined && saleDiscountRate !== null) {
            ChannelPriceBatchUpdateInput.saleDiscountRate = saleDiscountRate;
            return $http.patch(Constant.BACKEND_BASE + url, ChannelPriceBatchUpdateInput);
        }
    };


    this.updateWarehouseInBatch = function (channelUuid, catalogueName, itemName, warehouseUuid, warehouseUpdatedUuid) {
        var url = '/channelPrices/batch?';
        var ChannelPriceBatchUpdateInput = {channelUuid: channelUuid};

        if (catalogueName !== undefined && catalogueName !== null) {
            ChannelPriceBatchUpdateInput.catalogueName = catalogueName;
        }

        if (itemName !== undefined && itemName !== null) {
            ChannelPriceBatchUpdateInput.itemName = itemName;
        }

        if (warehouseUuid !== undefined && warehouseUuid !== null) {
            ChannelPriceBatchUpdateInput.warehouseUuid = warehouseUuid;
        }

        if (warehouseUpdatedUuid !== undefined && warehouseUpdatedUuid !== null) {
            ChannelPriceBatchUpdateInput.warehouseUpdatedUuid = warehouseUpdatedUuid;
            return $http.patch(Constant.BACKEND_BASE + url, ChannelPriceBatchUpdateInput);
        }
    };

    this.deleteByChannel = function (channelUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/channelPrices?channelUuid=' + channelUuid);
    };


});


angular.module('IOne-Production').service('WarehousesService', function ($http, Constant) {
    this.getAll = function () {
        return $http.get(Constant.BACKEND_BASE + '/warehouses/');
    };
});


angular.module('IOne-Production').service('OCMParametersService', function ($http, Constant) {
    this.getAll = function () {
        return $http.get(Constant.BACKEND_BASE + '/ocmParameters/');
    };

    this.getAllWithPaging = function (sizePerPage, page, coefficient, discount) {
        var url = '/ocmParameters?size=' + sizePerPage
            + '&page=' + page;

        if (!isNaN(parseFloat(coefficient))) {
            url = url + '&standardPriceCoefficient=' + coefficient;
        }

        if (!isNaN(parseFloat(discount))) {
            url = url + '&saleDiscountRate=' + discount;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/ocmParameters/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/ocmParameters/' + uuid);
    };

    this.modify = function (uuid, parametersUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/ocmParameters/' + uuid, parametersUpdateInput);
    };

    this.add = function (parametersInput) {
        return $http.post(Constant.BACKEND_BASE + '/ocmParameters/', parametersInput);
    };
});

angular.module('IOne-Production').service('OCMChannelService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, channelFlag, keyWord, groupUser, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channels?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }

        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }

        if (channelFlag !== undefined && channelFlag !== null && channelFlag !== '' && channelFlag != 0) {
            url = url + '&channelFlag=' + channelFlag;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }

        if (groupUser !== undefined && groupUser !== null) {
            url = url + '&groupUser=' + groupUser;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getByNo = function (no) {
        return $http.get(Constant.BACKEND_BASE + '/channels?eqNo=' + no);
    };

    this.get = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/channels/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/channels/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channels/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/channels', AddInput);
    };

    this.findAreaAddress = function (uuid) {
        return $http.get(Constant.BACKEND_BASE + '/channels/' + uuid + '?action=findAreaAddress');
    }

});

angular.module('IOne-Production').service('OCMMallService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, mallFlag, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/malls?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }

        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }

        if (mallFlag !== undefined && mallFlag !== null && mallFlag !== '' && mallFlag != 0) {
            url = url + '&mallFlag=' + mallFlag;
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
        return $http.get(Constant.BACKEND_BASE + '/malls/' + uuid);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/malls/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/malls/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/malls', AddInput);
    };

});

angular.module('IOne-Production').service('OCMSupplierService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, supplyType, keyWord, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/suppliers?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no !== undefined && no !== null && no !== '') {
            url = url + '&no=' + no;
        }

        if (name !== undefined && name !== null && name !== '') {
            url = url + '&name=' + name;
        }

        if (supplyType !== undefined && supplyType !== null && supplyType !== '' && supplyType != 0) {
            url = url + '&supplyType=' + supplyType;
        }

        if (keyWord !== undefined && keyWord !== null && keyWord !== '') {
            url = url + '&keyWord=' + keyWord;
        }

        if (resUuid !== undefined && resUuid !== null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.get = function (uuid, supplyType) {
        var url = '/suppliers?uuid=' + uuid;
        if (supplyType !== undefined && supplyType !== null && supplyType !== '') {
            url = url + '&supplyType=' + supplyType;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/suppliers/' + uuid);
    };

    this.modify = function (uuid, UpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/suppliers/' + uuid, UpdateInput);
    };

    this.add = function (AddInput) {
        return $http.post(Constant.BACKEND_BASE + '/suppliers', AddInput);
    };

});

angular.module('IOne-Production').service('ChannelItemInfoService', function ($http, Constant) {
    this.getAll = function (channelUuid, resUuid) {
        var url = '/itemChannelRelations?channelUuid=' + channelUuid + '&resUuid=' + resUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllWithPaging = function (sizePerPage, page, channelUuid) {
        var url = '/itemChannelRelations?size=' + sizePerPage
            + '&page=' + page
            + '&channelUuid=' + channelUuid;


        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllCountByChannelUuid = function (channelUuid) {
        var ChannelPriceQuery = {
            channelUuid: channelUuid
        };
        var url = '/channels/' + channelUuid + '/count/';
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (ChannelPriceUuid) {
        return $http.get(Constant.BACKEND_BASE + '/itemChannelRelations/' + ChannelPriceUuid);
    };

    this.add = function (ChannelPriceInput) {
        return $http.post(Constant.BACKEND_BASE + '/itemChannelRelations/', ChannelPriceInput);
    };

    this.modify = function (ChannelPriceUuid, ChannelPriceUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/itemChannelRelations/' + ChannelPriceUuid, ChannelPriceUpdateInput);
    };

    this.modifyAll = function (ChannelPriceUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/itemChannelRelations/', ChannelPriceUpdateInput);
    };

    this.delete = function (ChannelPriceUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/itemChannelRelations/' + ChannelPriceUuid);
    };

    this.getByItem = function (channelUuid, itemUuid) {
        return $http.get(Constant.BACKEND_BASE + '/itemChannelRelations?channelUuid=' + channelUuid + '&itemUuid=' + itemUuid);
    };

});

angular.module('IOne-Production').service('ChannelLevelService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyword, parentKeyword, parentOcmBaseChanUuid, excludeChannelUuid, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channelLevels?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no != undefined && no != null && no != '') {
            url = url + '&no=' + no;
        }

        if (name != undefined && name != null && name != '') {
            url = url + '&name=' + name;
        }


        if (keyword != undefined && keyword != null && keyword != '') {
            url = url + '&keyword=' + keyword;
        }

        if (parentKeyword != undefined && parentKeyword != null && parentKeyword != '') {
            url = url + '&parentKeyword=' + parentKeyword;
        }

        if (parentOcmBaseChanUuid != undefined && parentOcmBaseChanUuid != null && parentOcmBaseChanUuid != '') {
            url = url + '&parentOcmBaseChanUuid=' + parentOcmBaseChanUuid;
        }

        if (excludeChannelUuid != undefined && excludeChannelUuid != null && excludeChannelUuid != '') {
            url = url + '&excludeChannelUuid=' + excludeChannelUuid;
        }

        if (resUuid != undefined && resUuid != null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.getAllNoPage = function (confirm, status, no, name, keyword, parentKeyword, parentOcmBaseChanUuid, excludeChannelUuid, resUuid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channelLevels?'
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no != undefined && no != null && no != '') {
            url = url + '&no=' + no;
        }

        if (name != undefined && name != null && name != '') {
            url = url + '&name=' + name;
        }


        if (keyword != undefined && keyword != null && keyword != '') {
            url = url + '&keyword=' + keyword;
        }

        if (parentKeyword != undefined && parentKeyword != null && parentKeyword != '') {
            url = url + '&parentKeyword=' + parentKeyword;
        }

        if (parentOcmBaseChanUuid != undefined && parentOcmBaseChanUuid != null && parentOcmBaseChanUuid != '') {
            url = url + '&parentOcmBaseChanUuid=' + parentOcmBaseChanUuid;
        }

        if (excludeChannelUuid != undefined && excludeChannelUuid != null && excludeChannelUuid != '') {
            url = url + '&excludeChannelUuid=' + excludeChannelUuid;
        }

        if (resUuid != undefined && resUuid != null) {
            url = url + '&resUuid=' + resUuid;
        }
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.getByChannelUuid = function (channelUuid) {
        return $http.get(Constant.BACKEND_BASE + '/channelLevels?channelUuid=' + channelUuid);
    };

    this.getByParentOcmBaseChanUuid = function (parentOcmBaseChanUuid) {
        return $http.get(Constant.BACKEND_BASE + '/channelLevels?parentOcmBaseChanUuid=' + parentOcmBaseChanUuid);
    };

    this.add = function (ChannelLevelInput) {
        return $http.post(Constant.BACKEND_BASE + '/channelLevels/', ChannelLevelInput);
    };

    this.modify = function (uuid, ChannelLevelUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelLevels/' + uuid, ChannelLevelUpdateInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/channelLevels/' + uuid);
    };

    this.validLoop = function (uuid, parentOcmBaseChanUuid) {
        return $http.get(Constant.BACKEND_BASE + '/channelLevels/' + uuid + '?action=valid&parentOcmBaseChanUuid=' + parentOcmBaseChanUuid);
    };

    this.getUnSetBrandByParent = function (sizePerPage, page, confirm, status, no, name, keyword, parentOcmBaseChanUuid, excludeBrandUUid) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/channelLevels?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no != undefined && no != null && no != '') {
            url = url + '&no=' + no;
        }

        if (name != undefined && name != null && name != '') {
            url = url + '&name=' + name;
        }


        if (keyword != undefined && keyword != null && keyword != '') {
            url = url + '&keyword=' + keyword;
        }


        if (parentOcmBaseChanUuid != undefined && parentOcmBaseChanUuid != null && parentOcmBaseChanUuid != '') {
            url = url + '&parentOcmBaseChanUuid=' + parentOcmBaseChanUuid;
        }

        if (excludeBrandUUid) {
            url = url + '&excludeBrandUUid=' + excludeBrandUUid;
        }


        return $http.get(Constant.BACKEND_BASE + url);
    };

});

angular.module('IOne-Production').service('ChannelRelationService', function ($http, Constant) {
    this.getAll = function (channelUuid, resUuid) {
        var url = '/channelRelations?channelUuid=' + channelUuid + '&resUuid=' + resUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllWithPaging = function (sizePerPage, page, channelUuid) {
        var url = '/channelRelations?size=' + sizePerPage
            + '&page=' + page
            + '&channelUuid=' + channelUuid;


        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.getAllCountByChannelUuid = function (channelUuid) {
        var ChannelPriceQuery = {
            channelUuid: channelUuid
        };
        var url = '/channelRelations/count?channelUuids=' + channelUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.get = function (channelRelationUuid) {
        return $http.get(Constant.BACKEND_BASE + '/channelRelations/' + channelRelationUuid);
    };

    this.add = function (channelRelationInput) {
        return $http.post(Constant.BACKEND_BASE + '/channelRelations/', channelRelationInput);
    };

    this.modify = function (channelRelationUuid, channelRelationUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelRelations/' + channelRelationUuid, channelRelationUpdateInput);
    };

    this.modifyAll = function (ChannelRelationUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelRelations/', ChannelRelationUpdateInput);
    };

    this.delete = function (channelRelationUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/channelRelations/' + channelRelationUuid);
    };


});

angular.module('IOne-Production').service('ChannelSeriesRelationService', function ($http, Constant) {
    this.getAll = function (channelUuid, resUuid) {
        var url = '/channelSeriesRelations?channelUuid=' + channelUuid + '&resUuid=' + resUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.getAllWithPaging = function (sizePerPage, page, channelUuid) {
        var url = '/channelSeriesRelations?size=' + sizePerPage
            + '&page=' + page
            + '&channelUuid=' + channelUuid;


        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.get = function (channelRelationUuid) {
        return $http.get(Constant.BACKEND_BASE + '/channelSeriesRelations/' + channelRelationUuid);
    };

    this.add = function (channelRelationInput) {
        return $http.post(Constant.BACKEND_BASE + '/channelSeriesRelations/', channelRelationInput);
    };

    this.modify = function (channelRelationUuid, channelRelationUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelSeriesRelations/' + channelRelationUuid, channelRelationUpdateInput);
    };

    this.modifyAll = function (channelRelationUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelSeriesRelations/', channelRelationUpdateInput);
    };

    this.delete = function (channelRelationUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/channelSeriesRelations/' + channelRelationUuid);
    };

});

angular.module('IOne-Production').service('ChannelWarehouseRelationService', function ($http, Constant) {
    this.getAll = function (channelUuid, resUuid) {
        var url = '/channelWarehouseRelations?channelUuid=' + channelUuid + '&resUuid=' + resUuid;
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.getAllWithPaging = function (sizePerPage, page, channelUuid) {
        var url = '/channelWarehouseRelations?size=' + sizePerPage
            + '&page=' + page
            + '&channelUuid=' + channelUuid;


        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.get = function (channelRelationUuid) {
        return $http.get(Constant.BACKEND_BASE + '/channelWarehouseRelations/' + channelRelationUuid);
    };

    this.add = function (channelRelationInput) {
        return $http.post(Constant.BACKEND_BASE + '/channelWarehouseRelations/', channelRelationInput);
    };

    this.modify = function (channelRelationUuid, channelRelationUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelWarehouseRelations/' + channelRelationUuid, channelRelationUpdateInput);
    };

    this.modifyAll = function (channelRelationUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/channelWarehouseRelations/', channelRelationUpdateInput);
    };

    this.delete = function (channelRelationUuid) {
        return $http.delete(Constant.BACKEND_BASE + '/channelWarehouseRelations/' + channelRelationUuid);
    };
});


angular.module('IOne-Production').service('ChannelPromotionService', function ($http, Constant) {
    this.getAll = function (sizePerPage, page, confirm, status, no, name, keyword, promotionDateBegin, promotionDateEnd, resUuid, channelUuid, purchaseDateBetween) {
        confirm = confirm == 0 ? '' : confirm;
        status = status == 0 ? '' : status;

        var url = '/promotions?size=' + sizePerPage
            + '&page=' + page
            + '&confirm=' + confirm
            + '&status=' + status;

        if (no != undefined && no != null && no != '') {
            url = url + '&no=' + no;
        }

        if (name != undefined && name != null && name != '') {
            url = url + '&name=' + name;
        }

        if (promotionDateBegin != undefined && promotionDateBegin != null && promotionDateBegin != '') {
            url = url + '&promotionDateBegin=' + promotionDateBegin;
        }

        if (promotionDateEnd != undefined && promotionDateEnd != null && promotionDateEnd != '') {
            url = url + '&promotionDateEnd=' + promotionDateEnd;
        }

        if (keyword != undefined && keyword != null && keyword != '') {
            url = url + '&keyword=' + keyword;
        }

        if (resUuid != undefined && resUuid != null) {
            url = url + '&resUuid=' + resUuid;
        }

        if (channelUuid) {
            url += '&channelUuid=' + channelUuid;
        }

        if (purchaseDateBetween) {
            url += '&purchaseDateBetween=' + purchaseDateBetween;
        }

        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.getByNo = function (no) {
        var url = '/promotions?no=' + no;
        return $http.get(Constant.BACKEND_BASE + url);
    };

    this.add = function (PromotionInput) {
        return $http.post(Constant.BACKEND_BASE + '/promotions/', PromotionInput);
    };

    this.modify = function (uuid, PromotionUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/promotions/' + uuid, PromotionUpdateInput);
    };

    this.delete = function (uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/promotions/' + uuid);
    };

});

angular.module('IOne-Production').service('PromotionProductService', function ($http, Constant) {
    this.get = function (masterUuid) {
        var url = '/promotions/' + masterUuid + '/products';
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.add = function (masterUuid, PromotionProductDetailInput) {
        return $http.post(Constant.BACKEND_BASE + '/promotions/' + masterUuid + '/products', PromotionProductDetailInput);
    };

    this.modify = function (masterUuid, uuid, PromotionProductUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/promotions/' + masterUuid + '/products/' + uuid, PromotionProductUpdateInput);
    };

    this.delete = function (masterUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/promotions/' + masterUuid + '/products/' + uuid);
    };


});

angular.module('IOne-Production').service('PromotionChannelService', function ($http, Constant) {
    this.get = function (masterUuid) {
        var url = '/promotions/' + masterUuid + '/channels';
        return $http.get(Constant.BACKEND_BASE + url);
    };


    this.add = function (masterUuid, PromotionChannelDetailInput) {
        return $http.post(Constant.BACKEND_BASE + '/promotions/' + masterUuid + '/channels', PromotionChannelDetailInput);
    };

    this.modify = function (masterUuid, uuid, PromotionChannelUpdateInput) {
        return $http.patch(Constant.BACKEND_BASE + '/promotions/' + masterUuid + '/channels/' + uuid, PromotionChannelUpdateInput);
    };

    this.delete = function (masterUuid, uuid) {
        return $http.delete(Constant.BACKEND_BASE + '/promotions/' + masterUuid + '/channels/' + uuid);
    };


});