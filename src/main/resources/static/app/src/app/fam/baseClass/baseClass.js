angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/fam/baseClass', {
        controller: 'BaseClassController',
        templateUrl: 'app/src/app/fam/baseClass/baseClass.html'
    })
}]);

angular.module('IOne-Production').controller('BaseClassController', function ($scope, BaseClassService, BrandRelationsService, PromotionChannelService, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.detailPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.selected = [];

    $scope.menuDisplayOption = {
        '105-delete': {display: true, name: '删除', uuid: 'cbe0e957-4609-47fa-a793-11efebd32d4b'},
        '106-query': {display: true, name: '查询', uuid: '726ad142-73bc-4c0e-8fee-4e4873c266e3'},
        '107-add': {display: true, name: '新增', uuid: 'c5b1baef-8b52-45ee-a055-87f4e88417b7'},
        '108-edit': {display: true, name: '编辑', uuid: 'aca65674-441b-4859-b1ac-bd4297c64d84'},

        '109-detailAdd': {display: true, name: '点击新增', uuid: '6066e123-a635-47fe-a2ad-7a7d700fd9a0'},
        '110-detailEdit': {display: true, name: '编辑', uuid: 'f100f38c-267f-4903-b470-dc8e00ac6c7c'},
        '111-detailDelete': {display: true, name: '删除', uuid: 'fa879963-2aa8-4a1c-b3b8-bf1514f194b0'},

        '205-batchDelete': {display: true, name: '批量刪除', uuid: 'd710408e-fbba-41a6-b340-bd3398b2db15'}
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.OCM.PROMOTION.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });


    // Check authorization
    $scope.isAuthorized = function (option) {
        if ($scope.menuDisplayOption[option].display &&
            ($scope.menuAuthDataMap[$scope.menuDisplayOption[option].uuid] ||
            $scope.isAdmin() || !$scope.menuDisplayOption[option].uuid)) {
            return true;
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


    $scope.showDetailAddButton = function () {
        return $scope.isAuthorized('109-detailAdd');
    };

    $scope.showDetailEditButton = function () {
        return $scope.isAuthorized('110-detailEdit');
    };

    $scope.showDetailDeleteButton = function () {
        return $scope.isAuthorized('111-detailDelete');
    };

    $scope.showBatchMenu = function () {
        return $scope.showBatchConfirmMenuItem() || $scope.showBatchCancelConfirmMenuItem() ||
            $scope.showBatchDisableStatusMenuItem() || $scope.showBatchEnableStatusMenuItem();
    };

    $scope.canEditItem = function (item) {
        if (item !== null && item !== undefined) {
            return true;
        }

        return false;
    };

    $scope.canDeleteItem = function (item) {
        if (item !== null && item !== undefined) {
            return true;
        }

        return false;
    };

    $scope.canDetailAction = function (item) {
        if (item !== null && item !== undefined) {
            return true;
        }
        return false;
    };

    // Batch operations
    $scope.canBatchDelete = function () {
        return $scope.selected.length > 0 ? true : false;
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,

    };

    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.refreshList = function () {
        BaseClassService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, '', '', $scope.listFilterOption.keyword, RES_UUID_MAP.CBI.BASE_CLASS.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.refreshBrandRelation = function () {
        BrandRelationsService.getAll($scope.detailPageOption.sizePerPage, $scope.detailPageOption.currentPage, $scope.selectedItem.uuid, RES_UUID_MAP.CBI.BASE_CLASS.RES_UUID).success(function (data) {
            $scope.detailItemList = data.content;
            $scope.detailPageOption.totalPage = data.totalPages;
            $scope.detailPageOption.totalElements = data.totalElements;
        });
    };


    $scope.queryDateFormat = function (date) {
        if (date !== undefined) {
            if (date !== null) {
                var formatDate = new Date(date);
                return moment(formatDate).format('YYYY-MM-DD');
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

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

    $scope.queryAction = function () {
        $scope.refreshList();

    };

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.refreshBrandRelation(item);

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
        if (domain == 'OCM_PROM_MST') {
            $scope.addItem = source;
            $scope.addItem.startPromotionDate = source.startPromotionDate != null ? new Date(source.startPromotionDate) : '';
            $scope.addItem.endPromotionDate = source.endPromotionDate != null ? new Date(source.endPromotionDate) : '';
            $scope.addItem.startPurchaseDate = source.startPurchaseDate != null ? new Date(source.startPurchaseDate) : '';
            $scope.addItem.endPurchaseDate = source.endPurchaseDate != null ? new Date(source.endPurchaseDate) : '';
        } else {
            $scope.addDetailItem = source;
        }
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
        if (domain == 'CBI_BASE_CLASS') {
            // $scope.status = 'addMaster';
            $scope.addItem = {};
        } else if (domain == 'CBI_BASE_CLASS_BRAND_R') {
            // $scope.status = 'addDetail';
            $scope.addDetailItem = {};
        }
    };

    /**
     * Save object according current status and domain.
     */
    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {
            if ($scope.domain == 'CBI_BASE_CLASS') {
                BaseClassService.add($scope.source).success(function (data) {
                    $scope.refreshList();
                    $scope.showInfo("新增成功!");
                    $scope.listItemAction();
                });
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'CBI_BASE_CLASS') {

                BaseClassService.modify($scope.selectedItem.uuid, $scope.selectedItem).success(function () {
                    $scope.refreshList();
                    $scope.showInfo("修改成功!");
                    $scope.listItemAction();
                    $scope.selectedItem = data;
                });
            }
        }
    };


    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem) {
                BrandRelationsService.delete(detail.uuid).success(function () {
                    $scope.refreshBrandRelation($scope.selectedItem);
                    $scope.showInfo("刪除成功!");
                })
            }
        });
    };


    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        var idx = $scope.selected.indexOf(item);
        if (idx > -1) {
            $scope.selected.splice(idx, 1);
        }
        else {
            $scope.selected.push(item);
        }
        $scope.selectItemCount = $scope.selected.length;
        console.log($scope.selected)
    };


    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        BaseClassService.checkDelete(item.uuid).success(function (errorList) {
            if (errorList.length > 0) {
                angular.forEach(errorList, function (error) {
                    if (error == 'PMM_ORDER_MST') {
                        $scope.showError('采购单己使用，无法删除!');
                    }

                    if (error == 'CBI_GROUP_EMPLOYEE_CLASS_R') {
                        $scope.showError('跟单员权限维护己使用，无法删除!');
                    }
                })
            } else {
                BrandRelationsService.getAllByBaseClassUuid(item.uuid).success(function (data) {
                    if (data.totalElements > 0) {
                        $scope.showConfirm('此分类己维护品牌，确认删除吗？', '删除后不可恢复。', function () {
                            if ($scope.selectedItem) {
                                BaseClassService.delete(item.uuid).success(function () {
                                    $scope.refreshList();

                                    $scope.showInfo("刪除成功!");
                                    $scope.selectedItem = null
                                })
                            }
                        });

                    } else {
                        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                            if ($scope.selectedItem) {
                                BaseClassService.delete(item.uuid).success(function () {
                                    $scope.refreshList();

                                    $scope.showInfo("刪除成功!");
                                    $scope.selectedItem = null
                                });
                            }
                        });
                    }
                })
            }
        });
    };

    $scope.confirmAllClickAction = function (event) {
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量启用吗？', '', function () {
                var promotionUpdateInput = {
                    confirm: '2'
                };
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = BaseClassService.modify(item.uuid, promotionUpdateInput).success(function () {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('审核启用成功。');
                        $scope.refreshList();
                        $scope.selectItemCount = 0;
                        $scope.selected = [];
                    });
                }
            });
        }
    };


    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {

            var promises2 = [];
            var canDelete = true;
            angular.forEach($scope.selected, function (baseClass) {
                var response = BaseClassService.checkDelete(baseClass.uuid).success(function (errorList) {
                    if (errorList.length > 0) {
                        canDelete = false;
                        angular.forEach(errorList, function (error) {
                            if (error == 'PMM_ORDER_MST') {
                                $scope.showError('采购单己使用分类：' + baseClass.name + '，无法删除!');
                            }

                            if (error == 'CBI_GROUP_EMPLOYEE_CLASS_R') {
                                $scope.showError('跟单员权限维护己使用分类：' + baseClass.name + '，无法删除!');
                            }

                        })
                    }
                });

                promises2.push(response);
            });

            $q.all(promises2).then(function () {
                if (canDelete) {
                    $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                        if ($scope.selected) {
                            var promises = [];
                            angular.forEach($scope.selected, function (item) {
                                var response = BaseClassService.delete(item.uuid).success(function (data) {
                                });
                                promises.push(response);
                            });
                            $q.all(promises).then(function () {
                                $scope.showInfo('删除数据成功。');
                                $scope.refreshList();
                                $scope.selectItemCount = 0;
                            });
                        }
                    });
                }
            });


        }
    };

    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
    };

    $scope.openBrandDlg = function () {
        $mdDialog.show({
            controller: 'BrandRelationSelectController',
            templateUrl: 'app/src/app/fam/baseClass/addBrandRelation.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                baseClassUuid: $scope.selectedItem.uuid
            }
        }).then(function (dataList) {
            var promises = [];
            for (var i = 0; i < dataList.length; i++) {
                var input = {
                    baseClassUuid: $scope.selectedItem.uuid,
                    brandUuid: dataList[i]
                };

                var response = BrandRelationsService.add(input).success(function () {

                });
                promises.push(response);
            }

            $q.all(promises).then(function () {
                $scope.refreshBrandRelation();
                $scope.showInfo('新增成功!');

            })

        });
    };


});


angular.module('IOne-Production').controller('BrandRelationSelectController', function ($scope, $q, $mdDialog, BrandFile, baseClassUuid) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.refreshData = function () {
        BrandFile.getAllByBaseClassUuid($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.searchNo, $scope.searchName, baseClassUuid).success(function (data) {
            $scope.allData = data.content;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.selectAllFlag = false;
            $scope.checkedAll($scope.allData, $scope.selected);
        });
    };

    $scope.selected = [];
    $scope.addToggle = function (item, selected) {
        var idx = selected.indexOf(item.uuid);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(item.uuid);
        }
    };

    $scope.selectAllAction = function () {
        if ($scope.selectAllFlag) {
            // $scope.selected = [];
            angular.forEach($scope.allData, function (item) {
                var idx = $scope.selected.indexOf(item.uuid);
                if (idx > -1) {
                    $scope.selected.splice(idx, 1);
                }
            })
        } else {
            angular.forEach($scope.allData, function (item) {
                $scope.selected.push(item.uuid);
            })
        }

    };

    $scope.checkedAll = function (itemList, list) {
        var checked = true;
        angular.forEach(itemList, function (item) {
            if (list.indexOf(item.uuid) == -1) {
                checked = false;
            }
        });
        $scope.selectAllFlag = checked;

    };


    $scope.exists = function (item, list) {
        return list.indexOf(item.uuid) > -1;
    };

    $scope.refreshData();

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.selected);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

});
