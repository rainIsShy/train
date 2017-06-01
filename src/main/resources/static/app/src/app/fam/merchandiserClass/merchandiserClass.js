angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/fam/merchandiserClass', {
        controller: 'MerchandiserClassController',
        templateUrl: 'app/src/app/fam/merchandiserClass/merchandiserClass.html'
    })
}]);

angular.module('IOne-Production').controller('MerchandiserClassController', function ($scope, GroupUserService,PromotionChannelService, CBIGroupEmployeeChanRService, CBIGroupEmployeeClassRService, CBIGroupEmployeeBrandRService,
IoneAdapterService, Constant, $mdDialog, $q) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.detailPageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.selected = [];

    $scope.groupEmployeeClassRFlag = true;
    $scope.menuDisplayOption = {
//        '108-detailAddClass': {display: $scope.groupEmployeeClassRFlag, name: '点击新增', uuid: '151045CE-1818-41DB-98A2-06AC67E3AC2F'},
        '109-detailAdd': {display: true, name: '点击新增', uuid: 'CD40ED57-F398-4273-9296-38392DA1E7C4'},
        '111-detailDelete': {display: true, name: '删除', uuid: '69D7F98C-1D59-449A-A8BE-6771266A3EA5'}
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.MERCHANDISER_CLASS.RES_UUID).success(function (data) {
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

//    $scope.showAddClassButton = function () {
//        return $scope.isAuthorized('108-detailAddClass');
//    };

    $scope.showDetailAddButton = function () {
        return $scope.isAuthorized('109-detailAdd');
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

    $scope.merchandiserFlag = 'Y';
    $scope.refreshList = function () {
        GroupUserService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage,$scope.listFilterOption.keyword, RES_UUID_MAP.CBI.MERCHANDISER_CLASS.RES_UUID, $scope.merchandiserFlag).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.pageOptionChanR = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.refreshGroupEmployeeChanRelation = function () {
        CBIGroupEmployeeChanRService.getAll($scope.pageOptionChanR.sizePerPage, $scope.pageOptionChanR.currentPage, $scope.selectedItem.uuid, RES_UUID_MAP.CBI.MERCHANDISER_CLASS.RES_UUID).success(function (data) {
            $scope.chanDetailItemList = data.content;
            $scope.pageOptionChanR.totalPage = data.totalPages;
            $scope.pageOptionChanR.totalElements = data.totalElements;
        });
    };

    $scope.refreshGroupEmployeeClassRelation = function () {
        CBIGroupEmployeeClassRService.getAll($scope.detailPageOption.sizePerPage, $scope.detailPageOption.currentPage, $scope.selectedItem.uuid, RES_UUID_MAP.CBI.MERCHANDISER_CLASS.RES_UUID).success(function (data) {
            $scope.classDetailItemList = data.content;
            if ($scope.classDetailItemList.length > 0) {
                $scope.groupEmployeeClassRFlag = false;
            } else {
                $scope.groupEmployeeClassRFlag = true;
            }
        });
    };

    $scope.pageOptionBrandR = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };
    $scope.refreshGroupEmployeeBrandRelation = function () {
        CBIGroupEmployeeBrandRService.getAll($scope.pageOptionBrandR.sizePerPage, $scope.pageOptionBrandR.currentPage, $scope.selectedItem.uuid, RES_UUID_MAP.CBI.MERCHANDISER_CLASS.RES_UUID).success(function (data) {
            $scope.brandDetailItemList = data.content;
            $scope.pageOptionBrandR.totalPage = data.totalPages;
            $scope.pageOptionBrandR.totalElements = data.totalElements;
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

    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.refreshGroupEmployeeChanRelation(item);
        $scope.refreshGroupEmployeeClassRelation(item);
        $scope.refreshGroupEmployeeBrandRelation(item);
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


    $scope.deleteChanDetailAction = function (detail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem) {
                CBIGroupEmployeeChanRService.delete(detail.uuid).success(function () {
                    $scope.refreshGroupEmployeeChanRelation($scope.selectedItem);
                    $scope.showInfo("刪除成功!");
                });
            }
        });
    };

    $scope.deleteClassDetailAction = function (detail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem) {
                CBIGroupEmployeeClassRService.delete(detail.uuid).success(function () {
                    $scope.refreshGroupEmployeeClassRelation($scope.selectedItem);
                    $scope.showInfo("刪除成功!");
                });
            }
        });
    };

    $scope.deleteBrandDetailAction = function (detail) {
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem) {CBIGroupEmployeeBrandRService
                CBIGroupEmployeeBrandRService.delete(detail.uuid).success(function () {
                    $scope.refreshGroupEmployeeBrandRelation($scope.selectedItem);
                    $scope.showInfo("刪除成功!");
                });
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
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            if ($scope.selectedItem) {
                GroupUserService.delete(item.uuid).success(function () {
                    $scope.refreshList();

                    $scope.showInfo("刪除成功!");
                    $scope.selectedItem = null
                });
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
                        var response = GroupUserService.modify(item.uuid, promotionUpdateInput).success(function () {
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
            $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = GroupUserService.delete(item.uuid).success(function (data) {
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
    };

    $scope.openGroupEmployeeChanRDlg = function () {
        $mdDialog.show({
            controller: 'GroupEmployeeChanRController',
            templateUrl: 'app/src/app/fam/merchandiserClass/addGroupEmployeeChanR.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                groupEmployeeUuid: $scope.selectedItem.uuid
            }
        }).then(function (dataList) {
            var promises = [];
            for (var i = 0; i < dataList.length; i++) {
                var input = {
                    aamGroupEmployeeUuid: $scope.selectedItem.uuid,
                    ocmBaseChanUuid: dataList[i]
                };
                var response = CBIGroupEmployeeChanRService.add(input).success(function () {
                });
                promises.push(response);
            }
            $q.all(promises).then(function () {
                $scope.refreshGroupEmployeeChanRelation();
                $scope.showInfo('新增成功!');
                var param = {
                    'AAM_GROUP_EMPLOYEE_UUID': $scope.selectedItem.uuid,
                    'SYNC_TYPE': 'cbi_group_employee_chan_r'
                };
                IoneAdapterService.transferIoneAdapter("/groupUserTask", param, $scope, function (response) {
                }).error(function (errResp) {
                   $scope.showError("经销商同步出错");
                });

            })
        });
    };

    $scope.openGroupEmployeeClassRDlg = function () {
        $mdDialog.show({
            controller: 'GroupEmployeeClassRController',
            templateUrl: 'app/src/app/fam/merchandiserClass/addGroupEmployeeClassR.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (dataList) {
            var promises = [];
            for (var i = 0; i < dataList.length; i++) {
                var input = {
                    aamGroupEmployeeUuid: $scope.selectedItem.uuid,
                    cbiBaseClassUuid: dataList[i]
                };
                var response = CBIGroupEmployeeClassRService.add(input).success(function () {

                });
                promises.push(response);
            }
            $q.all(promises).then(function () {
                $scope.refreshGroupEmployeeClassRelation();
                $scope.showInfo('新增成功!');
            })
        });
    };


    $scope.openGroupEmployeeBrandRDlg = function () {
        $mdDialog.show({
            controller: 'GroupEmployeeBrandRController',
            templateUrl: 'app/src/app/fam/merchandiserClass/addGroupEmployeeBrandR.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                groupEmployeeUuid: $scope.selectedItem.uuid
            }
        }).then(function (dataList) {
            var promises = [];
            for (var i = 0; i < dataList.length; i++) {
                var input = {
                    aamGroupEmployeeUuid: $scope.selectedItem.uuid,
                    plmBaseBrandFileUuid: dataList[i]
                };
                var response = CBIGroupEmployeeBrandRService.add(input).success(function () {
                });
                promises.push(response);
            }
            $q.all(promises).then(function () {
                $scope.refreshGroupEmployeeBrandRelation();
                $scope.showInfo('新增成功!');
                var param = {
                    'AAM_GROUP_EMPLOYEE_UUID': $scope.selectedItem.uuid,
                    'SYNC_TYPE': 'cbi_group_employee_class_r'
                };
                IoneAdapterService.transferIoneAdapter("/groupUserTask", param, $scope, function (response) {
                }).error(function (errResp) {
                   $scope.showError("跟单同步出错");
                });
            })
        });
};

});

angular.module('IOne-Production').controller('GroupEmployeeClassRController', function ($scope, $q, $mdDialog, $mdToast, BaseClassService) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.searchClassQuery = {};

    $scope.refreshData = function () {
        BaseClassService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.searchClassQuery.no, $scope.searchClassQuery.name, '', '', RES_UUID_MAP.CBI.MERCHANDISER_CLASS.RES_UUID).success(function (data) {
            $scope.allClassData = data.content;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
        });
    };

    $scope.$watch('searchClassQuery', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshData();
    }, true);

    $scope.selected = [];
    $scope.addToggle = function (item, selected) {
        $scope.tempSelectItem = item;
        $scope.selectOneFlag = item.uuid;
    };

    $scope.refreshData();

    $scope.hideDlg = function () {
        $scope.selected.push($scope.tempSelectItem.uuid);
        if ($scope.selected.length > 1) {
            toastr["warning"]('不能添加多条跟单分组。');
            return;
        }
        $mdDialog.hide($scope.selected);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };

});


angular.module('IOne-Production').controller('GroupEmployeeChanRController', function ($scope, $q, $mdDialog, ChannelService, groupEmployeeUuid) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };
    $scope.searchQuery = {};

    $scope.refreshData = function () {
        ChannelService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage,'', '', $scope.searchQuery.name, $scope.searchQuery.no, RES_UUID_MAP.CBI.MERCHANDISER_CLASS.RES_UUID, groupEmployeeUuid).success(function (data) {
            $scope.allData = data.content;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
            if ($scope.selected.length > 0) {
                angular.forEach($scope.allData, function (itemData) {
                    if ($scope.selected.indexOf(itemData.uuid) > -1) {
                        itemData.selected = true;
                    }
                });
            }
            $scope.selectAllFlag = false;
            if ($scope.alreadyCurrentPage.indexOf($scope.pageOption.currentPage) > -1) {
                 $scope.selectAllFlag = true;
            }

        });
    };

    $scope.$watch('searchQuery', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshData();
    }, true);

    $scope.selected = [];
    $scope.alreadyCurrentPage = [];
    $scope.selectAllAction = function () {
        angular.forEach($scope.allData, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
                if ($scope.alreadyCurrentPage.indexOf($scope.pageOption.currentPage) > -1) {

                } else {
                    $scope.selected.push(item.uuid);
                }
            } else {
                item.selected = false;
                var  indexFalse = $scope.selected.indexOf(item.uuid);
                if (indexFalse > -1) {
                    $scope.selected.splice(indexFalse,1);
                }
            }
        })
        $scope.alreadyCurrentPage.push($scope.pageOption.currentPage);
    };

    $scope.addToggle = function (item, selected) {
        var idx = selected.indexOf(item.uuid);
        if (idx > -1) {
             selected.splice(idx, 1);
        }
        else {
            selected.push(item.uuid);
        }
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


angular.module('IOne-Production').controller('GroupEmployeeBrandRController', function ($scope, $q, $mdDialog, BrandFile,groupEmployeeUuid) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.searchBrandQuery = {};

    $scope.maxCurrentPage = [];
    $scope.refreshData = function () {
        BrandFile.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.searchBrandQuery.no, $scope.searchBrandQuery.name,groupEmployeeUuid).success(function (data) {
            $scope.allBrandData = data.content;
            $scope.pageOption.totalElements = data.totalElements;
            $scope.pageOption.totalPage = data.totalPages;
            if ($scope.selected.length > 0) {
                angular.forEach($scope.allBrandData, function (itemBrand) {
                    if ($scope.selected.indexOf(itemBrand.uuid) > -1) {
                        itemBrand.selected = true;
                    }
                });
            }
            $scope.selectAllFlag = false;
            if ($scope.alreadyCurrentPage.indexOf($scope.pageOption.currentPage) > -1) {
                $scope.selectAllFlag = true;
            }
        });
    };

    $scope.$watch('searchBrandQuery', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshData();
    }, true);

    $scope.selected = [];
    $scope.alreadyCurrentPage = [];
    $scope.selectAllAction = function () {
        angular.forEach($scope.allBrandData, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
                if ($scope.alreadyCurrentPage.indexOf($scope.pageOption.currentPage) > -1) {

                } else {
                    $scope.selected.push(item.uuid);
                }
            } else {
                item.selected = false;
                var  indexFalse = $scope.selected.indexOf(item.uuid);
                if (indexFalse > -1) {
                    $scope.selected.splice(indexFalse,1);
                }
            }
        })
        $scope.alreadyCurrentPage.push($scope.pageOption.currentPage);
    };

    $scope.addToggle = function (item, selected) {
        var idx = selected.indexOf(item.uuid);
        if (idx > -1) {
             selected.splice(idx, 1);
        }
        else {
            selected.push(item.uuid);
        }
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