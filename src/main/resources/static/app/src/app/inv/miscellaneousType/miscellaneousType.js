angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/miscellaneousType', {
        controller: 'MiscellaneousTypeController',
        templateUrl: 'app/src/app/inv/miscellaneousType/miscellaneousType.html'
    })
}]);

angular.module('IOne-Production').controller('MiscellaneousTypeController', function ($scope, MiscellaneousTypeService, Constant) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 100,
        totalElements: 100
    };

    $scope.listFilterOption = {
        status: "",
        keyWord: "",
        sort: ""
    };

    $scope.sortByAction = function (field) {
        $scope.listFilterOption.sort = field;
    };

    $scope.refreshList = function () {
        $scope.listFilterOption.status = $scope.listFilterOption.status === Constant.STATUS[0].value ? "" : $scope.listFilterOption.status;
        MiscellaneousTypeService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption).then(function (response) {
            $scope.pageOption.totalPage = response.data.totalPages;
            $scope.pageOption.totalElements = response.data.totalElements;
            $scope.itemList = response.data.content;
        }, errorHandle);
    };

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);



    $scope.selectAllFlag = false;

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
            if ($scope.domain == 'PSO_ORDER_MST') {
                //TODO add order mst
                console.info('add order mst...');
            } else if ($scope.domain == 'PSO_ORDER_DTL') {
                //TODO add order dtl
                console.info('add order dtl...');
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'PSO_ORDER_MST') {
                //TODO edit order mst
                console.info('edit order mst...');
            } else if ($scope.domain == 'PSO_ORDER_DTL') {
                //TODO edit order dtl
                console.info('edit order dtl...');
            }
        }
    };

    /**
     * Delete detail item
     */
    $scope.deleteDetailAction = function (detail) {
        //TODO ...
    };



    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('confirm...');
        //TODO ...
    };

    $scope.statusToggleAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('status...');
        MiscellaneousTypeService.modify(item.uuid, item).then(function (response) {
            $scope.showInfo('启用状态变更成功。');
        }, errorHandle);
    };

    $scope.releaseClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('release...');
        //TODO ...
    };

    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        console.info('delete...');
        $scope.showConfirm('确认删除吗？', '删除後不可恢复。', function () {
            MiscellaneousTypeService.delete(item.uuid).then(function (response) {
                $scope.showInfo('删除数据成功。');
            }, errorHandle);
        });
    };

    function errorHandle(response) {
        var errorMsg = "服務存取失敗";
        if (response.data.code === "Duplicated") errorMsg = "类型编号已重複";
        $scope.showError(errorMsg);
    }

    $scope.selectItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
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
});
