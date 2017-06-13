angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ocm/channel', {
        controller: 'OCMChannelController',
        templateUrl: 'app/src/app/ocm/channel/channel.html'
    })
}]);

angular.module('IOne-Production').controller('OCMChannelController', function ($scope, OCMChannelService, CBIEmployeeService, ChannelLevelService, ChannelService, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.pageDetailOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        select: {
            status: Constant.STATUS[0].value,
            confirm: Constant.CONFIRM[0].value,
            channelFlag: Constant.CHANNEL_FLAG[0].value
        },
        no: '',
        name: '',
        keyWord: ''
    };

    $scope.menuDisplayOption = {
        'switchConfirm': {display: true, name: '审核/取消审核', uuid: '2ce66bf4-6faf-4f77-88e1-3ebd32e2b0f8'},
        'switchStatus': {display: true, name: '启用/禁用', uuid: '768a80a9-33e7-4fd4-8feb-cce7165bac1c'},
        'batchConfirm': {display: true, name: '批量审核', uuid: '2159dc12-09fe-4305-a932-1654fe82ab51'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: '3e8c7ba2-7a2b-44f4-b60f-ededf2e26768'},
        'batchStatus': {display: true, name: '批量启用', uuid: '728abe8c-181d-42b7-b397-d2fe7f91f991'},
        'batchRevertStatus': {display: true, name: '批量禁用', uuid: '2224f13c-6ce8-4b20-80d2-abb6a098847e'},
        'batchDelete': {display: true, name: '批量删除', uuid: 'ab0c752e-303c-4eef-98d5-52b6c391c47d'},
        'detailConfirm': {display: true, name: '审核', uuid: '5ac88842-52d3-426c-9743-dc4ff241ffb8'},
        'detailRevertConfirm': {display: true, name: '取审', uuid: '475b62a2-f3da-4925-b080-da5d66bd3ca4'},
        'detailStatus': {display: true, name: '启用', uuid: '7053c8ef-aab5-477d-a2da-429bda74f8c1'},
        'detailRevertStatus': {display: true, name: '禁用', uuid: 'e3cd29e5-f03a-4b03-a68b-0e470b053241'},
        'detailDelete': {display: true, name: '删除', uuid: '2e1cd38e-4cf1-44eb-9a79-4ee93bb8a95f'},
        'channelLevel-edit': {display: true, name: '编辑', uuid: '24f3ebb1-33c0-4368-b8bc-4787cc7b848a'},
        'channelLevel-detailDelete': {display: true, name: '删除', uuid: '9d1dd65d-be87-47a5-9d4f-815e21e4196f'},
        'channelLevel-detailAdd': {display: true, name: '点击新增', uuid: '8a3239a4-2a04-4fb2-ae92-1b75b2d697f0'},
        'channelLevel-add': {display: true, name: '设置', uuid: '3021f22c-1f6b-49f3-810f-d8978e83387a'},
        'channelLevel-delete': {display: true, name: '删除', uuid: 'f960bde1-fabb-4e30-9467-cdcd0e99000b'}
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

    $scope.refreshList = function () {
        OCMChannelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.select.confirm, $scope.listFilterOption.select.status,
            $scope.listFilterOption.no, $scope.listFilterOption.name, $scope.listFilterOption.select.channelFlag, $scope.listFilterOption.keyWord, $scope.listFilterOption.groupUser, $scope.RES_UUID_MAP.CBI.CHANNEL.RES_UUID)
            .success(function (data) {
                $scope.itemList = data.content;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
                $scope.selectAllFlag = false;
                $scope.selectedItemSize = 0;

            });
    };

    $scope.refreshSubList = function (item) {
        ChannelLevelService.getAll($scope.pageDetailOption.sizePerPage, $scope.pageDetailOption.currentPage, '', '', '', '', '', '', item.uuid, item.uuid, RES_UUID_MAP.OCM.CHANNEL_LEVEL.RES_UUID).success(function (data) {
            item.childList = data.content;
            $scope.pageDetailOption.totalPage = data.totalPages;
            $scope.pageDetailOption.totalElements = data.totalElements;

        });
    };


    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.CHANNEL.RES_UUID).success(function (data) {
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
    //$scope.selectedItemAmount = 0;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        item.detailList = $scope.subItemList;
        $scope.displayAdvancedSearPanel = false;
        $scope.refreshSubList($scope.selectedItem);
        $scope.getParentChannel(item);
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
    $scope.preAddItemAction = function (source, domain, desc, setLevel) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'add';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
        $scope.setLevel = setLevel;

        if ($scope.setLevel == '1') {
            $scope.addItem = {
                channelUuid: $scope.selectedItem.uuid,
                channelName: $scope.selectedItem.name,
                parentOcmBaseChanUuid: '',
                parentChannelName: ''
            };
        } else if ($scope.setLevel == '2') {
            $scope.addItem = {
                channelUuid: '',
                channelName: '',
                parentOcmBaseChanUuid: $scope.selectedItem.uuid,
                parentChannelName: $scope.selectedItem.name
            };
        }
    };

    $scope.validForm = function (item) {
        var isFormValid = true;
        if (!item.no) {
            $scope.showError('请填写渠道/直营店编号!');
            isFormValid = false;
        }

        if (!item.name) {
            $scope.showError('请填写渠道/直营店名称!');
            isFormValid = false;
        }

        if (!item.channelFlag) {
            $scope.showError('请填写渠道/直营店标志!');
            isFormValid = false;
        }

        return isFormValid;

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
            if ($scope.domain == 'OCM_BASE_CHAN') {
                if (!$scope.validForm($scope.source)) {
                    return;
                }

                OCMChannelService.add($scope.source).success(function (data) {
                    $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                    if ($scope.setLevel == '1' || $scope.setLevel == '2') {
                        if ($scope.setLevel == '1') {
                            $scope.addItem.parentOcmBaseChanUuid = data.uuid;
                            $scope.addItem.parentChannelName = data.name
                        } else if ($scope.setLevel == '2') {
                            $scope.addItem.channelUuid = data.uuid;
                            $scope.addItem.channelName = data.name
                        }

                        ChannelLevelService.add($scope.addItem).success(function () {
                            if ($scope.setLevel == '1') {
                                $scope.showInfo("新增上层渠道成功!");
                                $scope.getParentChannel($scope.selectedItem);
                            }
                            if ($scope.setLevel == '2') {
                                $scope.showInfo("新增下层渠道成功!");
                                $scope.refreshSubList($scope.selectedItem);
                            }
                            $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);

                        });
                    } else {
                        $scope.showInfo('新增数据成功。');
                    }
                }).error(function (data) {
                    $scope.showError('新增失败:' + '<br>' + data.message);
                });
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'OCM_BASE_CHAN') {
                OCMChannelService.modify($scope.source.uuid, $scope.source).success(function (data) {
                    $scope.showInfo('修改数据成功。');
                    $scope.source = data;
                    $scope.selectedItem = data;
                    $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
                }).error(function (data) {
                    $scope.showError('修改失败:' + '<br>' + data.message);
                    $scope.source = angular.copy($scope.selectedItemBackUp);
                    $scope.selectedItem = angular.copy($scope.selectedItemBackUp);
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
        //TODO ...
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

    $scope.confirmSwitchAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == Constant.CONFIRM[2].value) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[1].value
                };
                OCMChannelService.modify(UpdateInput.uuid, UpdateInput).success(function () {
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('取消审核成功。');
                });
            }, function () {
                item.confirm = Constant.CONFIRM[2].value;
            });
        } else {
            if (item.status == Constant.STATUS[2].value) {
                $scope.showWarn("项目是失效状态,请先启用后再审核");
                item.confirm = Constant.CONFIRM[2].value;
                return;
            }
            $scope.showConfirm('确认审核吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[2].value
                };
                OCMChannelService.modify(UpdateInput.uuid, UpdateInput).success(function () {
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('审核成功。');
                });
            }, function () {
                item.confirm = Constant.CONFIRM[1].value;
            });
        }

    };

    $scope.statusSwitchAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == Constant.STATUS[2].value) {
            $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[1].value
                };
                OCMChannelService.modify(UpdateInput.uuid, UpdateInput).success(function () {
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('生效成功。');
                });
            }, function () {
                item.status = Constant.STATUS[2].value;
            });
        } else {
            $scope.showConfirm('确认修改启用状态为失效吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[2].value,
                    confirm: Constant.CONFIRM[1].value
                };
                OCMChannelService.modify(UpdateInput.uuid, UpdateInput).success(function () {
                    item.confirm = Constant.CONFIRM[1].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('失效成功。');
                });
            }, function () {
                item.status = Constant.STATUS[1].value;
            });
        }
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == Constant.CONFIRM[2].value) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[1].value
                };
                OCMChannelService.modify(item.uuid, UpdateInput).success(function () {
                    item.confirm = Constant.CONFIRM[1].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('取消审核成功！');
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            });
        } else {
            $scope.showConfirm('确认审核吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[2].value
                };
                OCMChannelService.modify(item.uuid, UpdateInput).success(function () {
                    item.confirm = Constant.CONFIRM[2].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('审核成功！');
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            });
        }
    };

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == Constant.STATUS[1].value) {
            $scope.showConfirm('确认改为失效吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[2].value,
                    confirm: Constant.CONFIRM[1].value
                };
                OCMChannelService.modify(item.uuid, UpdateInput).success(function () {
                    item.status = Constant.STATUS[2].value;
                    item.confirm = Constant.CONFIRM[1].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('修改为失效成功！');
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            });
        } else {
            $scope.showConfirm('确认改为生效吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[1].value
                };
                OCMChannelService.modify(item.uuid, UpdateInput).success(function () {
                    item.status = Constant.STATUS[1].value;
                    $scope.disableBatchMenuButtons();
                    $scope.showInfo('修改为生效成功！');
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            });
        }
    };

    $scope.releaseClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('release...');
        //TODO ...
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status != '1' || item.confirm != '1') {
            $scope.showWarn('仅当渠道/直营店的状态是有效且未审核时才允许删除!');
            return;
        }
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            OCMChannelService.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
            });
        });
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var noDeleteNos = '';
        var count = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.status == '1' && item.confirm == '1') {
                    var response = OCMChannelService.delete(item.uuid).success(function () {
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
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.confirm != Constant.CONFIRM[2].value) {
                    var UpdateInput = {
                        uuid: item.uuid,
                        confirm: Constant.CONFIRM[2].value
                    };
                    var response = OCMChannelService.modify(item.uuid, UpdateInput).success(function () {
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
            //confirmedNos = confirmedNos.substr(0, confirmedNos.length - 1);
            $scope.showWarn('以下已审核过的项目将不再次审核：' + '<br>' + confirmedNos);
        }
        $q.all(promises).then(function (data) {
            //console.info(data);
            $scope.refreshList();
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
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.confirm == Constant.CONFIRM[2].value) {
                    var UpdateInput = {
                        uuid: item.uuid,
                        confirm: Constant.CONFIRM[1].value
                    };
                    var response = OCMChannelService.modify(item.uuid, UpdateInput).success(function () {
                    });
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
            //unConfirmedNos = unConfirmedNos.substr(0, unConfirmedNos.length - 1);
            $scope.showWarn('以下未审核过的项目将不执行取消审核：' + unConfirmedNos);
        }
        $q.all(promises).then(function (data) {
            //console.info(data);
            $scope.refreshList();
            $scope.showInfo('取消审核成功！');
        }, function (data) {
            //console.info(data);
            $scope.showError(data.data.message);
            $scope.showError(data.message);
        });
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        var promises = [];
        var effectiveNos = '';
        var count = 0;
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.status != Constant.STATUS[1].value) {
                    var UpdateInput = {
                        uuid: item.uuid,
                        status: Constant.STATUS[1].value
                    };
                    var response = OCMChannelService.modify(item.uuid, UpdateInput).success(function () {
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
            //console.info(data);
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
        angular.forEach($scope.itemList, function (item) {
            if (item.selected === true) {
                if (item.status == Constant.STATUS[1].value) {
                    var UpdateInput = {
                        uuid: item.uuid,
                        status: Constant.STATUS[2].value,
                        confirm: Constant.CONFIRM[1].value
                    };
                    var response = OCMChannelService.modify(item.uuid, UpdateInput).success(function () {
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
            //console.info(data);
            $scope.refreshList();
            $scope.showInfo('失效成功！');
        }, function (data) {
            //console.info(data);
            $scope.showError(data.data.message);
            $scope.showError(data.message);
        });
    };

    $scope.releaseAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('release all...');
        //TODO ...
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
            angular.forEach($scope.itemList, function (item) {
                $scope.selectedItemSize++;
            })
        }
        $scope.disableBatchMenuButtons();
    };

    $scope.disableBatchMenuButtons = function () {
        //console.info("disableBatchMenuButtons");
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

    $scope.getChannelName = function (item) {
        ChannelService.get(item.parentOcmBaseChanUuid).success(function (data) {
            item.parentOcmBaseChanName = data.name;
        });
    };

    $scope.getParentChannel = function (item) {
        ChannelLevelService.getByChannelUuid(item.uuid).success(function (data) {
            if (data.content) {
                angular.forEach(data.content, function (parent) {
                    item.parentOcmBaseChanUuid = parent.parentOcmBaseChanUuid;
                    $scope.getChannelName(item);
                })

            }
        });
    };

    $scope.openChannelDlg = function () {
        $mdDialog.show({
            controller: 'ChannelSelectLevelController',
            templateUrl: 'app/src/app/ocm/channel/selectChannel.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                domain: $scope.domain,
                addItem: $scope.selectedItem,
                itemList: $scope.itemList
            }
        }).then(function (data) {
            $scope.addItem.channelUuid = data.uuid;
            $scope.addItem.channelName = data.name;

        });
    };

    $scope.openParentChannelDlg = function () {
        $mdDialog.show({
            controller: 'ChannelSelectParentLevelController',
            templateUrl: 'app/src/app/ocm/channel/selectParentChannel.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                addItem: $scope.addItem,
                itemList: $scope.itemList
            }
        }).then(function (data) {
            $scope.addItem.parentOcmBaseChanUuid = data.uuid;
            $scope.addItem.parentChannelName = data.name;

        });

    };

    $scope.deleteParentLevel = function () {
        $scope.showConfirm('确认删除上级层级吗？', '删除后不可恢复。', function () {
            ChannelLevelService.getByChannelUuid($scope.selectedItem.uuid).success(function (channelList) {
                if (channelList.totalElements > 0) {
                    ChannelLevelService.delete(channelList.content[0].uuid).success(function () {
                        $scope.showInfo("删除上级层级成功!");
                        $scope.selectedItem.parentOcmBaseChanUuid = null;
                        $scope.selectedItem.parentOcmBaseChanName = null;
                    });
                }
            });
        });



    };



    $scope.deleteChannelLevelAction = function (detail) {
        $scope.showConfirm('确认删除层级吗？', '删除后不可恢复。', function () {
            ChannelLevelService.delete(detail.uuid).success(function (data) {
                $scope.showInfo("删除层级成功!");
                $scope.refreshSubList($scope.selectedItem);
                $scope.refreshList();
            });
        });
    };

});

