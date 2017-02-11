angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/itemUnitConversion', {
        controller: 'ItemUnitConversionController',
        templateUrl: 'app/src/app/inv/itemUnitConversion/itemUnitConversion.html'
    })
}]);

angular.module('IOne-Production').controller('ItemUnitConversionController', function ($scope, ItemUnitConversionService, Constant) {
    $scope.Constant = Constant;
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,
        sort: "itemNo"
    };

    $scope.selectAllFlag = false;

    $scope.sortByAction = function (field) {
        $scope.listFilterOption.sort = field;
    };

    $scope.refreshList = function () {
        var queryConditions = angular.copy($scope.listFilterOption);
        queryConditions.status = $scope.listFilterOption.status === Constant.STATUS[0].value ? "" : $scope.listFilterOption.status;
        ItemUnitConversionService.getAllGroupByItem($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, queryConditions).then(function (response) {
            $scope.pageOption.totalPage = response.data.totalPages;
            $scope.pageOption.totalElements = response.data.totalElements;
            $scope.itemList = response.data.content;
        }, errorHandle);
    };
    /**
     *  selectable checkbox
     */
    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
    }

    $scope.selectAllAction = function () {
        angular.forEach($scope.itemList, function (item) {
            if ($scope.selectAllFlag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
    }
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
            ItemUnitConversionService.add($scope.source).then(function (response) {
                $scope.source = response.data;
                $scope.showInfo('新增数据成功。');
                $scope.refreshList();
                $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
            }, errorHandle);
        } else if ($scope.status == 'edit') {
            ItemUnitConversionService.modify($scope.source.uuid, $scope.source).then(function (response) {
                $scope.showInfo('数据变更成功。');
                $scope.refreshList();
                $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
            }, errorHandle);
        }
    };

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = angular.copy(item);
        queryByDetailByItem($scope.selectedItem);
    };

    $scope.statusToggleAction = function (event, item) {
        console.info('status...');
        ItemUnitConversionService.modify(item.uuid, item).then(function (response) {
            $scope.showInfo('启用状态变更成功。');
            $scope.refreshList();
        }, errorHandle);
    };

    $scope.deleteClickAction = function (detail) {
        console.info('delete...');
        $scope.showConfirm('确认删除吗？', '删除後不可恢复。', function () {
            ItemUnitConversionService.delete(detail.uuid).then(function (response) {
                ItemUnitConversionService.getAll(100, 0, {itemUuid: detail.item.uuid}).then(function (response) {
                    $scope.selectedItem.detailList = response.data.content;
                    $scope.showInfo('删除数据成功。');
                    $scope.refreshList();
                    if ($scope.selectedItem.detailList.length == 0) $scope.selectedItem = null;
                }, errorHandle);
            }, errorHandle);
        });
    };
    $scope.deleteByItem = function (selectedItem) {
        console.info('delete...');
        var list = [];
        list.push(selectedItem);
        $scope.showConfirm('确认删除吗？', '删除後不可恢复。', function () {
            ItemUnitConversionService.batchDelete(list).then(function (response) {
                $scope.showInfo('删除数据成功。');
                $scope.selectedItem = null;
                $scope.refreshList();
            }, errorHandle);
        });
    };

    function errorHandle(response) {
        var errorMsg = "服務存取失敗";
        if (response.data.code === "Duplicated") errorMsg = "商品或计算单位重複";
        $scope.showError(errorMsg);
    }

    /**
     *  selectable checkbox
     */
    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
    }

    /**
     * Show more panel when clicking the 'show more' on every item
     */
    $scope.toggleMorePanelAction = function (item) {
        item.showMorePanel = !item.showMorePanel;

        if (item.showMorePanel) {
            queryByDetailByItem(item);
        }
    };

    function queryByDetailByItem(item) {
        ItemUnitConversionService.getAll(100, 0, {itemUuid: item.uuid}).then(function (response) {
            item.detailList = response.data.content;
        }, errorHandle);
    }

    /**
     * batch operate
     */
    $scope.batchDelete = function (event) {
        $scope.stopEventPropagation(event);
        console.info('batchDelete...');
        var checkedItemList = fetchCheckedItemList();
        $scope.showConfirm('确认执行批量删除吗？', '删除後不可恢复。', function () {
            console.log("!!!!");
            ItemUnitConversionService.batchDelete(checkedItemList).then(function (response) {
                $scope.showInfo('批量删除数据成功。');
                $scope.refreshList();
            }, errorHandle);
        });
    };

    function fetchCheckedItemList() {
        var checkedItemList = [];
        angular.forEach($scope.itemList, function (item) {
            if (item.selected) {
                checkedItemList.push(angular.copy(item));
            }
        });
        return checkedItemList;
    }


    /**
     * init
     */
    function init() {
        $scope.refreshList();
    }

    init();
});
