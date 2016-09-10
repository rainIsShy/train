angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/auth/func', {
        controller: 'FuncController',
        templateUrl: 'app/src/app/auth/function/function.html'
    })
}]);

angular.module('IOne-Production').controller('FuncController', function($scope, $http, $mdDialog, Constant, FunctionService, GroupFunctionService) {
    $scope.pageOption = {
        sizePerPage: 20,
        currentPage: 0,
        totalPage: 0,
        totalElements: 10
    };

    $scope.listFilterOption = {
        status :  Constant.STATUS[0].value
    };

    $scope.$watch('listFilterOption', function(newValue, oldValue) {
        if(newValue.status != oldValue.status) {
            $scope.pageOption.currentPage = 0;
            $scope.pageOption.totalPage = 0;
            $scope.pageOption.totalElements = 0;
            $scope.refreshAllEntities();
        }
    }, true);

    $scope.listFilterDisplayOption = {
        showStatusFilterMenu : true,
        showConfirmFilterMenu : false,
        showReleaseFilerMenu : false,
        showProdTypeFilterMenu : false,
        showStopProdFilterMenu : false
    };

    $scope.formMenuDisplayOption = {
        '100-add': {display: true, name: '新增', uuid: ''},
        '101-delete': {display: true, name: '删除', uuid: ''},
        '102-edit': {display: true, name: '编辑', uuid: ''},
        '103-copy': {display: false, name: '复制', uuid: ''},
        '104-status': {display: true, name: '启用', uuid: ''},
        '105-confirm': {display: false, name: '审核', uuid: ''},
        '106-release': {display: false, name: '发布', uuid: ''},

        '200-cancel': {display: true, name: '取消新增', uuid: ''},
        '201-save': {display: true, name: '保存', uuid: ''},

        '300-add': {display: false, name: '新增节点', uuid: ''},
        '301-delete': {display: false, name: '删除节点', uuid: ''},
        '302-save': {display: true, name: '保存', uuid: ''},
        '303-cancel': {display: true, name: '取消修改', uuid: ''},
        '304-quit': {display: true, name: '退出编辑', uuid: ''}
    };

    $scope.refreshAllEntities = function() {
        FunctionService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.status, $scope.searchKeyword).success(function(data) {
            $scope.allEntities = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.listTabSelected = function() {
        $scope.refreshAllEntities();
        $scope.selectedItem = null;
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };

    $scope.formTabSelected = function() {

    };

    $scope.editItem = function(group) {
        $scope.selectedItem = group;
        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);

        $scope.showFunctionGroups($scope.selectedItem);
    };

    $scope.showFunctionGroups = function(func) {
        GroupFunctionService.get(func.uuid).success(function(data) {
            func.funcGroupList = data;
        });
    };

    $scope.exitModifyMenuAction = function() {
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.addFunctionGroup = function() {
        $mdDialog.show({
            controller: 'GroupListController',
            templateUrl: 'app/src/app/auth/function/addGroupDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
            }
        }).then(function(data) {
            GroupFunctionService.add($scope.selectedItem.uuid, data.selectedGroup.uuid).success(function(data) {
                $scope.selectedItem.funcGroupList = $scope.selectedItem.funcGroupList || [];
                $scope.selectedItem.funcGroupList.push(data);
            }).error(function() {
                $scope.showError("新增角色失败，该角色可能已存在。")
            })
        });
    };

    $scope.deleteFunctionGroup = function(functionGroup) {
        GroupFunctionService.delete(functionGroup.uuid).success(function() {
            $scope.selectedItem.funcGroupList.splice($scope.selectedItem.funcGroupList.indexOf(functionGroup), 1);
        })
    };

    $scope.preAddMenuAction = function() {
        $scope.selectedItem = {};
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);

    };

    $scope.addMenuAction = function() {
        FunctionService.add($scope.selectedItem).success(function(data) {
            $scope.selectedItem = data;
            $scope.allEntities.content.push(data);
            $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
            $scope.showInfo("新增角色信息成功。");
        }).error(function() {
            $scope.showError("新增角色信息失败, 该角色可能已存在。");
        })
    };

    $scope.modifyMenuAction = function() {
        FunctionService.modify($scope.selectedItem).success(function(data) {
            $scope.showInfo("修改角色信息成功。");
        }).error(function() {
            $scope.showError("修改角色信息失败。");
        });
    };

    $scope.cancelModifyMenuAction = function() {
        FunctionService.get($scope.selectedItem.uuid).success(function(data) {
            $scope.selectedItem = data;
            $scope.showFunctionGroups($scope.selectedItem);
        });
    };

    $scope.cancelAddMenuAction = function() {
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
    };

    $scope.deleteMenuAction = function() {
        $scope.showConfirm('确认删除吗？', '删除的职能不可恢复。', function() {
            FunctionService.delete($scope.selectedItem.uuid).success(function(data) {
                $scope.showInfo("删除职能信息成功。");
                $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
            }).error(function() {
                $scope.showError("删除职能信息失败。");
            });
        });

    };

    //Set menu names
    $scope.$watchCollection('selectedItem.status', function() {
        if ($scope.selectedItem) {
            if ($scope.selectedItem.status == '1') {
                $scope.formMenuDisplayOption['104-status'].name = '禁用';
            } else if ($scope.selectedItem.status == '2') {
                $scope.formMenuDisplayOption['104-status'].name = '启用';
            }
        }
    });

    $scope.statusMenuAction = function() {
        if($scope.selectedItem.status == '1') {
            $scope.selectedItem.status = '2';
        } else {
            $scope.selectedItem.status = '1';
        }
        $scope.modifyMenuAction();
    }
});


angular.module('IOne-Production').controller('GroupListController', function($scope, $mdDialog, GroupService) {
    GroupService.getAll(10000, 0).success(function(data) {
        $scope.allGroups = data.content;
    });

    $scope.selectedGroup = {
        uuid: ''
    };

    $scope.hideDlg = function() {
        $mdDialog.hide({
            'selectedGroup' : $scope.selectedGroup
        });
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});