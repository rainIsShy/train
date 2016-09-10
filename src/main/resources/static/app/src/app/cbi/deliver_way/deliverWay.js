angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/cbi/deliver-way', {
        controller: 'DeliverWayController',
        templateUrl: 'app/src/app/cbi/deliver_way/deliverWay.html'
    })
}]);

angular.module('IOne-Production').controller('DeliverWayController', function ($q, $scope, DeliverWay, Constant) {
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
        'switchConfirm': {display: true, name: '审核/取消审核', uuid: 'a31a566c-083e-4246-8eed-aaa67f108d9c'},
        'switchStatus': {display: true, name: '启用/禁用', uuid: '6b492f90-86b5-4079-b3e3-5d5c358db383'},
        'batchConfirm': {display: true, name: '批量审核', uuid: 'ed8443b3-e835-404d-bbe9-d19d357924c4'},
        'batchRevertConfirm': {display: true, name: '批量取审', uuid: '01c0299b-2beb-4b93-abe2-0d53ef407fdc'},
        'batchStatus': {display: true, name: '批量启用', uuid: 'cf7e6d2c-f64c-4dce-9c4b-9590dc132384'},
        'batchRevertStatus': {display: true, name: '批量禁用', uuid: 'e10c7c56-63cc-4647-ae7d-41e97fe9423c'},
        'batchDelete': {display: true, name: '批量删除', uuid: '92d5b47c-90f3-49df-bdc0-d7c5cfc63bab'},
        'detailConfirm': {display: true, name: '审核', uuid: '503293be-e7e6-486a-b4bb-be8994251162'},
        'detailRevertConfirm': {display: true, name: '取审', uuid: '7fbca036-6587-47db-a022-12fe7189a645'},
        'detailStatus': {display: true, name: '启用', uuid: 'a698b75b-35f1-4c45-9c39-ce4d3a4eb922'},
        'detailRevertStatus': {display: true, name: '禁用', uuid: '5e5010e6-c1ad-4be2-ad12-301537c62014'},
        'detailDelete': {display: true, name: '删除', uuid: 'ac92076a-d017-45f8-a46f-cfd7a29cb93e'}
    };

    $scope.sortByField = 'no';

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        DeliverWay.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };


    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.DELIVER_WAY.RES_UUID).success(function (data) {
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
            if ($scope.domain == 'CBI_BASE_DELIV_WAY') {
                DeliverWay.add($scope.source).success(function (data) {
                    $scope.showInfo('新增送货方式成功。');
                    $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                    $scope.refreshList();
                }).error(function (response) {
                    $scope.showError('新增送货方式失败: ' + response.message);
                });
                $scope.refreshList();
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'CBI_BASE_DELIV_WAY') {
                if ($scope.source.status == Constant.STATUS[1].value && $scope.source.confirm != Constant.CONFIRM[2].value) {
                    DeliverWay.modify($scope.source.uuid, $scope.source).success(function (data) {
                        $scope.showInfo('修改送货方式成功。');
                        $scope.source = data;
                        $scope.selectedItem = data;
                        $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
                        //$scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
                        //$scope.refreshList();
                    }).error(function (response) {
                        $scope.showError('修改送货方式失败。' + response.message);
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
                DeliverWay.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                DeliverWay.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                DeliverWay.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
                DeliverWay.modify(UpdateInput.uuid, UpdateInput).success(function () {
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
            DeliverWay.modify(item.uuid, {'confirm': input}).success(function () {
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
            DeliverWay.modify(item.uuid, {'status': input}).success(function () {
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
                DeliverWay.modify(item.uuid, UpdateInput).success(function () {
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
                DeliverWay.modify(item.uuid, UpdateInput).success(function () {
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
                    var response = DeliverWay.modify(item.uuid, {'confirm': '2'}).success(function () {
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
                    var response = DeliverWay.modify(item.uuid, {'confirm': '1'}).success(function () {
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
                    var response = DeliverWay.modify(item.uuid, {'status': '1'}).success(function () {
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
                    var response = DeliverWay.modify(item.uuid, {'status': '2', 'confirm': '1'}).success(function () {
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
                        var response = DeliverWay.delete(item.uuid).success(function () {
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
