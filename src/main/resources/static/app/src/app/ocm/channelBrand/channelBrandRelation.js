angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/channelBrandRelation', {
        controller: 'ChannelBrandRelationController',
        templateUrl: 'app/src/app/ocm/channelBrand/channelBrandRelation.html'
    })
}]);

angular.module('IOne-Production').controller('ChannelBrandRelationController', function ($scope, $q, ChannelService, ChannelBrandRelationsService, $mdDialog, Constant) {
    //initial model value

    $scope.listFilterItem = {
        itemUuids: []
    };

    $scope.ocmListMenu = {
        selectAll: false,
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        showQueryBar: true
    };


    $scope.menuDisplayOption = {
        '600-query': {display: true, name: '查询', uuid: '6d9a8d23-85c8-4bda-a40c-718df09ee765'},
        '601-selectAll': {display: false, name: '全选', uuid: '290387e5-185b-40bc-8534-db2249048ef1'},
        '602-execute': {display: true, name: '执行', uuid: '11d9eafb-ad7b-408b-8ac7-a386cdec2171'},
    };


    $scope.queryPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.editItem = function (channelRelation) {
        $scope.selectedItem = channelRelation;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.pageOption.totalElements = 0;
        $scope.listFilterItem.itemUuids.length = 0;
        $scope.queryChannelRelationWithPaging();
    };

    $scope.queryChannelRelationWithPaging = function () {
        ChannelBrandRelationsService.getAllWithPaging($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '1', $scope.selectedItem.uuid)
            .success(function (data) {
                $scope.channelRelationList = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
            });
    };

    $scope.searchChannelRelationWithPaging = function (no, name) {
        ChannelBrandRelationsService.getAllWithPaging($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '1', $scope.selectedItem.uuid, no, name)
            .success(function (data) {
                var dataResult = [];

                $scope.channelRelationList.content = data.content;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
            });
    };


    $scope.queryMenuAction = function () {
        $scope.selected = [];
        confirm = $scope.ocmListMenu.confirm;
        status = '1';

        ChannelService.getAll($scope.queryPageOption.sizePerPage, $scope.queryPageOption.currentPage, confirm,
            status, $scope.ocmListMenu.channelName, $scope.ocmListMenu.channelNo, RES_UUID_MAP.OCM.CHANNEL_BRAND_RELATION.LIST_PAGE.RES_UUID)
            .success(function (data) {
                $scope.ChannelList = data;
                $scope.queryPageOption.totalPage = data.totalPages;
                $scope.queryPageOption.totalElements = data.totalElements;
                angular.forEach($scope.ChannelList.content, function (channel) {
                    ChannelBrandRelationsService.getAllByChannelUuid(channel.uuid, '1', RES_UUID_MAP.OCM.CHANNEL_BRAND_RELATION.LIST_PAGE.RES_UUID).success(function (data) {
                        channel.count = data.content.length;
                    });
                });
            });
    };


    $scope.listTabSelected = function () {
        $scope.ocmListMenu.showQueryBar = true;
        $scope.queryMenuAction();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
        $scope.selected = [];
        $scope.channelRelationList = [];
        $scope.selectedItem = null;
        $scope.areaCode = null;
        $scope.areaName = null;

        $scope.getMenuAuthData($scope.RES_UUID_MAP.OCM.CHANNEL_BRAND_RELATION.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };


    $scope.formTabSelected = function () {
        $scope.ocmListMenu.showQueryBar = false;
        $scope.selected = [];
        $scope.getMenuAuthData($scope.RES_UUID_MAP.OCM.CHANNEL_BRAND_RELATION.FORM_PAGE.RES_UUID).success(function (data) {
            $scope.menuAuthDataMap = $scope.menuDataMap(data);
        });
    };

    $scope.selected = [];

    $scope.selectAllAction = function () {
        $scope.selected = [];
        if ($scope.ocmListMenu.selectAll == true) {

            angular.forEach($scope.channelRelationList.content, function (item) {
                $scope.selected.push(item);
            });
        }

    };

    $scope.toggle = function (item, selected) {
        var idx = selected.indexOf(item);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(item);
        }
    };

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };


    $scope.updateInBatch = function () {

        if ($scope.priceCoefficient) {
            $scope.showError('请输入定价系数维护!');
            return;
        }

        if ($scope.selected.length <= 0) {
            $scope.showError('请选择要维护的品牌!');
            return;
        }

        $scope.logining = true;
        var promises = [];
        var brands = [];
        angular.forEach($scope.selected, function (data) {
            brands.push(data.brand.uuid);

            var updateInput = {
                priceCoefficient: $scope.priceCoefficient
            };

            var response = ChannelBrandRelationsService.modify(data.uuid, updateInput).success(function (data) {
            });

            promises.push(response);
        });

        $q.all(promises).then(function () {

            $scope.searchChannelRelationWithPaging('', '');
            var confirm = $scope.showConfirm('是否根据当前定价系数调整商品标准定价？', '', function () {
                ChannelBrandRelationsService.updatePrice($scope.selectedItem.uuid, brands).success(function () {
                    $scope.showInfo('修改定价成功。');
                    $scope.logining = false;

                    $scope.selected = [];
                    $scope.ocmListMenu.selectAll = false;
                });
            }, function () {
                $scope.showInfo('修改定价系数成功。');
                $scope.logining = false;
                $scope.ocmListMenu.selectAll = false;
                $scope.selected = [];
            });


        })
    };


});
