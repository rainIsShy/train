angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ocm/mall', {
        controller: 'OCMMallController',
        templateUrl: 'app/src/app/ocm/mall/mall.html'
    })
}]);

angular.module('IOne-Production').controller('OCMMallController', function ($scope, OCMMallService, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        select: {
            status: Constant.STATUS[0].value,
            confirm: Constant.CONFIRM[0].value,
            mallFlag: Constant.MALL_FLAG[0].value
        },
        no: '',
        name: '',
        keyWord: ''
    };

    $scope.menuDisplayOption = {
        'switchConfirm': {display: true, name: '审核/取消审核', uuid: 'de1217da-6895-47d9-8286-625bd5c03ed6'},
        'switchStatus': {display: true, name: '启用/禁用', uuid: 'a6369863-c9f6-4244-97b9-f1ef5f8997ff'},
        'batchConfirm': {display: true, name: '批量审核', uuid: '05e22ab7-eccc-4cdc-ac22-72cfa723c018'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: '83706189-5464-46f4-9852-48213429945a'},
        'batchStatus': {display: true, name: '批量启用', uuid: '798bfd4f-feef-4f28-994c-cea7f975d51d'},
        'batchRevertStatus': {display: true, name: '批量禁用', uuid: '0833af21-51d0-45cb-b05a-7d8b0144d841'},
        'batchDelete': {display: true, name: '批量删除', uuid: '7140ac84-6274-4f80-ba75-5a2ea6da1210'},
        'detailConfirm': {display: true, name: '审核', uuid: 'f2d986fb-ab43-44a0-9389-7f2eb4c099d1'},
        'detailRevertConfirm': {display: true, name: '取审', uuid: '864de834-da09-4ed7-bcba-10da5237e446'},
        'detailStatus': {display: true, name: '启用', uuid: 'b613a4cd-2186-4e54-90ec-bae72205bf70'},
        'detailRevertStatus': {display: true, name: '禁用', uuid: 'efa9ffa6-25fe-4729-9a36-361aa047b6e5'},
        'detailDelete': {display: true, name: '删除', uuid: 'a7b0c2ef-f102-4ee6-b914-be2fafd4c1ed'}
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
        OCMMallService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.select.confirm, $scope.listFilterOption.select.status,
            $scope.listFilterOption.no, $scope.listFilterOption.name, $scope.listFilterOption.select.mallFlag, $scope.listFilterOption.keyWord, $scope.RES_UUID_MAP.CBI.MALL.RES_UUID)
            .success(function (data) {
                $scope.itemList = data.content;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
                $scope.selectAllFlag = false;
                $scope.selectedItemSize = 0;
            });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.MALL.RES_UUID).success(function (data) {
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
            if ($scope.domain == 'OCM_BASE_MALL') {
                OCMMallService.add($scope.source).success(function (data) {
                    $scope.showInfo('新增数据成功。');
                }).error(function (data) {
                    $scope.showError('新增失败:' + '<br>' + data.message);
                });
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'OCM_BASE_MALL') {
                OCMMallService.modify($scope.source.uuid, $scope.source).success(function (data) {
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
                OCMMallService.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                OCMMallService.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                OCMMallService.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                OCMMallService.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                OCMMallService.modify(item.uuid, UpdateInput).success(function () {
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
                OCMMallService.modify(item.uuid, UpdateInput).success(function () {
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
                OCMMallService.modify(item.uuid, UpdateInput).success(function () {
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
                OCMMallService.modify(item.uuid, UpdateInput).success(function () {
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
            $scope.showWarn('仅当商场的状态是有效且未审核时才允许删除!');
            return;
        }
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            OCMMallService.delete(item.uuid).success(function () {
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
                    var response = OCMMallService.delete(item.uuid).success(function () {
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
                    var response = OCMMallService.modify(item.uuid, UpdateInput).success(function () {
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
                    var response = OCMMallService.modify(item.uuid, UpdateInput).success(function () {
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
                    var response = OCMMallService.modify(item.uuid, UpdateInput).success(function () {
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
                    var response = OCMMallService.modify(item.uuid, UpdateInput).success(function () {
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

});
