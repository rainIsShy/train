angular.module('IOne-Production').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/cbi/employee', {
        controller: 'EmployeeController',
        templateUrl: 'app/src/app/cbi/employee/employee.html'
    })
}]);

angular.module('IOne-Production').controller('EmployeeController', function ($scope, $q, CBIEmployeeService, $mdDialog, Constant, UserRoleService, UserService, OCMChannelService, SYSMapsService, Upload, $timeout) {
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
        $scope.selectedItem.employeeImg = $scope.getEmployeeImageFullPath(item.picPath, item.sex);
        item.detailList = $scope.subItemList;

        $scope.changeButtonStatusSingle(item);

        UserService.getUser(item.uuid, 3).success(function (data) {
            item.user = data.content[0];

            UserRoleService.get(item.user.uuid).success(function (data) {
                item.user.userRoleList = data;
            });
        });

        SYSMapsService.getAll(1, 0, 'TIPTOP', 'Empl01', item.uuid, $scope.RES_UUID_MAP.CBI.EMPL.RES_UUID).success(function (data) {
            item.mappedAccount = data.content[0];
        });

    };


    $scope.returnToListAction = function (event, item) {
        $scope.stopEventPropagation(event);
        $scope.selectedItem = null;
        $scope.changeButtonStatusAll();
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
        if ($scope.source.confirm == '2' && $scope.source.status == '2') {
            $scope.showError("不允许状态是已审核又无效,请调整后再保存");
            return;
        }
        if ($scope.status == 'add') {
            if ($scope.domain == 'CBI_BASE_EMPL') {
                if ($scope.source.leaveDate != null && $scope.source.arriveDate != null && $scope.source.arriveDate > $scope.source.leaveDate) {
                    $scope.showError("离职日不能大于到职日,请修改后保存");
                    return;
                }
                if ($scope.source.leaveDate != null && $scope.source.leaveDate < new Date() && $scope.source.employeeStatus != '2') {
                    $scope.showError("离职日小于当前时间,若该员工已离职,请将员工状态设为离职后保存");
                    return;
                }
                CBIEmployeeService.add($scope.source).success(function (data) {
                    $scope.showInfo('新增数据成功。');
                }).error(function (response) {
                    $scope.showError('新增数据失败: ' + response.message);
                });
            }
        } else if ($scope.status == 'edit') {
            if ($scope.domain == 'CBI_BASE_EMPL') {
                if ($scope.source.leaveDate != null && $scope.source.arriveDate != null && $scope.source.arriveDate > $scope.source.leaveDate) {
                    $scope.showError("离职日不能大于到职日,请修改后保存");
                    return;
                }
                if ($scope.source.leaveDate != null && $scope.source.leaveDate < new Date() && $scope.source.employeeStatus != '2') {
                    $scope.showError("离职日小于当前时间,若该员工已离职,请将员工状态设为离职后保存");
                    return;
                }
                $scope.source.password = null;
                CBIEmployeeService.modify($scope.source.uuid, $scope.source).success(function (data) {
                    $scope.showInfo('修改数据成功。');
                    $scope.source = data;
                    $scope.selectedItem = data;
                    $scope.selectedItemBackUp = angular.copy($scope.selectedItem);
                }).error(function (response) {
                    $scope.showError('修改数据失败: ' + response.message);
                    $scope.source = angular.copy($scope.selectedItemBackUp);
                    $scope.selectedItem = angular.copy($scope.selectedItemBackUp);
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
                $scope.showInfo('审核成功。');
            }).error(function (response) {
                $scope.showError('审核失败: ' + response.message);
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
                $scope.showInfo('取消审核成功。');
            }).error(function (response) {
                $scope.showError('取消审核失败: ' + response.message);
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
            }, function () {
                item.confirm = Constant.CONFIRM[2].value
            });
        } else if (item.confirm == 1) {
            if (item.status == Constant.STATUS[2].value) {
                $scope.showWarn("项目是失效状态,请先启用后再审核");
                item.confirm = Constant.CONFIRM[2].value;
                return;
            }
            $scope.showConfirm('确认审核吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    confirm: Constant.CONFIRM[2].value
                };
                CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                item.confirm = Constant.CONFIRM[1].value;
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
                status: Constant.STATUS[2].value,
                confirm: Constant.CONFIRM[1].value
            };
            CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                $scope.selectedItem.status = Constant.STATUS[2].value;
                $scope.selectedItem.confirm = Constant.CONFIRM[1].value;
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
            }, function () {
                item.status = Constant.STATUS[2].value;
            });
        } else if (item.status == 1) {
            $scope.showConfirm('确认修改启用状态为无效吗？', '', function () {
                var EmployeeUpdateInput = {
                    uuid: item.uuid,
                    status: Constant.STATUS[2].value,
                    confirm: Constant.CONFIRM[1].value
                };
                CBIEmployeeService.modify(EmployeeUpdateInput.uuid, EmployeeUpdateInput).success(function () {
                    item.confirm = Constant.CONFIRM[1].value;
                    $scope.changeButtonStatusAll();
                    $scope.showInfo('修改数据成功。');
                });
            }, function () {
                item.status = Constant.STATUS[1].value;
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
                            status: Constant.STATUS[2].value,
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
        if (employee.confirm == 1 || employee.confirm == 4) {
            $scope.confirmRevertClick = 1;
        }

        // 已审核和审核中状态的单据
        if (employee.confirm == 2 || employee.confirm == 3) {
            $scope.confirmClick = 1;
            //$scope.statusRevertClick = 1;
            $scope.deleteClick = 1;
        }

        //有效单据
        if (employee.status == 1) {
            $scope.statusClick = 1;
        }

        //无效单据
        if (employee.status == 2) {
            $scope.statusRevertClick = 1;
            $scope.confirmClick = 1;
            $scope.deleteClick = 1;
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
            $scope.deleteAllClick = 1;
            //$scope.statusRevertAllClick = 1;
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


    $scope.addUserRole = function () {
        $mdDialog.show({
            controller: 'RoleListController',
            templateUrl: 'app/src/app/auth/user/addRoleDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {}
        }).then(function (data) {
            UserRoleService.add($scope.selectedItem.user.uuid, data.selectedRole.uuid).success(function (data) {
                $scope.selectedItem.user.userRoleList = $scope.selectedItem.user.userRoleList || [];
                $scope.selectedItem.user.userRoleList.push(data);
            }).error(function () {
                $scope.showError("新增角色失败，该角色可能已存在。")
            })
        });
    };

    $scope.deleteUserRole = function (userRole) {
        UserRoleService.delete(userRole.uuid).success(function () {
            $scope.selectedItem.user.userRoleList.splice($scope.selectedItem.user.userRoleList.indexOf(userRole), 1);
        })
    };

    //图片路径
    $scope.getEmployeeImageFullPath = function (path, sex) {
        if (path == null || path == undefined) {
            if (sex == 1) {
                return Constant.BACKEND_BASE + '/app/img/male.png';
            } else if (sex == 2) {
                return Constant.BACKEND_BASE + '/app/img/female.png';
            } else {
                return Constant.BACKEND_BASE + '/app/img/unknown.png';
            }
        }
        if (path && path.indexOf('IMAGE') == 0) {
            return Constant.BACKEND_BASE + '/app/assets/' + path;
        } else {
            return Constant.BACKEND_BASE + '/app/assets/IMAGE/' + path;
        }
    };

    //上传图片
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
                        if ($scope.selectedItem && $scope.selectedItem.uuid) {
                            CBIEmployeeService.addImage($scope.selectedItem.uuid, data.uuid).success(function (response) {
                                $scope.showInfo("上传成功");
                                $scope.selectedItem.employeeImg = $scope.getEmployeeImageFullPath(response.picPath, response.sex) + '?time=' + new Date().getTime();
                            });
                        }
                    });
                });
            }
        }
    };

    $scope.maintainMappedAccount = function (selectedItem) {
        $mdDialog.show({
            controller: 'maintainMappedController',
            templateUrl: 'app/src/app/cbi/employee/maintainMappedDlg.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                selectedItem: selectedItem
            }
        }).then(function (editingItem) {
            if (editingItem.isModifyMappedAccount == false) {
                var Input = {
                    sysType: editingItem.mappedAccount.sysType,
                    moduleType: editingItem.mappedAccount.moduleType,
                    sourceTable: editingItem.mappedAccount.sourceTable,
                    targetValue: editingItem.mappedAccount.targetValue,
                    sourceValueUuid: editingItem.uuid
                }
                SYSMapsService.add(Input).success(function (data) {
                    $scope.showInfo("新增成功");
                    editingItem.mappedAccount.uuid=data.uuid;
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            } else if (editingItem.isModifyMappedAccount == true) {
                var Input = {targetValue: editingItem.mappedAccount.targetValue}
                SYSMapsService.modify(editingItem.mappedAccount.uuid, Input).success(function (data) {
                    $scope.showInfo("更新成功");
                }).error(function (response) {
                    $scope.showError(response.message);
                });
            }
        });
    };

    $scope.deleteMappedAccount = function (mappedAccount) {
        SYSMapsService.delete(mappedAccount.uuid).success(function () {
            $scope.showInfo("删除成功");
            $scope.selectedItem.mappedAccount='';
            $scope.selectedItem.isModifyMappedAccount=false;
            console.info($scope.selectedItem);
        })
    };

});


angular.module('IOne-Production').controller('maintainMappedController', function($scope, $mdDialog, selectedItem) {
    $scope.selectedItem = selectedItem;

    if (angular.isUndefined($scope.selectedItem.mappedAccount) || $scope.selectedItem.mappedAccount == null  || $scope.selectedItem.mappedAccount =='') {
        $scope.selectedItem.mappedAccount = {
            sysType:'TIPTOP',
            moduleType: 'Empl01',
            sourceTable: 'CBI_BASE_EMPL',
            targetValue: ''
        };
        $scope.selectedItem.isModifyMappedAccount = false;
    } else {
        $scope.selectedItem.isModifyMappedAccount = true;
    };

    $scope.hideDlg = function() {
        $mdDialog.hide($scope.selectedItem);
    };

    $scope.cancelDlg = function() {
        if($scope.selectedItem.isModifyMappedAccount == false){$scope.selectedItem.mappedAccount=''}
        $mdDialog.cancel();
    };
});