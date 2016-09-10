angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/cbi/payWay', {
        controller: 'PayWayController',
        templateUrl: 'app/src/app/cbi/pay_way/payWay.html'
    })
}]);

angular.module('IOne-Production').controller('PayWayController', function($scope, $q, CBIPayWayService, Constant) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
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
        '101-confirm': {display: true, name: '审核', uuid: '6544965d-6e2d-4182-b9d0-7f3f4bd45dfc'},
        '102-cancelConfirm': {display: true, name: '取消审核', uuid: 'd404d47d-f327-470a-976f-7e9cd76f7db5'},
        '103-enableStatus': {display: true, name: '启用', uuid: 'fbab3426-bfd4-4375-a104-f6f1e31dca87'},
        '104-disableStatus': {display: true, name: '取消启用', uuid: '11d28d67-2b6b-4bd5-ad1b-d1308dfcce82'},
        '105-delete': {display: true, name: '删除', uuid: '8b20088c-8481-4225-95da-2a48a1de5194'},
        '106-query': {display: true, name: '查询', uuid: 'b92c9dc0-6caf-4e83-b642-8c154e979acb'},
        '107-add': {display: true, name: '添加', uuid: 'c27edb09-167c-4912-a521-ce9a553d0948'},
        '108-edit': {display: true, name: '修改', uuid: 'c10fd61a-f86c-4d0f-aabc-dd918be60cc4'},

        '201-batchConfirm': {display: true, name: '批量审核', uuid: '182200a3-17cd-42e2-bff3-79caa2cc4987'},
        '202-batchCancelConfirm': {display: true, name: '批量取消审核', uuid: '6b728f50-8e01-4f9b-abc6-1abe685c37d3'},
        '203-batchEnableStatus': {display: true, name: '批量启用', uuid: '3c876d1b-6a42-4d4a-91ba-c85c9ba8373e'},
        '204-batchDisableStatus': {display: true, name: '批量取消启用', uuid: 'd2e335ae-6c8d-475f-96db-b69ce62df48f'}
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.PAY_WAY.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });

    $scope.selectedItem = null;
    $scope.selectAllFlag = false;
    $scope.selected = [];
    $scope.selectItemCount = 0;

    $scope.refreshList = function() {
        CBIPayWayService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.select.confirm,
            $scope.listFilterOption.select.status, $scope.listFilterOption.no, $scope.listFilterOption.name, $scope.listFilterOption.keyWord,
            $scope.RES_UUID_MAP.CBI.PAY_WAY.RES_UUID).success(function(data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            $scope.selectAllFlag = false;
            $scope.selected = [];
            $scope.selectItemCount = 0;
        });
    };

    $scope.refreshList();

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

    // Check authorization
    $scope.isAuthorized = function (option) {
        if ($scope.menuDisplayOption[option].display &&
            ($scope.menuAuthDataMap[$scope.menuDisplayOption[option].uuid] ||
            $scope.isAdmin() || !$scope.menuDisplayOption[option].uuid)) {
            return true;
        }

        return false;
    };

    $scope.showConfirmMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.confirm == 1 && item.status == 1 && $scope.isAuthorized('101-confirm');
        }
        return false;
    };

    $scope.showCancelConfirmMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.confirm == 2 && $scope.isAuthorized('102-cancelConfirm');
        }
        return false;
    };

    $scope.showEnableStatusMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.status == 2 && $scope.isAuthorized('103-enableStatus');
        }
        return false;
    };

    $scope.showDisableStatusMenuItem = function (item) {
        if (item !== null && item !== undefined) {
            return item.status == 1 && $scope.isAuthorized('104-disableStatus');
        }
        return false;
    };

    $scope.showDeleteMenuItem = function () {
        return $scope.isAuthorized('105-delete');
    };

    $scope.showQueryButton = function () {
        return $scope.isAuthorized('106-query');
    };

    $scope.showAddButton = function () {
        return $scope.isAuthorized('107-add');
    };

    $scope.showEditButton = function () {
        return $scope.isAuthorized('108-edit');
    };

    $scope.showBatchConfirmMenuItem = function () {
        return $scope.isAuthorized('101-confirm');
    };

    $scope.showBatchCancelConfirmMenuItem = function () {
        return $scope.isAuthorized('102-cancelConfirm');
    };

    $scope.showBatchEnableStatusMenuItem = function () {
        return $scope.isAuthorized('103-enableStatus');
    };

    $scope.showBatchDisableStatusMenuItem = function () {
        return $scope.isAuthorized('104-disableStatus');
    };

    $scope.showBatchMenu = function () {
        return $scope.showBatchConfirmMenuItem || $scope.showBatchCancelConfirmMenuItem() ||
            $scope.showBatchDisableStatusMenuItem() || $scope.showBatchEnableStatusMenuItem();
    };

    // UI layout operations
    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.showItemDetailsAction = function (item) {
        $scope.selectedItem = item;
    };

    $scope.hideItemDetailsAction = function (event) {
        $scope.stopEventPropagation(event);
        $scope.selectedItem = null;
        $scope.refreshList();
    };

    $scope.returnToViewUIAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
        $scope.refreshList();
    };

    $scope.selectAllAction = function () {
        if ($scope.selectAllFlag == true) {
            angular.forEach($scope.itemList, function (item) {
                var idx = $scope.selected.indexOf(item);
                if (idx < 0) {
                    $scope.selected.push(item);
                }
            });
        } else if ($scope.selectAllFlag == false) {
            $scope.selected = [];
        }

        $scope.selectItemCount = $scope.selected.length;
    };

    $scope.selectItemAction = function (event, item, selected) {
        $scope.stopEventPropagation(event);
        var idx = selected.indexOf(item);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(item);
        }
        $scope.selectItemCount = $scope.selected.length;
    };

    $scope.exists = function (item, selected) {
        return selected.indexOf(item) > -1;
    };

    // Add, delete, edit, save an item operations
    $scope.preAddItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'add';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
    };

    $scope.canDeleteItem = function (item) {
        if (item !== null && item !== undefined) {
            // 允许用户删除当前查看的付款方式信息（仅在当前付款方式有效且未审核时）
            if (item.confirm == 1 && item.status == 1) {
                return true;
            }
        }

        return false;
    };

    $scope.deleteItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            CBIPayWayService.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
            });
        });
    };

    $scope.canEditItem = function (item) {
        if (item !== null && item !== undefined) {
            // 允许用户编辑当前查看的付款方式信息（仅有效且未审核时）
            if (item.confirm == 1 && item.status == 1) {
                return true;
            }
        }

        return false;
    };

    $scope.editItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'edit';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
        $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
    };

    $scope.saveItemAction = function() {
        if ($scope.source.confirm == '2' && $scope.source.status == '2') {
            $scope.showError("不允许状态是已审核又无效,请调整后再保存");
            return;
        }
        if($scope.status == 'add') {
            if($scope.domain == 'CBI_BASE_PAY_WAY') {
                CBIPayWayService.add($scope.source).success(function(data) {
                    $scope.refreshList();
                    $scope.showInfo('新增数据成功。');
                }).error(function() {
                    $scope.showError('新增失败。');
                });
            }
        } else if($scope.status == 'edit') {
            if($scope.domain == 'CBI_BASE_PAY_WAY') {
                CBIPayWayService.modify($scope.source.uuid, $scope.source).success(function(data) {
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

    $scope.confirmSwitchAction = function(event, item) {
        $scope.stopEventPropagation(event);
        if(item.confirm == 2){
            $scope.showConfirm('确认取消审核吗？', '', function() {
                var payWayUpdateInput = {
                    uuid:item.uuid,
                    confirm:Constant.CONFIRM[1].value
                };
                CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function() {
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                // Clicking Cancel will go here, make UI switch back. value should be ng-true-value or ng-false-value
                item.confirm = '2';
            });
        } else {
            if (item.status == Constant.STATUS[2].value) {
                $scope.showWarn("项目是失效状态,请先启用后再审核");
                item.confirm = Constant.CONFIRM[2].value;
                return;
            }
            $scope.showConfirm('确认审核吗？', '', function() {
                var payWayUpdateInput = {
                    uuid:item.uuid,
                    confirm:Constant.CONFIRM[2].value
                };
                CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function() {
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                item.confirm = '1';
            });
        }
    };

    $scope.statusSwitchAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if(item.status == 2){
            $scope.showConfirm('确认修改启用状态为有效吗？', '', function() {
                var payWayUpdateInput = {
                    uuid:item.uuid,
                    status:Constant.STATUS[1].value
                };
                CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function() {
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                item.status = '2';
            });
        }else if(item.status == 1){
            $scope.showConfirm('确认修改启用状态为无效吗？', '', function() {
                var payWayUpdateInput = {
                    uuid:item.uuid,
                    status: Constant.STATUS[2].value,
                    confirm: Constant.CONFIRM[1].value
                };
                CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function() {
                    item.confirm = Constant.CONFIRM[1].value;
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                item.status = '1';
            });
        }
    };

    $scope.confirmAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认审核吗？', '', function () {
            var payWayUpdateInput = {
                uuid: item.uuid,
                confirm: Constant.CONFIRM[2].value
            };
            CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function () {
                $scope.selectedItem.confirm = Constant.CONFIRM[2].value;
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    $scope.cancelConfirmAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认取消审核吗？', '', function () {
            var payWayUpdateInput = {
                uuid: item.uuid,
                confirm: Constant.CONFIRM[1].value
            };
            CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function () {
                $scope.selectedItem.confirm = Constant.CONFIRM[1].value;
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    $scope.enableStatusAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
            var payWayUpdateInput = {
                uuid: item.uuid,
                status: Constant.STATUS[1].value
            };
            CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function () {
                $scope.selectedItem.status = Constant.STATUS[1].value;
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    $scope.disableStatusAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
            var payWayUpdateInput = {
                uuid: item.uuid,
                status: Constant.STATUS[2].value,
                confirm: Constant.CONFIRM[1].value
            };
            CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function () {
                $scope.selectedItem.status = Constant.STATUS[2].value;
                $scope.selectedItem.confirm = Constant.CONFIRM[1].value;
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    // Batch operations
    $scope.canBatchConfirm = function () {
        if ($scope.selected.length > 0) {
            for (var i = 0; i < $scope.selected.length; i++) {
                if ($scope.selected[i].confirm == Constant.CONFIRM[2].value || $scope.selected[i].status == Constant.STATUS[2].value) {
                    return false;
                }
            }

            return true;
        }

        return false;
    };

    $scope.batchConfirm = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量审核吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var payWayUpdateInput = {
                            uuid: item.uuid,
                            confirm: Constant.CONFIRM[2].value
                        };
                        var response = CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };

    $scope.canBatchCancelConfirm = function () {
        if ($scope.selected.length > 0) {
            for (var i = 0; i < $scope.selected.length; i++) {
                if ($scope.selected[i].confirm == Constant.CONFIRM[1].value) {
                    return false;
                }
            }

            return true;
        }

        return false;
    };

    $scope.batchCancelConfirm = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量取消审核吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var payWayUpdateInput = {
                            uuid: item.uuid,
                            confirm: Constant.CONFIRM[1].value
                        };
                        var response = CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };

    $scope.canBatchEnableStatus = function () {
        if ($scope.selected.length > 0) {
            for (var i = 0; i < $scope.selected.length; i++) {
                if ($scope.selected[i].status == Constant.STATUS[1].value) {
                    return false;
                }
            }

            return true;
        }

        return false;
    };

    $scope.batchEnableStatus = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量修改启用状态为有效吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var payWayUpdateInput = {
                            uuid: item.uuid,
                            status: Constant.STATUS[1].value
                        };
                        var response = CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };

    $scope.canBatchDisableStatus = function () {
        if ($scope.selected.length > 0) {
            for (var i = 0; i < $scope.selected.length; i++) {
                if ($scope.selected[i].status == Constant.STATUS[2].value) {
                    return false;
                }
            }

            return true;
        }

        return false;
    };

    $scope.batchDisableStatus = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量修改启用状态为无效吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var payWayUpdateInput = {
                            uuid: item.uuid,
                            status: Constant.STATUS[2].value,
                            confirm: Constant.CONFIRM[1].value
                        };
                        var response = CBIPayWayService.modify(payWayUpdateInput.uuid, payWayUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };
});