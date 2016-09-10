angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/cbi/employee_password', {
        controller: 'EmployeePasswordController',
        templateUrl: 'app/src/app/cbi/employee_password/employeePassword.html'
    })
}]);

angular.module('IOne-Production').controller('EmployeePasswordController', function ($scope, $q, CBIEmployeeService, $mdDialog, Constant, UserRoleService, UserService, Upload, $timeout) {
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
        '401-confirm': {display: true, name: '审核', uuid: '7D4C1949-3F26-4D1A-A2F9-3A14EC43477C'},
        '402-confirmRevert': {display: true, name: '取消审核', uuid: '04CB1CE7-CD5B-46A5-812E-60C873B2571B'},
        '403-status': {display: true, name: '启用', uuid: '52A51292-D1E1-4084-A87D-0639666E5388'},
        '404-statusRevert': {display: true, name: '取消启用', uuid: 'BBF38AA3-0ED9-4098-BC1F-434271821455'},
        '405-delete': {display: true, name: '删除', uuid: '0C96DB72-F8B5-4B58-AB6B-04368DCA20EE'},
        '406-query': {display: true, name: '查询', uuid: '7E4A01CB-7E11-416C-81B0-42703F83ECE9'},

        '411-confirmAll': {display: true, name: '批量审核', uuid: 'E4ADE57D-2DF6-43CA-AEE1-D7324C1600C1'},
        '412-confirmRevertAll': {display: true, name: '批量取消审核', uuid: '3046A5DE-DD86-4FF1-8106-C9CD93E6CC37'},
        '413-statusAll': {display: true, name: '批量启用', uuid: 'EAA2BA2A-9ED0-4B68-9ED4-6D857A8AFCC4'},
        '414-statusRevertAll': {display: true, name: '批量取消启用', uuid: '8009C97B-2EE4-4E14-8EDB-D0068596C260'},
        '415-deleteAll': {display: true, name: '批量删除', uuid: '1D308CCF-3533-424F-B5F0-ADD1D17971BF'},
    };

    $scope.refreshList = function () {
        CBIEmployeeService.getAll($scope.pageOption.sizePerPage, $scope.pageOption.currentPage, $scope.listFilterOption.confirm, $scope.listFilterOption.status,
            $scope.theMax, $scope.RES_UUID_MAP.CBI.EMPL.RES_UUID).success(function (data) {
            $scope.itemList = data.content;
            $scope.pageOption.totalPage = data.totalPages;
            $scope.pageOption.totalElements = data.totalElements;

            $scope.resetButtonDisabled();
            $scope.selectAllFlag = false;
            $scope.selected = [];

        });
    };

    $scope.getMenuAuthData($scope.RES_UUID_MAP.CBI.EMPL.RES_UUID).success(function (data) {
        $scope.menuAuthDataMap = $scope.menuDataMap(data);
    });

    $scope.$watch('listFilterOption', function () {
        $scope.pageOption.currentPage = 0;
        $scope.pageOption.totalPage = 0;
        $scope.pageOption.totalElements = 0;
        $scope.refreshList();
    }, true);

    $scope.selectAllFlag = false;

    /**
     * Show left detail panel when clicking the title
     */
    $scope.showDetailPanelAction = function (item) {
        $scope.selectedItem = item;
        item.detailList = $scope.subItemList;

        $scope.changeButtonStatusSingle(item);

        UserService.getUser(item.uuid, 3).success(function (data) {
            item.user = data.content[0];
        });

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
            if ($scope.domain == 'CBI_BASE_EMPL') {
                CBIEmployeeService.add($scope.source).success(function (data) {
                    $scope.showInfo('新增数据成功。');
                }).error(function () {
                    $scope.showError('新增失败。');
                });

            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'CBI_BASE_EMPL') {
                CBIEmployeeService.modify($scope.source.uuid, $scope.source).success(function (data) {
                    $scope.showInfo('修改数据成功。');
                }).error(function () {
                    $scope.showError('修改失败。');
                });
            }
        }
    };

    $scope.confirmClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认审核吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                confirm: Constant.CONFIRM[2].value
            };
            CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.confirm = Constant.CONFIRM[2].value;
                $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    $scope.confirmRevertClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认取消审核吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                confirm: Constant.CONFIRM[1].value
            };
            CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.confirm = Constant.CONFIRM[1].value;
                 $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    $scope.confirmSwitchAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.confirm == 2) {
            $scope.showConfirm('确认取消审核吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[1].value
                };
                CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            });
        } else if (item.confirm == 1) {
            $scope.showConfirm('确认审核吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[2].value
                };
                CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            });
        }

    };


    $scope.statusClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                status: Constant.STATUS[1].value
            };
            CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.status = Constant.STATUS[1].value;
                 $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            });
        });
    };

    $scope.statusRevertClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
            var EmployeeUpdateInput = {
                uuid: item.uuid,
                status: Constant.STATUS[2].value
            };
            CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.status = Constant.STATUS[2].value;
                 $scope.changeButtonStatusSingle($scope.selectedItem);
                $scope.showInfo('修改数据成功。');
            });
        });
    };


    $scope.statusSwithAction = function (event, item) {
        $scope.stopEventPropagation(event);
        if (item.status == 2) {
            $scope.showConfirm('确认修改启用状态为有效吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[1].value
                };
                CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            });
        } else if (item.status == 1) {
            $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[2].value
                };
                CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            });
        }
    };


    $scope.deleteClickAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.showConfirm('确认删除吗？', '删除后不可恢复。', function () {
            CBIEmployeeService.delete(item.uuid).success(function () {
                $scope.selectedItem = null;
                $scope.refreshList();
                $scope.showInfo('删除数据成功。');
            });
        });
    };


    $scope.confirmAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量审核吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            confirm: Constant.CONFIRM[2].value
                        };
                        var response = CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };

    $scope.confirmRevertAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量取消审核吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            confirm: Constant.CONFIRM[1].value
                        };
                        var response = CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };

    $scope.statusAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量修改启用状态为有效吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            status: Constant.STATUS[1].value
                        };
                        var response = CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
                    });
                }
            });
        }
    };

    $scope.statusRevertAllClickAction = function (event) {
        $scope.stopEventPropagation(event);
        if ($scope.selected.length > 0) {
            $scope.showConfirm('确认批量修改启用状态为无效吗？', '', function () {
                if ($scope.selected) {
                    var promises = [];
                    angular.forEach($scope.selected, function (item) {
                        var EmployeeUpdateInput = {
                            uuid: item.uuid,
                            status: Constant.STATUS[2].value
                        };
                        var response = CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function (data) {
                        });
                        promises.push(response);
                    });
                    $q.all(promises).then(function () {
                        $scope.showInfo('修改数据成功。');
                        $scope.refreshList();
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
                        var response = CBIEmployeeService.delete(item.uuid).success(function (data) {
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
        $scope.confirmClick = 0;
        $scope.confirmRevertClick = 0;
        $scope.statusClick = 0;
        $scope.statusRevertClick = 0;
        $scope.deleteClick = 0;

    };

    $scope.resetButtonDisabledAll = function () {
        $scope.deleteAllClick = 0;
        $scope.statusRevertAllClick = 0;
        $scope.statusAllClick = 0;
        $scope.confirmRevertAllClick = 0;
        $scope.confirmAllClick = 0;
    };

    $scope.changeButtonStatusAll = function () {
        $scope.resetButtonDisabledAll();
        angular.forEach($scope.selected, function (employee) {
            $scope.processChangeButtonStatusAll(employee);
        });
    };

    $scope.changeButtonStatusSingle = function (employee) {
        $scope.resetButtonDisabled();
        $scope.processChangeButtonStatus(employee);
    };

    $scope.processChangeButtonStatus = function (employee) {
        //confirm:1=未审核/2=已审核/3=审核中/4=退回   status:"1=有效/2=无效
        // 未审核和退回状态的单据
        if (employee.confirm == 1 || employee.item == 4) {
            $scope.confirmRevertClick = 1;
        }

        // 已审核和审核中状态的单据
        if (employee.confirm == 2 || employee.item == 3) {
            $scope.confirmClick = 1;
            $scope.statusRevertClick = 1;
        }

        //有效单据
        if (employee.status == 1) {
            $scope.statusClick = 1;
        }

        //无效单据
        if (employee.status == 2) {
            $scope.statusRevertClick = 1;
            $scope.confirmClick = 1;

        }
    };

      $scope.processChangeButtonStatusAll = function (employee) {
        //confirm:1=未审核/2=已审核/3=审核中/4=退回   status:"1=有效/2=无效
        // 未审核和退回状态的单据
        if (employee.confirm == 1 || employee.item == 4) {
            $scope.confirmRevertAllClick = 1;
        }

        // 已审核和审核中状态的单据
        if (employee.confirm == 2 || employee.item == 3) {
            $scope.confirmAllClick = 1;

            $scope.statusRevertAllClick = 1;
        }

        //有效单据
        if (employee.status == 1) {
            $scope.statusAllClick = 1;
        }

        //无效单据
        if (employee.status == 2) {
            $scope.statusRevertAllClick = 1;
            $scope.confirmAllClick = 1;
        }
    };

    $scope.showUserRoles = function (user) {
        if (user.baseUser == undefined) {
            UserService.getUser(user.uuid, 3).success(function (data) {
                user.baseUser = data.content[0];

                UserRoleService.get(user.baseUser.uuid).success(function (data) {
                    user.userRoleList = data;
                });
            });
        }
    };

    $scope.changeCurrentUserPw = function(selectedItem) {
        $mdDialog.show({
            controller: 'ChangeCurrentEmployeePwController',
            templateUrl: 'app/src/app/cbi/employee_password/changePassword.html',
            parent: angular.element(document.body),
            targetEvent: event
        }).then(function(data) {
            $scope.userPassword = data;
            $scope.userPassword.name = selectedItem.no;
            UserService.modifyPassword($scope.userPassword).success(function() {
                             $scope.showInfo('修改密码成功。');
                    }).error(function(data) {
                           $scope.showError(data.message);
                    });
        });
    };


});

angular.module('IOne-Production').controller('ChangeCurrentEmployeePwController', function ($scope, $mdDialog) {
    $scope.user = null;
    $scope.hideDlg = function() {
        if($scope.user == null){
            toastr["error"]("请输入新密码");
        }else{
               if($scope.user.newPassword == null){
                    toastr["error"]("新密码为空");
                }else{
                    $mdDialog.hide($scope.user);
                }
        }
    };

    $scope.cancelDlg = function() {
        $mdDialog.cancel();
    };
});
