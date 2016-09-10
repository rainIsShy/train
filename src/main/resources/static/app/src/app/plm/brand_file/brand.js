angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/plm/brand_file', {
        controller: 'BrandController',
        templateUrl: 'app/src/app/plm/brand_file/brand.html'
    })
}]);

angular.module('IOne-Production').controller('BrandController', function ($scope, BrandFile, BrandPic, Constant, $mdDialog, $timeout, $q, Upload) {
    $scope.BRAND_TYPE = Constant.BRAND_TYPE;
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
            prodType: Constant.PROD_TYPE[0].value
        },
        no: '',
        name: '',
        keyWord: ''
    };

    $scope.menuDisplayOption = {
        'batchDelete': {display: true, name: '批量删除', uuid: 'f08c9c62-b96e-4a1d-afa9-0f2d17f3ad70'},
        'detailDelete': {display: true, name: '删除', uuid: '624e0daa-036a-466a-b829-7967335910c7'}
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
        BrandFile.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.no, $scope.listFilterOption.name, $scope.listFilterOption.keyWord, $scope.RES_UUID_MAP.CBI.BRAND_FILE.RES_UUID)
            .success(function (data) {
                $scope.itemList = data.content;
                $scope.pageOption.totalPage = data.totalPages;
                $scope.pageOption.totalElements = data.totalElements;
                $scope.selectAllFlag = false;
                $scope.selectedItemSize = 0;
                angular.element($('img[ng-src=""]')).prop('src', '');

            });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.BRAND_FILE.RES_UUID).success(function (data) {
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
    $scope.selected = [];

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        $scope.selectedItem.discountRatePercentage = (Math.round($scope.selectedItem.discountRate * 10000) / 100).toFixed(2) + '%';
        item.detailList = $scope.subItemList;
        $scope.displayAdvancedSearPanel = false;
        $scope.selectedItem.brandImagePath = (jQuery.isEmptyObject(item.path) || item.path == null) ? '' : ((item.path.indexOf('IMAGE') == 0) ? item.path : (Constant.BACKEND_BASE + '/app/assets/IMAGE/' + item.path));
        angular.element($('img[ng-src=""]')).prop('src', '');
        $scope.refreshList();

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
        if ($scope.status == 'edit') {
            $scope.selectedItem.discountRatePercentage = (Math.round($scope.selectedItem.discountRate * 10000) / 100).toFixed(2) + '%'
        }
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
        //$scope.refreshList();
        $scope.selectedItem.brandImagePath = (jQuery.isEmptyObject($scope.source.path) || $scope.source.path == null) ? '' : (($scope.source.path.indexOf('IMAGE') == 0) ? $scope.source.path : (Constant.BACKEND_BASE + '/app/assets/IMAGE/' + $scope.source.path));
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
            if ($scope.domain == 'PLM_BASE_BRAND_FILE') {
                BrandFile.add($scope.source).success(function (data) {
                    if ("undefined" != $scope.source.itemPathsUuid && $scope.source.itemPathsUuid != null) {
                        BrandPic.addImage(data.uuid, $scope.source.itemPathsUuid).success(function (response) {
                            $scope.source.path = $scope.getImageFullPath(response.path) + '?time=' + new Date().getTime();
                            $('md-input-container input[ng-model=source\\[key\\]]:gt(0)').prop('disabled', true);
                            $scope.source.brandImagePath = $scope.source.path;
                            $scope.showInfo('新增数据成功。');
                            $scope.refreshList();
                        }).error(function (data) {
                            $scope.showError('新增失败:' + '<br>' + data.message);
                            $scope.refreshList();
                        });
                    }
                    else {
                        $scope.showInfo('新增数据成功。');
                        $scope.refreshList();
                    }
                }).error(function (data) {
                    $scope.showError('新增失败:' + '<br>' + data.message);
                    $scope.refreshList();
                });

            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'PLM_BASE_BRAND_FILE') {
                BrandFile.modify($scope.source.uuid, $scope.source).success(function (data) {
                    $scope.showInfo('修改数据成功。');
                    $scope.source = data;
                    $scope.selectedItem = data;
                    $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
                    //$scope.refreshList();
                }).error(function (data) {
                    $scope.showError('修改失败:' + '<br>' + data.message);
                    $scope.source = angular.copy($scope.selectedItemBackUp);
                    $scope.selectedItem = angular.copy($scope.selectedItemBackUp);
                    //$scope.refreshList();
                });
            }
        }
    };


    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        item.selectedRef = !item.selected;
        if (item.selected == false
            || item.selected == undefined
            || item.selected == null) {
            $scope.selectedItemSize += 1;
            $scope.selected.push(item);
        } else {
            $scope.selectedItemSize -= 1;
            $scope.selectAllFlag = false;
            $scope.selected.pop(item);
        }
        $scope.disableBatchMenuButtons();
    };


    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            BrandFile.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
                $scope.refreshList();
            });
        });
    };

    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selectedItemSize > 0) {
            $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = BrandFile.delete(item.uuid).success(function (data) {
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
        $scope.selected.length = 0;
        if ($scope.selectAllFlag) {
            angular.forEach($scope.itemList, function (item) {
                $scope.selectedItemSize++;
                $scope.selected.push(item);
            })
        }
        $scope.disableBatchMenuButtons();
    };
    $scope.cleanImage = function () {
        $scope.showConfirm('确认移除吗？', '移除后不可恢复。', function () {

            if ($scope.selectedItem && $scope.selectedItem.uuid) {
                BrandPic.deleteImage($scope.selectedItem.uuid).success(function (response) {
                    $scope.selectedItem.path = "";
                    $scope.selectedItem.brandImagePath = "";
                    $scope.refreshList();
                });

            }

        });

    };
    $scope.uploadImage = function (files) {
        $scope.progress = {value: 0};
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: Constant.BACKEND_BASE + '/files',
                    fields: {},
                    file: file
                }).progress(function (evt) {
                    $scope.progress.value = Math.min(100, parseInt(99.0 * evt.loaded / evt.total));
                }).success(function (data) {
                    $timeout(function () {
                        if ($scope.status == 'add') {
                            $scope.source.path = $scope.getImageFullPath(data.path) + '?time=' + new Date().getTime();
                            $('md-input-container input[ng-model=source\\[key\\]]:gt(0)').prop('disabled', true);
                            $scope.source.itemPathsUuid = data.uuid;
                            $scope.source.brandImagePath = $scope.source.path;
                        }
                        else {
                            if ($scope.selectedItem && $scope.selectedItem.uuid) {
                                BrandPic.addImage($scope.selectedItem.uuid, data.uuid).success(function (response) {
                                    $scope.source.path = $scope.getImageFullPath(response.path) + '?time=' + new Date().getTime();
                                    $('md-input-container input[ng-model=source\\[key\\]]:gt(0)').prop('disabled', true);
                                    $scope.selectedItem.brandImagePath = $scope.source.path;
                                });
                            }
                        }
                    });
                }).error(function (data) {
                    $scope.source.path = $scope.getImageFullPath("test") + '?time=' + new Date().getTime();
                    $('md-input-container input[ng-model=source\\[key\\]]:gt(0)').prop('disabled', true);
                    $scope.showError(data.code);
                });
            }
        }
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
                $scope.disabledBatchDelete = false;
            } else if (confirm == '2') {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchCancelConfirm = false;
                $scope.disabledBatchDelete = false;
            } else {
                $scope.disabledBatchConfirm = false;
                $scope.disabledBatchCancelConfirm = true;
                $scope.disabledBatchDelete = false;
            }

            if (diffStatus == true) {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = true;
                $scope.disabledBatchDelete = false;
            } else if (status == '1') {
                $scope.disabledBatchStatus = true;
                $scope.disabledBatchCancelStatus = false;
            } else {
                $scope.disabledBatchConfirm = true;
                $scope.disabledBatchStatus = false;
                $scope.disabledBatchCancelStatus = true;
                $scope.disabledBatchDelete = false;
            }
        }
    };

});
