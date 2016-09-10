angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/ocm/parameters', {
        controller: 'OCMParametersController',
        templateUrl: 'app/src/app/ocm/parameters/parameters.html'
    })
}]);

angular.module('IOne-Production').controller('OCMParametersController', function ($scope, $q, OCMParametersService, Constant) {
    $scope.pageOption = {
        sizePerPage: 10,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.listFilterOption = {
        coefficient: '',
        discount: ''
    };

    $scope.menuDisplayOption = {
        'delete': {display: true, name: '删除', uuid: ''},
        'query': {display: true, name: '查询', uuid: ''},
        'add': {display: true, name: '添加', uuid: ''},
        'edit': {display: true, name: '修改', uuid: ''}
    };

    /* Add "RES_UUID_MAP.OCM.PARAMETERS.RES_UUID" and  uncomment this if we need checking authorization.
     $scope.getMenuAuthData($scope.RES_UUID_MAP.OCM.PARAMETERS.RES_UUID).success(function (data) {
     $scope.menuAuthDataMap = $scope.menuDataMap(data);
     });
     */

    $scope.selectedItem = null;

    $scope.refreshList = function () {
        OCMParametersService.getAllWithPaging($scope.pageOption.sizePerPage, $scope.pageOption.currentPage,
            $scope.listFilterOption.coefficient, $scope.listFilterOption.discount).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.refreshList();

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
        return $scope.isAuthorized('delete');
    };

    $scope.showQueryButton = function () {
        return $scope.isAuthorized('query');
    };

    $scope.showAddButton = function () {
        return $scope.isAuthorized('add');
    };

    $scope.showEditButton = function () {
        return $scope.isAuthorized('edit');
    };

    // UI layout operations
    $scope.sortByAction = function (field) {
        $scope.sortByField = field;
        $scope.sortType = '';
    };

    $scope.showItemDetailsAction = function (item) {
        $scope.selectedItem = item;
    };

    $scope.hideItemDetailsAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.selectedItem = null;
    };

    $scope.returnToViewUIAction = function () {
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS);
    };

    // Query, add, delete, edit, save an item operations
    $scope.queryAction = function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    };

    $scope.preAddItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'add';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
    };

    $scope.deleteItemAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            OCMParametersService.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
            });
        });
    };

    $scope.editItemAction = function (source, domain, desc) {
        $scope.changeViewStatus(Constant.UI_STATUS.EDIT_UI_STATUS);
        $scope.status = 'edit';
        $scope.desc = desc;
        $scope.source = source;
        $scope.domain = domain;
        $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
    };

    $scope.saveItemAction = function () {
        if ($scope.status == 'add') {
            if ($scope.domain == 'OCM_PARAMETER') {
                OCMParametersService.add($scope.source).success(function (data) {
                    $scope.refreshList();
                    $scope.showInfo('新增数据成功。');
                }).error(function () {
                    $scope.showError('新增失败。');
                });
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'OCM_PARAMETER') {
                OCMParametersService.modify($scope.source.uuid, $scope.source).success(function (data) {
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
});