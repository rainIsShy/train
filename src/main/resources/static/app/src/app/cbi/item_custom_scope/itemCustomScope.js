angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/cbi/itemCustomScope', {
        controller: 'ItemCustomScopeController',
        templateUrl: 'app/src/app/cbi/item_custom_scope/itemCustomScope.html'
    })
}]);

angular.module('IOne-Production').controller('ItemCustomScopeController', function ($scope, $q, CBIItemCustomScopeService, $mdDialog, Constant, Upload, $timeout) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,
        confirm: Constant.CONFIRM[0].value,
        release: Constant.RELEASE[0].value
    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.menuDisplayOption = {
        '401-confirm': {display: true, name: '审核', uuid: 'D914679D-8FCB-40A0-875F-BF5FE52D55E9'},
        '402-confirmRevert': {display: true, name: '取消审核', uuid: '890FCE84-0537-42B6-8EE7-1B351C2BE8AD'},
        '403-status': {display: true, name: '启用', uuid: '10BBAA04-FFD8-48AF-96E7-C8CBCA20B569'},
        '404-statusRevert': {display: true, name: '取消启用', uuid: 'FAE72E22-9377-4F2D-B0EF-95CE84F5D4C8'},
        '405-delete': {display: true, name: '删除', uuid: '647287DC-B213-4F6F-9A3D-AA95E9B94002'},
        '406-query': {display: true, name: '查询', uuid: 'BE725A75-33FD-4D29-928F-89ECF7250215'},

        '411-confirmAll': {display: true, name: '批量审核', uuid: '66AB30B3-9FFC-440F-883A-8FE1ADE69163'},
        '412-confirmRevertAll': {display: true, name: '批量取消审核', uuid: 'D870B2FA-00BA-4850-A1E1-88C6C8E2D02C'},
        '413-statusAll': {display: true, name: '批量启用', uuid: '7521E7E6-CB1A-4352-BF43-B050BB8C9F2F'},
        '414-statusRevertAll': {display: true, name: '批量取消启用', uuid: '00513382-E7C3-47D7-ACA2-0F4A29F6713A'},
        '415-deleteAll': {display: true, name: '批量删除', uuid: '517ED2DA-1F21-47F4-B095-C7DFE5EA396D'}
    };

    $scope.refreshList = function () {
        CBIItemCustomScopeService.getAll('null',$scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.status,
            $scope.theMax, $scope.RES_UUID_MAP.CBI.ITEM_CUSTOM_SCOPE.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            $scope.resetButtonDisabled();
            $scope.selectAllFlag = false;
            $scope.selected = [];

        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.EMPL.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });

    $scope.$watch('listFilterOption', function () {
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

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        item.detailList = $scope.subItemList;
        $scope.changeButtonStatusSingle(item);
    };


    $scope.returnToListAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.selectedItem = null;
        $scope.changeButtonStatusAll();
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
        if ($scope.status == 'add') {
            if ($scope.domain == 'PLM_BASE_CUSTOM_SCOPE') {
                CBIItemCustomScopeService.add($scope.source.itemCustom.uuid, $scope.source).success(function (data) {
                    $scope.showInfo('新增数据成功。');
                }).error(function () {
                    $scope.showError('新增失败。');
                });

            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'PLM_BASE_CUSTOM_SCOPE') {
                CBIItemCustomScopeService.modify($scope.source.itemCustom.uuid, $scope.source.uuid,$scope.source).success(function (data) {
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


    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            CBIItemCustomScopeService.delete(item.itemCustom.uuid, item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
            });
        });
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认审核吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                confirm: Constant.CONFIRM[2].value
            };
            CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.confirm = Constant.CONFIRM[2].value;
                $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    $scope.confirmRevertClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认取消审核吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                confirm: Constant.CONFIRM[1].value
            };
            CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.confirm = Constant.CONFIRM[1].value;
                 $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    $scope.confirmSwitchAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == 2) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[1].value
                };
                CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                item.confirm = Constant.CONFIRM[2].value
            });
        } else if (item.confirm == 1) {
            $scope.showConfirm('确认审核吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[2].value
                };
                CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                item.confirm = Constant.CONFIRM[1].value;
            });
        }

    };


    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                status: Constant.STATUS[1].value
            };
            CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.status = Constant.STATUS[1].value;
                 $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    $scope.statusRevertClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                status: Constant.STATUS[2].value
            };
            CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.status = Constant.STATUS[2].value;
                 $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            });
        });
    };


    $scope.statusSwithAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == 2) {
            $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[1].value
                };
                CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                item.status = Constant.STATUS[2].value;
            });
        } else if (item.status == 1) {
            $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[2].value
                };
                CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                item.status = Constant.STATUS[1].value;
            });
        }
    };



    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量审核吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            confirm: Constant.CONFIRM[2].value
                        };
                        var response = CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
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

    $scope.confirmRevertAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量取消审核吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            confirm: Constant.CONFIRM[1].value
                        };
                        var response = CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
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

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量修改启用状态为有效吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            status: Constant.STATUS[1].value
                        };
                        var response = CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
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

    $scope.statusRevertAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量修改启用状态为无效吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            status: Constant.STATUS[2].value
                        };
                        var response = CBIItemCustomScopeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
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


    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = CBIItemCustomScopeService.delete(item.itemCustom.uuid, item.uuid).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('删除数据成功。');
                        $scope.refreshList();

                    });
                }
            });
        }
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
        $scope.changeButtonStatusAll();
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
        $scope.changeButtonStatusAll();

    };
    $scope.exists = function (item, selected) {
        return selected.indexOf(item) > -1;
    };

    $scope.selected = [];

    $scope.resetButtonDisabled = function () {
        $scope.confirmClick = 0;
        $scope.confirmRevertClick = 0;
        $scope.statusClick = 0;
        $scope.statusRevertClick = 0;
        $scope.deleteClick = 0;

    };

    $scope.resetButtonDisabledAll = function () {
        $scope.deleteAllClick = 0;
        $scope.statusRevertAllClick = 0;
        $scope.statusAllClick = 0;
        $scope.confirmRevertAllClick = 0;
        $scope.confirmAllClick = 0;
    };

    $scope.changeButtonStatusAll = function () {
        $scope.resetButtonDisabledAll();
        angular.forEach($scope.selected, function (employee) {
            $scope.processChangeButtonStatusAll(employee);
        });
    };

    $scope.changeButtonStatusSingle = function (employee) {
        $scope.resetButtonDisabled();
        $scope.processChangeButtonStatus(employee);
    };

    $scope.processChangeButtonStatus = function (employee) {
        //confirm:1=未审核/2=已审核/3=审核中/4=退回   status:"1=有效/2=无效
        // 未审核和退回状态的单据
        if (employee.confirm == 1 || employee.item == 4) {
            $scope.confirmRevertClick = 1;
        }

        // 已审核和审核中状态的单据
        if (employee.confirm == 2 || employee.item == 3) {
            $scope.confirmClick = 1;
            $scope.statusRevertClick = 1;
        }

        //有效单据
        if (employee.status == 1) {
            $scope.statusClick = 1;
        }

        //无效单据
        if (employee.status == 2) {
            $scope.statusRevertClick = 1;
            $scope.confirmClick = 1;

        }
    };

      $scope.processChangeButtonStatusAll = function (employee) {
        //confirm:1=未审核/2=已审核/3=审核中/4=退回   status:"1=有效/2=无效
        // 未审核和退回状态的单据
        if (employee.confirm == 1 || employee.item == 4) {
            $scope.confirmRevertAllClick = 1;
        }

        // 已审核和审核中状态的单据
        if (employee.confirm == 2 || employee.item == 3) {
            $scope.confirmAllClick = 1;

            $scope.statusRevertAllClick = 1;
        }

        //有效单据
        if (employee.status == 1) {
            $scope.statusAllClick = 1;
        }

        //无效单据
        if (employee.status == 2) {
            $scope.statusRevertAllClick = 1;
            $scope.confirmAllClick = 1;
        }
    };







});
