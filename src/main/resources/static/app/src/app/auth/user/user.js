angular.module('IOne-Production').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/auth/user', {
        controller: 'UserController',
        templateUrl: 'app/src/app/auth/user/user.html'
    })
}]);

angular.module('IOne-Production').controller('UserController', function($scope, $http, $mdDialog, Constant, UserService, GroupUserService, UserRoleService) {
    $scope.pageOption = {
        sizePerPage: 20,
        currentPage: 0,
        totalPage: 0,
        totalElements: 10,
        displayModel: 0  //0 : image + text //1 : image
    };

    $scope.listFilterOption = {
        status :  Constant.STATUS[0].value
    };

    $scope.$watch('listFilterOption', function() {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshAllUsers();
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

    $scope.userType = 1;
    $scope.refreshAllUsers = function() {
        GroupUserService.query($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.status, $scope.searchKeyword).success(function(data) {
            $scope.allUsers = data;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.listTabSelected = function() {
        $scope.refreshAllUsers();
        $scope.selectedItem = null;
        $scope.changeViewStatus(Constant.UI_STATUS.VIEW_UI_STATUS, 0);
    };

    $scope.formTabSelected = function() {

    };

    $scope.editItem = function(data) {
        $scope.selectedItem = data;

        if (angular.isUndefined($scope.selectedItem.salesFlag) || $scope.selectedItem.salesFlag == null) {
            $scope.selectedItem.salesFlag = '2';
        } else {
            $scope.selectedItem.salesFlag = ($scope.selectedItem.salesFlag == 'Y') ? 1 : 2;
        }

        if (angular.isUndefined($scope.selectedItem.merchandiserFlag) || $scope.selectedItem.merchandiserFlag == null) {
            $scope.selectedItem.merchandiserFlag = '2';
        } else {
            $scope.selectedItem.merchandiserFlag = ($scope.selectedItem.merchandiserFlag == 'Y') ? 1 : 2;
        }

        $scope.changeViewStatus(Constant.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
        $scope.showUserRoles($scope.selectedItem);
    };

    $scope.showUserRoles = function(user) {
        if(user.baseUser == undefined) {
            UserService.getUser(user.uuid, 1).success(function(data) {
                user.baseUser = data.content[0];

                UserRoleService.get(user.baseUser.uuid).success(function(data) {
                    user.userRoleList = data;
                });
            });
        }
    };

    $scope.exitModifyMenuAction = function() {
        $scope.changeViewStatus($scope.UI_STATUS.PRE_EDIT_UI_STATUS, 1);
    };

    $scope.addUserRole = function() {
        $mdDialog.show({
            controller: 'RoleListController',
            templateUrl: 'app/src/app/auth/user/addRoleDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
            }
        }).then(function(data) {
            UserRoleService.add($scope.selectedItem.baseUser.uuid, data.selectedRole.uuid).success(function(data) {
                $scope.selectedItem.userRoleList = $scope.selectedItem.userRoleList || [];
                $scope.selectedItem.userRoleList.push(data);
            }).error(function() {
                $scope.showError("新增角色失败，该角色可能已存在。")
            })
        });
    };

    $scope.deleteUserRole = function(userRole) {
        UserRoleService.delete(userRole.uuid).success(function() {
            $scope.selectedItem.userRoleList.splice($scope.selectedItem.userRoleList.indexOf(userRole), 1);
        })
    };

    $scope.preAddMenuAction = function() {
        $scope.selectedItem = {};

        if (angular.isUndefined($scope.selectedItem.salesFlag) || $scope.selectedItem.salesFlag == null) {
            $scope.selectedItem.salesFlag = '2';
        }

        if (angular.isUndefined($scope.selectedItem.merchandiserFlag) || $scope.selectedItem.merchandiserFlag == null) {
            $scope.selectedItem.merchandiserFlag = '2';
        }

        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_ADD, 1);

    };

    $scope.checkPassword = function() {
        if($scope.selectedItem.password || $scope.selectedItem.confirmPassword) {
            if($scope.selectedItem.password != $scope.selectedItem.confirmPassword) {
                return false;
            }
        }
        return true;
    };

    $scope.addMenuAction = function() {
        GroupUserService.add($scope.selectedItem).success(function(data) {
            $scope.selectedItem = data;

            UserService.getUser($scope.selectedItem.uuid, 1).success(function(data) {
                $scope.selectedItem.baseUser = data.content[0];
            });
            $scope.allUsers.content.push(data);
            $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_MODIFY, 1);
            $scope.showInfo("新增用户信息成功。");
        }).error(function(response) {
            $scope.showError($scope.getAllError(response));
        })
    };

    $scope.modifyMenuAction = function() {
        GroupUserService.modify($scope.selectedItem).success(function(data) {
            $scope.showInfo("修改用户信息成功。");
        }).error(function(response) {
            $scope.showError($scope.getAllError(response));
        });
    };

    $scope.cancelModifyMenuAction = function() {
        GroupUserService.get($scope.selectedItem.uuid).success(function(data) {
            $scope.selectedItem = data;
            $scope.showUserRoles($scope.selectedItem);
        });
    };

    $scope.cancelAddMenuAction = function() {
        $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
    };

    $scope.deleteMenuAction = function() {
        $scope.showConfirm('确认删除吗？', '删除的用户不可恢复。', function() {
            GroupUserService.delete($scope.selectedItem.uuid).success(function(data) {
                $scope.showInfo("删除用户信息成功。");
                $scope.changeViewStatus($scope.UI_STATUS.EDIT_UI_STATUS_DELETE, 0);
            }).error(function() {
                $scope.showError("删除用户信息失败。");
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
    };

    $scope.openDepartmentDlg = function () {
        $mdDialog.show({
            controller: 'AuthUserDepartmentSelectController',
            templateUrl: 'app/src/app/auth/user/selectDepartment.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function (data) {
            $scope.selectedItem.department = data;
            $scope.selectedItem.departmentUuid = data.uuid;
        });
    };
});


angular.module('IOne-Production').controller('RoleListController', function($scope, $mdDialog, RoleService) {
    RoleService.getAll(10000, 0).success(function(data) {
        $scope.allRoles = data.content;
    });

    $scope.selectedRole = {
        uuid: ''
    };

    $scope.hideDlg = function() {
        $mdDialog.hide({
            'selectedRole' : $scope.selectedRole
        });
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});

angular.module('IOne-Production').controller('AuthUserDepartmentSelectController', function ($scope, $mdDialog, Department) {
    $scope.pageOption = {
        sizePerPage: 5,
        currentPage: 0,
        totalPage: 0,
        totalElements: 0
    };

    $scope.filter = {
        confirm: '',
        status: '1',
        searchKeyWord: ''
    }

    $scope.refresh = function () {
        Department.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.filter).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;
        });
    };

    $scope.refresh();

    $scope.select = function (item) {
        $scope.item = item;
        $mdDialog.hide($scope.item);
    };

    $scope.hideDlg = function () {
        $mdDialog.hide($scope.item);
    };

    $scope.cancelDlg = function () {
        $mdDialog.cancel();
    };
});
