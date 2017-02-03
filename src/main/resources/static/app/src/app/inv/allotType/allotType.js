angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/allotType', {
        controller: 'AllotTypeController',
        templateUrl: 'app/src/app/inv/allotType/allotType.html'
    })
}]);

angular.module('IOne-Production').controller('AllotTypeController', function ($scope, Constant, AllotTypeService) {

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.listFilterOption = {
        status: Constant.STATUS[0].value,
        keyWord: "",
        sort: "no"
    };

    $scope.selectAllFlag = false;

    $scope.sortByAction = function (field) {
        $scope.listFilterOption.sort = field;
    };

    $scope.refreshList = function () {
        var queryConditions = angular.copy($scope.listFilterOption);
        queryConditions.status = $scope.listFilterOption.status === Constant.STATUS[0].value ? "" : $scope.listFilterOption.status;
        AllotTypeService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, queryConditions).then(function (response) {
            $scope.pageOption.totalPage = response.data.totalPages;
            $scope.pageOption.totalElements = response.data.totalElements;
            $scope.itemList = response.data.content;
        }, errorHandle);
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
            AllotTypeService.add($scope.source).then(function (response) {
                $scope.source = response.data;
                $scope.showInfo('新增数据成功。');
                $scope.refreshList();
                $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
            }, errorHandle);
        } else if ($scope.status == 'edit') {
            AllotTypeService.modify($scope.source.uuid, $scope.source).then(function (response) {
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
    };

    $scope.statusToggleAction = function (event, item) {
        console.info('status...');
        AllotTypeService.modify(item.uuid, item).then(function (response) {
            $scope.showInfo('启用状态变更成功。');
        }, errorHandle);
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('delete...');
        $scope.showConfirm('确认删除吗？', '删除後不可恢复。', function () {
            AllotTypeService.delete(item.uuid).then(function (response) {
                $scope.showInfo('删除数据成功。');
                $scope.refreshList();
            }, errorHandle);
        });
    };

    function errorHandle(response) {
        var errorMsg = "服務存取失敗";
        if (response.data.code === "Duplicated") errorMsg = "类型编号已重複";
        $scope.showError(errorMsg);
    }

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
     * batch operator
     */
    $scope.batchEnable = function (event) {
        $scope.stopEventPropagation(event);
        console.info('batchEnable...');
        var checkedItemList = fetchCheckedItemList();
        angular.forEach(checkedItemList, function (item) {
            item.status = Constant.STATUS[1].value;
        });

        AllotTypeService.batchModify(checkedItemList).then(function (response) {
            $scope.showInfo('批量启用成功。');
            $scope.selectAllFlag = false;
            $scope.refreshList();
        }, errorHandle);

    }

    $scope.batchDisable = function (event) {
        $scope.stopEventPropagation(event);
        console.info('batchDisable...');
        var checkedItemList = fetchCheckedItemList();
        angular.forEach(checkedItemList, function (item) {
            item.status = Constant.STATUS[2].value;
        });

        AllotTypeService.batchModify(checkedItemList).then(function (response) {
            $scope.showInfo('批量禁用成功。');
            $scope.selectAllFlag = false;
            $scope.refreshList();
        }, errorHandle);
    };

    $scope.batchDelete = function (event) {
        $scope.stopEventPropagation(event);
        console.info('batchDelete...');
        var checkedItemList = fetchCheckedItemList();
        $scope.showConfirm('确认执行批量删除吗？', '删除後不可恢复。', function () {
            AllotTypeService.batchDelete(checkedItemList).then(function (response) {
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
