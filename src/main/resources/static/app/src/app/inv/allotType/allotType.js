angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/inv/allotType', {
        controller: 'AllotTypeController',
        templateUrl: 'app/src/app/inv/allotType/allotType.html'
    })
}]);

angular.module('IOne-Production').controller('AllotTypeController', function ($scope, Constant, AllotTypeService) {

    $scope.queryConditions = {};
    $scope.selectedItem = {};

    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: ''},
        '101-delete': {display: true, name: '删除', uuid: ''},
        '102-edit': {display: true, name: '编辑', uuid: ''},

        '200-cancel': {display: true, name: '取消新增', uuid: ''},
        '201-save': {display: true, name: '保存', uuid: ''},

        '302-save': {display: true, name: '保存', uuid: ''},
        '303-cancel': {display: true, name: '取消修改', uuid: ''},
        '304-quit': {display: true, name: '退出编辑', uuid: ''}
    };

    // add mode
    $scope.preAddMenuAction = function () {
        $scope.selectedItem = {};
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);

    };
    $scope.addMenuAction = function () {
        AllotTypeService.add($scope.selectedItem).then(function (response) {
            $scope.selectedItem = response.data;
            $scope.showInfo('新增数据成功。');
            $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        }, errorHandle);
    };
    $scope.cancelAddMenuAction = function () {
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
    };

    // modify mode
    $scope.enterEditMode = function (item) {
        $scope.selectedItem = item;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };
    $scope.modifyMenuAction = function () {
        AllotTypeService.modify($scope.selectedItem.uuid, $scope.selectedItem).then(function (response) {
            $scope.showInfo('修改数据成功。');
        }, errorHandle);
    };
    $scope.cancelModifyMenuAction = function () {
        AllotTypeService.get($scope.selectedItem.uuid).then(function (response) {
            $scope.selectedItem = response.data;
        }, errorHandle);
    }
    $scope.exitModifyMenuAction = function () {
        AllotTypeService.get($scope.selectedItem.uuid).then(function (response) {
            $scope.selectedItem = response.data;
            $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        }, errorHandle);
    };

    // delete
    $scope.deleteMenuAction = function () {
        $scope.showConfirm('确认删除吗？', '删除後不可恢复。', function () {
            AllotTypeService.delete($scope.selectedItem.uuid).then(function (response) {
                $scope.showInfo('删除数据成功。');
                $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
            }, errorHandle);
        });
    };

    // query
    $scope.fetchList = function () {
        AllotTypeService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.queryConditions).then(function (response) {
            $scope.pageOption.totalPage = response.data.totalPages;
            $scope.pageOption.totalElements = response.data.totalElements;
            $scope.list = response.data.content;
        }, errorHandle);
    }

    function errorHandle(response) {
        var errorMsg = "服務存取失敗";
        if (response.data.code === "Duplicated") errorMsg = "类型编号已重複";
        $scope.showError(errorMsg);
    }

    $scope.clickFormTab = function () {

    };
    $scope.clickListTab = function () {
        $scope.selectedItem = null;
        $scope.fetchList();
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };
});
