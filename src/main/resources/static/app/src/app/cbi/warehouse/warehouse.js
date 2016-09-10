angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/cbi/warehouse', {
        controller: 'WarehouseController',
        templateUrl: 'app/src/app/cbi/warehouse/warehouse.html'
    })
}]);

angular.module('IOne-Production').controller('WarehouseController', function ($q, $scope, Warehouse, Constant) {
    $scope.disabledBatchConfirm = true;
    $scope.disabledBatchCancelConfirm = true;
    $scope.disabledBatchStatus = true;
    $scope.disabledBatchCancelStatus = true;
    $scope.disabledBatchDelete = true;
    $scope.selectedItemSize = 0;

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        select: {
            status: Constant.STATUS[0].value,
            confirm: Constant.CONFIRM[0].value
        },
        no: '',
        name: '',
        keyWord: ''
    };

    $scope.menuDisplayOption = {
        'switchConfirm': {display: true, name: '审核/取消审核', uuid: '8b2608f8-b4f3-4d6a-b86c-386f370aaa12'},
        'switchStatus': {display: true, name: '启用/禁用', uuid: '1dbe0933-19cd-413f-8847-e87d6ac31298'},
        'batchConfirm': {display: true, name: '批量审核', uuid: '020c94c2-0ee1-4249-b01b-d38cb3ffda3f'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: '761aabab-1999-4404-ac3e-e2bdb85d8508'},
        'batchStatus': {display: true, name: '批量启用', uuid: '74f0ab8c-bc1a-430c-8b23-82d3fc34b590'},
        'batchRevertStatus': {display: true, name: '批量禁用', uuid: '12ad891e-8512-453a-813e-69d668635715'},
        'batchDelete': {display: true, name: '批量删除', uuid: 'ba7383b3-2b75-4535-a3b7-9fe2d0b477e8'},
        'detailConfirm': {display: true, name: '审核', uuid: 'eaee731c-e58b-4187-b46b-bc440b779883'},
        'detailRevertConfirm': {display: true, name: '取审', uuid: 'f0fd8788-ebce-4426-a0e7-62189e08120a'},
        'detailStatus': {display: true, name: '启用', uuid: '24d090e4-0377-4643-a95a-fc15e01fd8d3'},
        'detailRevertStatus': {display: true, name: '禁用', uuid: '3ac4c30a-b7c0-4376-9bfa-7e0ca3fab241'},
        'detailDelete': {display: true, name: '删除', uuid: '75bd2e16-c9b3-41f0-92c1-394d5e4344bf'}
    };

    $scope.sortByField = 'no';

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        Warehouse.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };


    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.WAREHOUSE.RES_UUID).success(function (data) {
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

    $scope.subItemList = [
        {no: '1111111', name: 'name1', orderAmount: '100', confirm: '1', release: '1', status: '2'},
        {no: '2222222', name: 'name2', orderAmount: '200', confirm: '2', release: '1', status: '1'},
        {no: '3333333', name: 'name3', orderAmount: '300', confirm: '1', release: '2', status: '2'}
    ];

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        //OrderDetail.get($scope.selectedItem.uuid).success(function(data) {
        //    $scope.orderDetailList = data.content;
        //});
        item.detailList = $scope.subItemList;
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
            item.detailList = $scope.subItemList;
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
            if ($scope.domain == 'CBI_BASE_WAREHOUSE') {
                Warehouse.add($scope.source).success(function (data) {
                    $scope.showInfo('新增仓库成功。');
                    $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                    $scope.refreshList();
                }).error(function (response) {
                    $scope.showError('新增仓库失败: ' + response.message);
                });
                $scope.refreshList();
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'CBI_BASE_WAREHOUSE') {
                if ($scope.source.status == Constant.STATUS[1].value && $scope.source.confirm != Constant.CONFIRM[2].value) {
                    Warehouse.modify($scope.source.uuid, $scope.source).success(function (data) {
                        $scope.showInfo('修改仓库成功。');
                        $scope.source = data;
                        $scope.selectedItem = data;
                        $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
                        //$scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                        //$scope.refreshList();
                    }).error(function (response) {
                        $scope.showError('修改仓库失败。' + response.message);
                        $scope.source = angular.copy($scope.selectedItemBackUp);
                        $scope.selectedItem = angular.copy($scope.selectedItemBackUp);
                    });
                } else {
                    $scope.showError($scope.source.no + ' 不允许修改：有效且未审核的记录才可以修改！');
                }


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

    $scope.confirmSwitchAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == Constant.CONFIRM[2].value) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[1].value
                };
                Warehouse.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                Warehouse.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                Warehouse.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                Warehouse.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
        console.info('confirm...');

        $scope.stopEventPropagation(event);
        console.info('status...');

        var msg = "确认取消审核吗？";
        var input = '1';
        var resultMsg = "取消审核成功！";
        if (item.confirm != '2') {
            msg = "确认审核吗？";
            input = '2';
            resultMsg = "审核成功！";
        }

        $scope.showConfirm(msg, '', function () {
            Warehouse.modify(item.uuid, {'confirm': input}).success(function () {
                item.confirm = input;
                $scope.showInfo(resultMsg);
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };

    /*$scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('status...');

        var msg = "确认禁用吗？";
        var input = '2';
        var resultMsg = "禁用成功！";
        if (item.status != '1') {
            msg = "确认启用吗？";
            input = '1';
            resultMsg = "启用成功！";
        }

        $scope.showConfirm(msg, '', function () {
            Warehouse.modify(item.uuid, {'status': input}).success(function () {
                item.status = input;
                $scope.showInfo(resultMsg);
            }).error(function (response) {
                $scope.showError(response.message);
            });
        });
    };*/

    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == Constant.STATUS[1].value) {
            $scope.showConfirm('确认改为失效吗？', '', function () {
                var UpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[2].value,
                    confirm: Constant.CONFIRM[1].value
                };
                Warehouse.modify(item.uuid, UpdateInput).success(function () {
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
                Warehouse.modify(item.uuid, UpdateInput).success(function () {
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
        console.info('delete...');
        //TODO ...
    };

    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认审核吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = Warehouse.modify(item.uuid, {'confirm': '2'}).success(function () {
                        item.confirm = '2';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 审核失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('审核成功！');
                }
                $scope.disableBatchMenuButtons();
            });
        });
    };

    $scope.cancelConfirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认取消审核吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = Warehouse.modify(item.uuid, {'confirm': '1'}).success(function () {
                        item.confirm = '1';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 取消审核失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('取消审核成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认启用吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = Warehouse.modify(item.uuid, {'status': '1'}).success(function () {
                        item.status = '1';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 启用失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('启用成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.cancelStatusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }
        $scope.showConfirm('确认禁用吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    var response = Warehouse.modify(item.uuid, {'status': '2', 'confirm': '1'}).success(function () {
                        item.status = '2';
                        item.confirm = '1';
                    }).error(function (response) {
                        bError = true;
                        $scope.showError(item.no + ' 禁用失败：' + response.message);
                    });
                    promises.push(response);
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('禁用成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
        });
    };

    $scope.releaseAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        console.info('release all...');
        //TODO ...
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);

        if ($scope.selectedItemSize == 0) {
            $scope.showWarn('请先选择记录！');
            return;
        }

        $scope.showConfirm('确认删除吗', '', function () {
            var promises = [];
            var bError = false;
            angular.forEach($scope.itemList, function (item) {
                if (item.selected) {
                    if (item.status == Constant.STATUS[1].value && item.confirm != Constant.CONFIRM[2].value) {
                        var response = Warehouse.delete(item.uuid).success(function () {
                            $scope.refreshList();
                        }).error(function (response) {
                            bError = true;
                            $scope.showError(item.no + ' 删除失败：' + response.message);
                        });
                        promises.push(response);
                    } else {
                        bError = true;
                        $scope.showError(item.no + ' 不允许删除：有效且未审核的记录才可以删除！');
                    }
                }
            });
            $q.all(promises).then(function (data) {
                if (!bError) {
                    $scope.showInfo('删除成功！');
                    $scope.disableBatchMenuButtons();
                }
            });
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
        if ($scope.selectAllFlag) {
            angular.forEach($scope.itemList, function (item) {
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
