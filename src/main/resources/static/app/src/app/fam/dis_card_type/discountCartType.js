angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/fam/discountCartType', {
        controller: 'DiscountCartTypeController',
        templateUrl: 'app/src/app/fam/dis_card_type/discountCartType.html'
    })
}]);

angular.module('IOne-Production').controller('DiscountCartTypeController', function ($scope, $q, FAMDiscountCartTypeService, $mdDialog, Constant) {
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
        '405-delete': {display: true, name: '删除', uuid: '0B5593F6-5135-4039-B212-BA2E972E7285'},
        '406-query': {display: true, name: '查询', uuid: '89E63AA5-FF0D-4EF4-89EB-AF3A477EAC60'},
        '415-deleteAll': {display: true, name: '批量删除', uuid: 'E6F10493-2448-448F-96FC-D2BE0541A871'},
    };

    $scope.refreshList = function () {
        FAMDiscountCartTypeService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.status,
            $scope.theMax, $scope.RES_UUID_MAP.CBI.EMPL.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            $scope.resetButtonDisabled();
            $scope.selectAllFlag = false;
        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.DISCOUNTCART_TYPE.RES_UUID).success(function (data) {
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
            if ($scope.domain == 'FAM_BASE_DIS_CARD_TYPE') {
                FAMDiscountCartTypeService.add($scope.source).success(function (data) {
                    $scope.showInfo('新增数据成功。');
                }).error(function (data) {
                    $scope.showError('新增失败:' + '<br>' + data.message);
                });

            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'FAM_BASE_DIS_CARD_TYPE') {
                FAMDiscountCartTypeService.modify($scope.source.uuid, $scope.source).success(function (data) {
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
            FAMDiscountCartTypeService.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
            });
        });
    };


    $scope.deleteAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var response = FAMDiscountCartTypeService.delete(item.uuid).success(function (data) {
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
        $scope.deleteAllClickActionStatus = 0;
        $scope.deleteClickActionStatus = 0;
    };


    $scope.changeButtonStatusAll = function () {
        $scope.resetButtonDisabled();
        angular.forEach($scope.selected, function (discountCartType) {
            $scope.changeButtonStatus(discountCartType);
        });
    };

    $scope.changeButtonStatusSingle = function (discountCartType) {
        $scope.resetButtonDisabled();
        $scope.changeButtonStatus(discountCartType);
    };

    $scope.changeButtonStatus = function (discountCartType) {
        // 已审核和审核中状态的单据
        if (discountCartType.confirm == 2 || discountCartType.item == 3) {
//                         $scope.deleteClickActionStatus = 1;
//                         $scope.deleteAllClickActionStatus = 1;
        }
    };
});
