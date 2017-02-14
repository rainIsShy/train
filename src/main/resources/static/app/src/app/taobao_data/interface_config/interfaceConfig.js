angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eps/interface_config', {
        controller: 'EPSInterfaceConfigController',
        templateUrl: 'app/src/app/taobao_data/interface_config/interfaceConfig.html'
    })
}]);

angular.module('IOne-Production').controller('EPSInterfaceConfigController', function ($scope, TaoBaoAdapterService, ChannelService, OCMMallService, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.PLATFORM = {
       0:  '全部',
       'TAOBAO': '淘宝',
       'JD': '京东',
       'VIP': '唯品会'
    };

    $scope.listFilterOption = {
        select: {
            status: Constant.STATUS[0].value,
            confirm: Constant.CONFIRM[0].value,
            platform: $scope.PLATFORM[0].value
        },
        no: '',
        name: '',
        keyWord: ''
    };

    $scope.menuDisplayOption = {
        'switchConfirm': {display: true, name: '审核/取消审核', uuid: 'A80BE209-A07E-40B9-AD8C-46187F222FB7'},
        'switchStatus': {display: true, name: '启用/禁用', uuid: 'BCAF039D-986D-4F76-A30E-673758E0DBEA'},

        'batchConfirm': {display: true, name: '批量审核', uuid: '7E2FA306-EE27-47F2-A515-5BE82945C59D'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: 'FF5B0A5B-9941-4CD6-9DDE-AB409C73A0AE'},
        'batchStatus': {display: true, name: '批量启用', uuid: 'EAB309B1-905E-419F-A91F-21E4239821F4'},
        'batchRevertStatus': {display: true, name: '批量禁用', uuid: '8A9D6D84-EB71-4701-92F7-6C5EE4832AFA'},
        'batchDelete': {display: true, name: '批量删除', uuid: 'D44F7536-A58A-46C4-A0D0-11EFB1F01EEB'},

        'detailConfirm': {display: true, name: '审核', uuid: '8EC2932A-B8D1-4B5E-B743-F06D46263104'},
        'detailRevertConfirm': {display: true, name: '取审', uuid: 'B08C5D94-AAF9-443D-B560-55AD95410AA6'},
        'detailStatus': {display: true, name: '启用', uuid: '3D62CE5E-DF9D-4AD0-ACF4-9A1802999E7B'},
        'detailRevertStatus': {display: true, name: '禁用', uuid: '55886AC8-6609-4483-AAD4-F3D63860109F'},
        'detailDelete': {display: true, name: '删除', uuid: '0362DD0E-8804-49FE-89A8-950F6E6F0CF7'}

    };

    $scope.disabledBatchConfirm = true;
    $scope.disabledBatchCancelConfirm = true;
    $scope.disabledBatchStatus = true;
    $scope.disabledBatchCancelStatus = true;
    $scope.disabledBatchDelete = true;

    $scope.sortByField = 'no';

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.interfaceList = [{"interface" : 'jd'},{"interface" : 'taobao'},{"interface" : 'vip'}];
    $scope.refreshList = function () {
        //EPSInterfaceConfigService.getAll
        angular.forEach($scope.interfaceList,function(interfaceItem){
        $scope.interfaceItemList = [];
        TaoBaoAdapterService.queryConfig($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.select.confirm, $scope.listFilterOption.select.status,
            $scope.listFilterOption.select.platform, $scope.listFilterOption.no, $scope.listFilterOption.name, $scope.listFilterOption.keyWord, $scope.RES_UUID_MAP.EPS.INTERFACE_CONFIG.RES_UUID, interfaceItem.interface)
            .success(function (data) {
                $scope.itemList = data;
                $scope.pageOption.totalPage = 1;
                $scope.pageOption.totalElements = data.length;
                $scope.selectAllFlag = false;
                $scope.selectedItemSize = 0;

                angular.forEach($scope.itemList,function(itemPush){
                    $scope.interfaceItemList.push(itemPush);
                });
                if (data.length > 0) {
                    angular.forEach(data, function (item) {
                        if (angular.isDefined(item.ocmBaseChanUuid) && item.ocmBaseChanUuid != null) {
                            ChannelService.get(item.ocmBaseChanUuid).success(function (data) {
                                item.channel = data;
                            });
                        }
                        if (angular.isDefined(item.ocmBaseMallUuid) && item.ocmBaseMallUuid != null) {
                            OCMMallService.get(item.ocmBaseMallUuid).success(function (data) {
                                item.mall = data;
                            });
                        }
                    });
                }
            });
        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.EPS.INTERFACE_CONFIG.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });

    $scope.$watch('listFilterOption.select', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.queryEnter = function (e) {
        if (e.keyCode === 13) {
            $scope.pageOption.currentPage = 0;
            $scope.pageOption.totalPage = 0;
            $scope.pageOption.totalElements = 0;
            $scope.refreshList();
        }
    };

    $scope.selectAllFlag = false;
    $scope.selectedItemSize = 0;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        item.detailList = $scope.subItemList;
        $scope.displayAdvancedSearPanel = false;
    };

    /**
     * Show advanced search panel which you can add more search condition
     */
    $scope.showAdvancedSearchAction = function () {
        $scope.displayAdvancedSearPanel = !$scope.displayAdvancedSearPanel;
        $scope.selectedItem = null;
    };

    /**
     * Show more panel when clicking the 'show more' on every item
     */
    $scope.toggleMorePanelAction = function (item) {
        item.showMorePanel = !item.showMorePanel;

        if (item.showMorePanel) {
            item.detailList = item;
        }
    };

    /**
     * Toggle the advanced panel for detail item in the list
     */
    $scope.toggleDetailMorePanelAction = function (detail) {
        detail.showMorePanel = !detail.showMorePanel;
    };

    /**
     * Change status to list all items
     */
    $scope.listItemAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
        $scope.refreshList();
    };

    $scope.hideItemDetailsAction = function (event) {
        $scope.stopEventPropagation(event);
        $scope.selectedItem = null;
        $scope.refreshList();
    };

    /**
     * Set stauts to 'edit' to edit an object. The panel will be generated automatically.
     */
    $scope.editItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'edit';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
        $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
    };

    /**
     * Add new item which will take the ui to the edit page.
     */
    $scope.preAddItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'add';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
    };

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.source.confirm == '2' && $scope.source.status == '2') {
            $scope.showError("不允许状态是已审核又无效,请调整后再保存");
            return;
        }
        if ($scope.status == 'add') {
            if ($scope.domain == 'EPS_BASE_INTERFACE_CONF') {
                if (angular.isDefined($scope.source.channel)) {
                    $scope.source.ocmBaseChanUuid = $scope.source.channel.uuid;
                    $scope.source.ocmChanUuid = $scope.source.channel.uuid;
                }
                if (angular.isDefined($scope.source.mall)) {
                    $scope.source.ocmBaseMallUuid = $scope.source.mall.uuid;
                }
                var itemList = [];
                $scope.source.status= 2;
                $scope.source.confirm= 1;
                itemList.push($scope.source);
                $scope.ecTypeNo = $scope.source.mall.no.toLocaleLowerCase();
                TaoBaoAdapterService.insertConfig(itemList[0], $scope, $scope.ecTypeNo, function (response) {
                    $scope.showInfo("新增成功");
                });
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'EPS_BASE_INTERFACE_CONF') {
                if (angular.isDefined($scope.source.channel)) {
                    $scope.source.ocmBaseChanUuid = $scope.source.channel.uuid;
                    $scope.source.ocmChanUuid = $scope.source.channel.uuid;
                }
                if (angular.isDefined($scope.source.mall)) {
                    $scope.source.ocmBaseMallUuid = $scope.source.mall.uuid;
                }
                var itemList = [];
                itemList.push($scope.source);
                $scope.updateEcTypeNo = $scope.source.ecTypeNo.toLocaleLowerCase();
                TaoBaoAdapterService.updateConfig(itemList[0], $scope, $scope.updateEcTypeNo, $scope.source.uuid, function (data) {
                    $scope.showInfo("修改成功");
                });
            }
        }
    };

    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {
        //TODO ...
    };

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        item.selectedRef = !item.selected;

        if (item.selected == false
            || item.selected == undefined
            || item.selected == null) {
            $scope.selectedItemSize += 1;
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectAllFlag = false;
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == Constant.CONFIRM[2].value) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                var UpdateInput = item;
                item.confirm = Constant.CONFIRM[1].value;
                var itemList = [];
                itemList.push(UpdateInput);
                TaoBaoAdapterService.updateConfig(itemList, $scope, function (response) {
                    item.confirm = Constant.CONFIRM[1].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo("取消审核成功");
                });
            });
        } else {
            $scope.showConfirm('确认审核吗？', '', function () {
                var UpdateInput = item;
                item.confirm = Constant.CONFIRM[2].value;
                var itemList = [];
                itemList.push(UpdateInput);
                TaoBaoAdapterService.updateConfig(itemList, $scope, function (response) {
                    item.confirm = Constant.CONFIRM[2].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo("审核成功");
                });
            });
        }
    };

    $scope.confirmSwitchAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == Constant.CONFIRM[2].value) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                var UpdateInput = item;
                item.confirm = Constant.CONFIRM[1].value;
                var itemList = [];
                itemList.push(UpdateInput);
                $scope.cancelConfirmEcTypeNo = UpdateInput.ecTypeNo.toLocaleLowerCase();
                TaoBaoAdapterService.updateConfig(itemList, $scope, $scope.cancelConfirmEcTypeNo, UpdateInput.uuid, function (response) {
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo("取消审核成功");
                });
            }, function () {
                item.confirm = Constant.CONFIRM[2].value
            });
        } else {
            if (item.status == Constant.STATUS[2].value) {
                $scope.showWarn("项目是失效状态,请先启用后再审核");
                item.confirm = Constant.CONFIRM[2].value;
                return;
            }
            $scope.showConfirm('确认审核吗？', '', function () {
                var UpdateInput = item;
                item.confirm = Constant.CONFIRM[2].value;
                var itemList = [];
                itemList.push(UpdateInput);
                $scope.confirmEcTypeNo = UpdateInput.ecTypeNo.toLocaleLowerCase();
                TaoBaoAdapterService.updateConfig(itemList, $scope, $scope.confirmEcTypeNo, UpdateInput.uuid, function (response) {
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo("审核成功");
                });
            }, function () {
                item.confirm = Constant.CONFIRM[1].value;
            });
        }

    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == Constant.STATUS[1].value) {
            $scope.showConfirm('确认改为失效吗？', '', function () {
                var UpdateInput = item;
                item.status = Constant.STATUS[2].value;
                item.confirm = Constant.CONFIRM[1].value;
                var itemList = [];
                itemList.push(UpdateInput);
                TaoBaoAdapterService.updateConfig(itemList, $scope, function (response) {
                    item.status = Constant.STATUS[2].value;
                    item.confirm = Constant.CONFIRM[1].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo("修改为失效成功");
                });
            });
        } else {
            $scope.showConfirm('确认改为生效吗？', '', function () {
                var UpdateInput = item;
                item.status = Constant.STATUS[1].value;
                var itemList = [];
                itemList.push(UpdateInput);
                TaoBaoAdapterService.updateConfig(itemList, $scope, function (response) {
                    item.status = Constant.STATUS[1].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('修改为生效成功！');
                });
            });
        }
    };

    $scope.statusSwitchAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == Constant.STATUS[2].value) {
            $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
                var UpdateInput = item;
                item.status = Constant.STATUS[1].value;
                var itemList = [];
                itemList.push(UpdateInput);
                $scope.statusEcTypeNo = UpdateInput.ecTypeNo.toLocaleLowerCase();
                TaoBaoAdapterService.updateConfig(itemList, $scope, $scope.statusEcTypeNo, UpdateInput.uuid, function (response) {
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo("修改为有效成功");
                });
            }, function () {
                item.status = Constant.STATUS[2].value;
            });
        } else {
            $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
                var UpdateInput = item;
                item.status = Constant.STATUS[2].value;
                item.confirm = Constant.CONFIRM[1].value;
                var itemList = [];
                itemList.push(UpdateInput);
                $scope.cancelStatusEcTypeNo = UpdateInput.ecTypeNo.toLocaleLowerCase();
                TaoBaoAdapterService.updateConfig(itemList, $scope, cancelStatusEcTypeNo, UpdateInput.uuid, function (response) {
                    item.confirm = Constant.CONFIRM[1].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo("修改为无效成功");
                });
            }, function () {
                item.status = Constant.STATUS[1].value;
            });
        }
    };


    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status != '1' || item.confirm != '1') {
            $scope.showWarn('仅当电商平台接口配置的状态是有效且未审核时才允许删除!');
            return;
        }
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            var itemList = [];
            itemList.push(item);
            $scope.deleteEcTypeNo = item.ecTypeNo.toLocaleLowerCase();
            TaoBaoAdapterService.deleteConfig(itemList, event, $scope.deleteEcTypeNo, item.uuid, function (response) {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除成功。');
            });
        });
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var noDeleteNos = '';
        var count = 0;
        var itemList = [];
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.status == '1' && item.confirm == '1') {
                    itemList.push(item);
                    var response = TaoBaoAdapterService.deleteConfig(itemList, $scope, function (response) {
                    });
                    promises.push(response);
                    count++;
                } else {
                    noDeleteNos = noDeleteNos + item.no + '<br>';
                }
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择任何状态是有效且未审核的可删除项目，请选择！');
            return;
        }
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if (noDeleteNos !== '') {
                $scope.showWarn('以下状态是失效或已审核的的项目将不会删除：' + '<br>' + noDeleteNos);
            }
            $q.all(promises).then(function (data) {
                $scope.refreshList();
                $scope.showInfo('删除成功！');
            }, function (data) {
                $scope.showError(data.message);
                $scope.showError(data.data.message);
            });
        });
    };

    //批量审核
    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var confirmedNos = '';
        var count = 0;
        var itemList = [];
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.confirm != Constant.CONFIRM[2].value) {
                    var UpdateInput = item;
                    item.confirm = Constant.CONFIRM[2].value;
                    itemList.push(UpdateInput);
                    var response = TaoBaoAdapterService.updateConfig(itemList, $scope, function (response) {
                    });
                    promises.push(response);
                    count++;
                } else {
                    confirmedNos = confirmedNos + item.no + '<br>';
                }
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择任何未审核的项目，请先选择！');
            return;
        }
        if (confirmedNos !== '') {
            $scope.showWarn('以下已审核过的项目将不再次审核：' + '<br>' + confirmedNos);
        }
        $q.all(promises).then(function (data) {
            $scope.refreshList();
            $scope.disableBatchMenuButtons();
            $scope.showInfo('审核成功！');
        }, function (data) {
            $scope.showError(data.message);
            $scope.showError(data.data.message);
        });
    };

    $scope.revertConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var unConfirmedNos = '';
        var count = 0;
        var itemList = [];
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.confirm == Constant.CONFIRM[2].value) {
                    var UpdateInput = item;
                    item.confirm = Constant.CONFIRM[1].value;
                    itemList.push(UpdateInput);
                    var response = TaoBaoAdapterService.updateConfig(itemList, $scope, function (response) {
                    });
                    /*
                     var response = EPSInterfaceConfigService.modify(item.uuid, UpdateInput).success(function () {
                     });
                     */
                    promises.push(response);
                    count++;
                } else {
                    unConfirmedNos = unConfirmedNos + item.no + '<br>';
                }
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择任已审核的项目，请先选择！');
            return;
        }
        if (unConfirmedNos !== '') {
            $scope.showWarn('以下未审核过的项目将不执行取消审核：' + unConfirmedNos);
        }
        $q.all(promises).then(function (data) {
            $scope.refreshList();
            $scope.showInfo('取消审核成功！');
        }, function (data) {
            $scope.showError(data.data.message);
            $scope.showError(data.message);
        });
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var effectiveNos = '';
        var count = 0;
        var itemList = [];
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.status != Constant.STATUS[1].value) {
                    var UpdateInput = item;
                    item.status = Constant.STATUS[1].value;
                    itemList.push(UpdateInput);
                    var response = TaoBaoAdapterService.updateConfig(itemList, $scope, function (response) {
                    });
                    promises.push(response);
                    count++;
                } else {
                    effectiveNos = effectiveNos + item.no + '<br>';
                }
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择任何失效的项目，请先选择！');
            return;
        }
        if (effectiveNos !== '') {
            $scope.showWarn('以下已生效的项目将不再次修改：' + '<br>' + effectiveNos);
        }
        $q.all(promises).then(function (data) {
            $scope.refreshList();
            $scope.showInfo('生效成功！');
        }, function (data) {
            $scope.showError(data.message);
            $scope.showError(data.data.message);
        });
    };

    $scope.revertStatusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var uneffectiveNos = '';
        var count = 0;
        var itemList = [];
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.status == Constant.STATUS[1].value) {
                    var UpdateInput = item;
                    item.status = Constant.STATUS[2].value;
                    itemList.push(UpdateInput);
                    var response = TaoBaoAdapterService.updateConfig(itemList, $scope, function (response) {
                    });
                    promises.push(response);
                    count++;
                } else {
                    uneffectiveNos = uneffectiveNos + item.no + '<br>';
                }
            }
        });
        if (count == 0) {
            $scope.showWarn('没有选择生效的项目，请先选择！');
            return;
        }
        if (uneffectiveNos !== '') {
            $scope.showWarn('以下失效的项目将不再次修改：' + uneffectiveNos);
        }
        $q.all(promises).then(function (data) {
            $scope.refreshList();
            $scope.showInfo('失效成功！');
        }, function (data) {
            $scope.showError(data.data.message);
            $scope.showError(data.message);
        });
    };

    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
            item.selectedRef = item.selected;
        });
        $scope.selectedItemSize = 0;
        $scope.selectedItemAmount = 0;
        if ($scope.selectAllFlag) {
            angular.forEach($scope.itemList, function () {
                $scope.selectedItemSize++;
            })
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.disableBatchMenuButtons = function () {
        var selectedCount = 0;
        var confirm = '';
        var status = '';
        var diffConfirm = false;
        var diffStatus = false;
        angular.forEach($scope.itemList, function (item, index) {
            if (item.selectedRef) {
                selectedCount++;
                if (confirm == '') {
                    confirm = item.confirm;
                } else {
                    if (confirm != item.confirm) {
                        diffConfirm = true;
                    }
                }
                if (status == '') {
                    status = item.status;
                } else {
                    if (status != item.status) {
                        diffStatus = true;
                    }
                }
            }
        });

        if (selectedCount == 0) {
            $scope.disabledBatchConfirm = true;
            $scope.disabledBatchCancelConfirm = true;
            $scope.disabledBatchStatus = true;
            $scope.disabledBatchCancelStatus = true;
            $scope.disabledBatchDelete = true;
        } else {
            if (diffConfirm == true) {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchCancelConfirm = true;
                $scope.disabledBatchDelete = true;
            } else if (confirm == '2') {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchCancelConfirm = false;
                $scope.disabledBatchDelete = true;
            } else {
                $scope.disabledBatchConfirm = false;
                $scope.disabledBatchCancelConfirm = true;
                $scope.disabledBatchDelete = false;
            }

            if (diffStatus == true) {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = true;
                $scope.disabledBatchDelete = true;
            } else if (status == '1') {
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = false;
            } else {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchStatus = false;
                $scope.disabledBatchCancelStatus = true;
                $scope.disabledBatchDelete = true;
            }
        }
    };

});

angular.module('IOne-Production').directive('interfaceEditor', function($http, Constant, $mdDialog) {
    return {
        scope: {
            status: '=',
            source: '=',
            domain: "="
        },
        templateUrl: 'app/src/app/taobao_data/interface_config/interfaceEditor.html',
        link: function($scope) {
            $scope.$watch('source', function() {
                if($scope.source) {
                    $http.get(Constant.BACKEND_BASE + '/objectInfo/' + $scope.domain).success(function(data) {
                        $scope.objectInfo = data;
                        angular.forEach(Object.keys($scope.objectInfo), function(key) {
                            if($scope.objectInfo[key].type == 'DATE' && angular.isDefined($scope.source[key]) && $scope.source[key]!= null) {
                                $scope.source[key] = new Date($scope.source[key]);
                            }
                        });
                    });
                }
            });
            $scope.openDlg = function(key, fieldInfo) {
                $mdDialog.show({
                    controller: 'interfaceSearchController',
                    templateUrl: 'app/src/app/taobao_data/interface_config/search.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    locals: {
                        source: $scope.source,
                        key: key,
                        objectInfo: $scope.objectInfo,
                        fieldInfo: fieldInfo,
                        queryInfo: $scope.source.queryInfo
                    }
                }).then(function(data) {
                    $scope.source[key] = data;
                    $scope.source[key + 'Uuid'] = data.uuid;
                });
            }
        }
    }

});

angular.module('IOne-Production').controller('interfaceSearchController', function ($scope, $http, $mdDialog, Constant, source, key, objectInfo, fieldInfo, queryInfo) {
    $scope.source = source;
    $scope.key = key;
    $scope.objectInfo = objectInfo;
    $scope.fieldInfo = fieldInfo;
    $scope.queryInfo = queryInfo;

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.$watch('searchKeyword', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.searchInfo = {
            keyWord: $scope.searchKeyword,
            searchKeyWord: $scope.searchKeyword
        };
    }, true);
    $scope.queryAction = function () {
        if (!jQuery.isEmptyObject($scope.source.url)) {
            $scope.fieldInfo.url = $scope.source.url[$scope.fieldInfo.name];
        }
        var param = '';
        if (!jQuery.isEmptyObject($scope.queryInfo)) {
            angular.forEach(Object.keys($scope.queryInfo), function (key) {
                param += "&" + key + "=" + $scope.queryInfo[key];
            })
        }
        if (!jQuery.isEmptyObject($scope.searchInfo) && !jQuery.isEmptyObject($scope.searchKeyword)) {
            angular.forEach(Object.keys($scope.searchInfo), function (key) {
                param += "&" + key + "=" + $scope.searchInfo[key];
            })
        }
        var url = Constant.BACKEND_BASE + '/' + $scope.fieldInfo.url + '?page=' + $scope.pageOption.currentPage + '&size=' + $scope.pageOption.sizePerPage + param;
        $http.get(url).success(function(data) {
            if(data) {
                if(data.content) {
                    $scope.dataList = data.content;
                    $scope.pageOption.totalPage = data.totalPages;
                    $scope.pageOption.totalElements = data.totalElements;
                } else {
                    $scope.dataList = data;
                }
            }
        })
    };
    $scope.queryAction();
    $scope.select = function (selectedObject) {
        $scope.selectedObject = selectedObject;
        if(selectedObject.mallFlag != null){
            $scope.source.ecTypeNo=selectedObject.no;
        }
        $mdDialog.hide($scope.selectedObject);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.selectedObject);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});
