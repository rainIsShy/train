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


    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: '452A0E53-2BAD-44F3-BD75-DE919C1C9DAC'},
        '101-delete': {display: true, name: '删除', uuid: 'BF6AC3DC-D9C5-400C-8C66-D9FCF74E49A1'},
        '102-edit': {display: true, name: '编辑', uuid: '169AA869-6A62-4287-9136-40886E7246ED'},

        '200-cancel': {display: true, name: '取消新增', uuid: '8536C6CE-75F0-46F4-9CFA-A3DE2AB371CE'},
        '201-save': {display: true, name: '保存', uuid: 'C03E7689-267F-4A6B-AA7D-88A99C9CEFF0'},


        '302-save': {display: true, name: '保存', uuid: '01673539-3C67-4E76-B616-3767B07E6922'},
        '303-cancel': {display: true, name: '取消修改', uuid: 'FD70B726-FF76-45B4-B667-BB778B3C2AA9'},
        '304-quit': {display: true, name: '退出编辑', uuid: '63367BAD-6D79-4994-B420-EBFAA30D8357'},

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

        if (!$scope.priceCoefficient) {
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

    $scope.openProductionSelectDlg = function () {
        $mdDialog.show({
            controller: 'AddBrandController',
            templateUrl: 'app/src/app/ocm/channelBrand/addChannelBrandRelation.html',
            parent: angular.element(document.body),
            //targetEvent: event,
            locals: {
                Series: $scope.selectedItem,
                channel: $scope.selectedItem,
                listFilterItem: $scope.listFilterItem.itemUuids,
                op: 'add'
            }
        }).then(function (data) {
            $scope.logining = true;
            $scope.populateChannelRelation(data);
        });
    };

    $scope.populateChannelRelation = function (data) {
        $scope.logining = false;
        $scope.queryChannelRelationWithPaging();
    };


    $scope.preAddMenuAction = function () {
        $scope.openProductionSelectDlg();
    };


    $scope.addMenuAction = function () {
        if ($scope.channelRelationList.content != undefined && $scope.channelRelationList.content.length > 0) {
            var promises = [];

            angular.forEach($scope.channelRelationList.content, function (channelRelation) {
                channelRelation.channelUuid = $scope.selectedItem.uuid;
                channelRelation.seriesUuid = channelRelation.series.uuid;
                var channelRelationResponse = ChannelSeriesRelationService.add(channelRelation).error(function (data) {
                    $scope.showError("重复添加");
                });
                promises.push(channelRelationResponse);
            });

            $q.all(promises).then(function (data) {
                $scope.showInfo('新增渠道区域信息成功。');
                $scope.editItem($scope.selectedItem);
            }, function (data) {
                $scope.showInfo('新增渠道区域信息完成。');
                $scope.editItem($scope.selectedItem);
            });
        } else {
            $scope.channelRelationList = $scope.ExistedChannelRelationList;
        }
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.cancelAddMenuAction = function () {
        $scope.editItem($scope.selectedItem);
    };

    $scope.deleteMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除的渠道区域信息不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelItemInfo) {
                        var response = ChannelSeriesRelationService.delete(channelItemInfo.uuid).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('删除数据成功。');
                        $scope.editItem($scope.selectedItem);
                    });
                }
            });
        }
    };

});

angular.module('IOne-Production').controller('AddBrandController', function ($scope, $q, $mdToast, $mdDialog, BrandFile, ChannelBrandRelationsService, Constant, channel, listFilterItem) {
    $scope.listFilterItem = listFilterItem;
    $scope.channel = channel;
    $scope.pageOptionForProd = {
        sizePerPage: 1000,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.editItem = function (channel) {
        $scope.selectedItem = channel;
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
    };


    $scope.resetInitialValue = function () {
        $scope.revert_audit_button_disabled = 0;
        $scope.audit_button_disabled = 0;
        $scope.valid_status_button_disabled = 0;
        $scope.invalid_status_button_disabled = 0;
    };

    $scope.ocmListMenu = {
        selectAll: true,
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        showQueryBar: true
    };

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[1].value,
        confirm: Constant.CONFIRM[2].value,
        release: Constant.RELEASE[2].value
    };

    $scope.$watch('listFilterOption', function () {
        $scope.refreshAllTemplate();
    }, true);

    $scope.selectedTemplateData = {};


    $scope.refreshAllTemplate = function () {
        ChannelBrandRelationsService.getAllWithPaging($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.channel.uuid)
            .success(function (data) {
                $scope.channelRelationList = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;

                BrandFile.getAll(100, 0).success(function (data) {
                    var dataResult = [];
                    angular.forEach(data.content, function (item) {
                        if ($scope.listFilterItem.indexOf(item.uuid) == -1) {
                            dataResult.push(item);
                        }
                    });
                    if ($scope.channelRelationList.content.length == 0) {
                        $scope.allProductionsData = dataResult;
                        $scope.pageOption.totalPage = data.totalPages;
                        $scope.pageOption.totalElements = data.totalElements;
                    } else {
                        angular.forEach($scope.channelRelationList.content, function (item2) {
                            for (var i = 0; i < dataResult.length - 1; i++) {
                                if (item2.series.uuid == dataResult[i].uuid) {
                                    dataResult.splice(i, 1);
                                }
                            }
                            $scope.allProductionsData = dataResult;
                            $scope.pageOption.totalPage = data.totalPages;
                            $scope.pageOption.totalElements = data.totalElements;
                        });
                    }
                });
            });

        $scope.selectedItem = null;
        $scope.selectedTemplateNode = null;
        $scope.selectedTemplateNodeData = null;
        $scope.selectedTemplateNodeDataUuid = null;
    };

    $scope.select = function (selectedObject) {
        if (selectedObject.length == 0) {
            toastr["warning"]("请选择需要关联的系列");
        } else {
            $scope.selectedTemplateNode = selectedObject;
            $mdDialog.hide($scope.selectedTemplateNode);
            if ($scope.selectedTemplateNode != undefined && $scope.selectedTemplateNode.length > 0) {
                var promises = [];

                angular.forEach($scope.selectedTemplateNode, function (channelRelation) {
                    channelRelation.channelUuid = $scope.channel.uuid;
                    channelRelation.seriesUuid = channelRelation.uuid;
                    var channelRelationResponse = ChannelBrandRelationsService.add(channelRelation).error(function (data) {
                        toastr["error"]("重复添加");
                    });
                    promises.push(channelRelationResponse);
                });

                $q.all(promises).then(function (data) {
                    toastr["success"]("新增渠道区域信息成功。");
                    $scope.editItem($scope.selectedItem);
                }, function (data) {
                    toastr["success"]('新增渠道区域信息完成。');
                    $scope.editItem($scope.selectedItem);
                });
            } else {
                $scope.channelRelationList = $scope.ExistedChannelRelationList;
            }
            $scope.cancelDlg();
            $scope.editItem($scope.channel);
        }
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

    $scope.selected = [];

    $scope.addSeriesToggle = function (item, selected) {
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

    $scope.selectAllMenuAction = function (no, name) {
        if ($scope.ocmListMenu.selectAll == true) {
            $scope.selected = [];
            if (no == undefined && name == undefined) {
                angular.forEach($scope.allProductionsData, function (item) {
                    $scope.selected.push(item);
                    $scope.ocmListMenu.selectAll = false;
                });
            }

            angular.forEach($scope.allProductionsData, function (item) {
                if (item.no.indexOf(no) > -1 || item.name.indexOf(name) > -1) {
                    $scope.selected.push(item);
                }
                $scope.ocmListMenu.selectAll = false;
            });

        } else if ($scope.ocmListMenu.selectAll == false) {
            $scope.selected = [];
            $scope.ocmListMenu.selectAll = true;
        }
    };
});
