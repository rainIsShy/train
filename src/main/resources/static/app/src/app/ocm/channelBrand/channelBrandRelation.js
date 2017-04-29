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
        '100-add': {display: true, name: '新增', uuid: '10dece1d-3a54-4d23-a41e-9419b42efe66'},
        '101-delete': {display: true, name: '删除', uuid: '58516534-9c0b-46ea-b000-82b03ca79f97'},
        '102-edit': {display: true, name: '编辑', uuid: 'af9c186a-08f5-48d7-9249-36e4985f5cda'},

        '200-cancel': {display: true, name: '取消新增', uuid: '0c637a24-9692-42e6-a431-22fc5c5bdd24'},
        '201-save': {display: true, name: '保存', uuid: 'aaf72666-02bf-4073-b692-44b42759a029'},


        '302-save': {display: true, name: '保存', uuid: 'a4b3b116-409a-49d6-ad05-4237143f9413'},
        '303-cancel': {display: true, name: '取消修改', uuid: '66b7ae2c-8fae-4f04-a80a-25cb79ce793d'},
        '304-quit': {display: true, name: '退出编辑', uuid: '0d290203-dc51-4b9f-bf4f-197d80f3e677'},

        '600-query': {display: true, name: '查询', uuid: '6d9a8d23-85c8-4bda-a40c-718df09ee765'},
        '601-selectAll': {display: false, name: '全选', uuid: '290387e5-185b-40bc-8534-db2249048ef1'},
        '602-execute': {display: true, name: '执行', uuid: '11d9eafb-ad7b-408b-8ac7-a386cdec2171'},

        '611-selectAll': {display: true, name: '全选', uuid: '53eac324-6a60-4fa4-803e-913117f1f229'},
        '612-audit': {display: true, name: '审核', uuid: 'ce9db12c-4d83-4cbd-9f8b-d84ad7280022'},
        '613-revertAudit': {display: true, name: '取消审核', uuid: '129a721f-e0de-4edf-8567-7d227c0d03d2'},
        '614-valid': {display: true, name: '有效', uuid: '4c064386-ef2c-4738-9e44-ad4b578c45d2'},
        '615-invalid': {display: true, name: '无效', uuid: 'da7f191e-a3bc-47bd-aa0b-f1243aa81a64'}
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
        ChannelBrandRelationsService.getAllWithPaging($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '', $scope.selectedItem.uuid, '', '', 'N')
            .success(function (data) {
                $scope.channelRelationList = data;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
            });
    };

    $scope.searchChannelRelationWithPaging = function (no, name) {
        ChannelBrandRelationsService.getAllWithPaging($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '', $scope.selectedItem.uuid, no, name, 'N')
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
                    ChannelBrandRelationsService.getAllByChannelUuid(channel.uuid, '', 'N', RES_UUID_MAP.OCM.CHANNEL_BRAND_RELATION.LIST_PAGE.RES_UUID).success(function (data) {
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
            targetEvent: event,
            locals: {
                Series: $scope.selectedItem,
                channel: $scope.selectedItem,
                listFilterItem: $scope.listFilterItem.itemUuids,
                op: 'add'
            }
        }).then(function (data) {
            $scope.editItem($scope.selectedItem);

        });

    };

    $scope.populateChannelRelation = function (data) {
        $scope.logining = false;
        $scope.queryChannelRelationWithPaging();
    };


    $scope.preAddMenuAction = function () {
        $scope.openProductionSelectDlg();
    };



    $scope.deleteMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除的渠道信息不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelItemInfo) {
                        var response = ChannelBrandRelationsService.delete(channelItemInfo.uuid).success(function (data) {
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

    $scope.selectAllMenuAction = function () {
        if ($scope.ocmListMenu.selectAll == true) {
            $scope.selected = [];
            if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                angular.forEach($scope.channelRelationList.content, function (item) {
                    $scope.selected.push(item);
                });
                $scope.changeButtonStatus();
            } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                angular.forEach($scope.ChannelList.content, function (item) {
                    $scope.selected.push(item);
                });
            }
        } else if ($scope.ocmListMenu.selectAll == false) {
            $scope.selected = [];
        }
    };

    $scope.changeButtonStatus = function () {
        $scope.resetInitialValue();
        var firstLoop = true;
        // only channel price will come into this logic
        angular.forEach($scope.selected, function (channelRelation) {
            $scope.changeButtonStatusByConfirm(channelRelation);
            $scope.changeButtonStatusByStatus(channelRelation);
            if (firstLoop) {
                firstLoop = false;
                $scope.firstLoopStatus = channelRelation.status;
                $scope.firstLoopConfirm = channelRelation.confirm;
            } else {
                if ($scope.firstLoopStatus !== channelRelation.status) {
                    $scope.valid_status_button_disabled = 1;
                    $scope.invalid_status_button_disabled = 1;
                }
                if ($scope.firstLoopConfirm !== channelRelation.confirm) {
                    $scope.audit_button_disabled = 1;
                    $scope.revert_audit_button_disabled = 1;
                }
            }
        });
    };

    $scope.validStatusMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelRelation) {
                        var ChannelRelationUpdateInput = {
                            status: Constant.STATUS[1].value
                        };
                        var response = ChannelBrandRelationsService.modify(channelRelation.uuid, ChannelRelationUpdateInput).success(function () {

                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.editItem($scope.selectedItem);
                    })
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channel) {

                        var ChannelRelationUpdateInput = {
//                            channelUuid: channel.uuid,
                            status: Constant.STATUS[1].value
                        };
                        var response = ChannelService.modify(channel.uuid, ChannelRelationUpdateInput).success(function (data) {
                        });
                        promises.push(response);

                    });
                    $q.all(promises).then(function (data) {
                        $scope.showInfo('修改数据成功。');
                        $scope.queryMenuAction();
                    })
                }
            });
        }

    };

    $scope.invalidStatusMenuAction = function () {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
                if ($scope.ui_status == Constant.UI_STATUS.PRE_EDIT_UI_STATUS && $scope.selectedTabIndex == 1) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channelRelation) {
                        console.log(channelRelation);
                        var channelRelationUpdateInput = {
                            status: Constant.STATUS[2].value
                        };
                        var response = ChannelBrandRelationsService.modify(channelRelation.uuid, channelRelationUpdateInput).success(function () {

                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.editItem($scope.selectedItem);
                    })
                } else if ($scope.ui_status == Constant.UI_STATUS.VIEW_UI_STATUS && $scope.selectedTabIndex == 0) {
                    var promises = [];
                    angular.forEach($scope.selected, function (channel) {
                        var channelRelationUpdateInput = {
                            status: Constant.STATUS[2].value
                        };
                        var response = ChannelService.modify(channel.uuid, channelRelationUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.queryMenuAction();
                    })
                }
            });
        }

    };

});

angular.module('IOne-Production').controller('AddBrandController', function ($scope, $q, $mdToast, $mdDialog, BrandFile, ChannelBrandRelationsService, Constant, channel, listFilterItem) {
    $scope.listFilterItem = listFilterItem;
    $scope.channel = channel;
    $scope.pageOptionForProd = {
        sizePerPage: 10,
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
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0

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
        BrandFile.getUnuseBrandByChannelUuid($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.channel.uuid).success(function (data) {
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.allProductionsData = data.content;
        });

    };

    $scope.save = function () {
        if ($scope.selected.length == 0) {
            toastr["warning"]("请选择需要关联的品牌");
        } else {
            var promises = [];
            angular.forEach($scope.selected, function (item) {
                var addObject = {
                    brandUuid: item.uuid,
                    priceCoefficient: 1,
                    status: "1",
                    channelUuid: $scope.channel.uuid
                };
                var channelRelationResponse = ChannelBrandRelationsService.add(addObject).error(function (data) {
                    toastr["error"]("请选择需要关联的品牌");
                });
                promises.push(channelRelationResponse);
            });


            $q.all(promises).then(function () {
                toastr["success"]("新增渠道品牌成功");
                $scope.cancelDlg();
                $scope.editItem($scope.channel);
            });


        }
    };

    $scope.cancelDlg = function () {
        $mdDialog.hide();
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
        console.log($scope.selected);
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
